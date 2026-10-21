"use server";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { clearSessionCookie, setSessionCookie, verifyPassword, STAFF_ROLES } from "./auth";
import { audit } from "./audit";

export interface LoginState {
  error?: string;
}

// 간단한 메모리 기반 로그인 시도 제한 (프로세스 단위)
const attempts = new Map<string, { n: number; until: number }>();

async function login(fd: FormData, area: "admin" | "partner"): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const a = attempts.get(email);
  if (a && a.until > Date.now()) return { error: "로그인 시도가 많습니다. 5분 후 다시 시도해 주세요." };
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const ok = !!user && user.active && (await verifyPassword(password, user.passwordHash));
  const allowed = ok && (area === "admin" ? STAFF_ROLES.includes(user!.role) : user!.role === "BREWERY_ADMIN");
  if (!allowed) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(email, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  attempts.delete(email);
  await prisma.user.update({ where: { id: user!.id }, data: { lastLoginAt: new Date() } });
  setSessionCookie(user!.id);
  await audit(user!, "LOGIN", "User", user!.id);
  redirect(area === "admin" ? "/admin" : "/partner");
}

export async function adminLogin(_s: LoginState, fd: FormData) {
  return login(fd, "admin");
}

export async function partnerLogin(_s: LoginState, fd: FormData) {
  return login(fd, "partner");
}

export async function logout(fd: FormData) {
  clearSessionCookie();
  redirect(fd.get("area") === "partner" ? "/partner/login" : "/admin/login");
}
