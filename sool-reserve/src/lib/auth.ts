import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "./db";

const COOKIE = "sr_session";
const MAX_AGE = 60 * 60 * 8; // 8시간

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET 환경변수(32자 이상)가 필요합니다.");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: string; exp: number };
    return data.exp > Date.now() ? data.uid : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(userId: string) {
  cookies().set(COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE);
}

export async function getCurrentUser() {
  const uid = readSessionToken(cookies().get(COOKIE)?.value);
  if (!uid) return null;
  const user = await prisma.user.findUnique({ where: { id: uid }, include: { brewery: true } });
  return user && user.active ? user : null;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "CURATOR", "FINANCE"];

export async function requireStaff(roles: Role[] = STAFF_ROLES): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !STAFF_ROLES.includes(user.role)) redirect("/admin/login");
  if (!roles.includes(user.role)) redirect("/admin?denied=1");
  return user;
}

export async function requirePartner(): Promise<CurrentUser & { breweryId: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "BREWERY_ADMIN" || !user.breweryId) redirect("/partner/login");
  return user as CurrentUser & { breweryId: string };
}

export async function isStaffSession(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user && STAFF_ROLES.includes(user.role);
}
