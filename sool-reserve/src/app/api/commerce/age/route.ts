import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AGE_COOKIE, commerceSession, currentAgeVerification } from "@/lib/orders";
import { AGE_VERIFICATION_TTL_MS, getAgeProvider, ProviderUnavailable } from "@/lib/providers";

export async function GET() {
  const s = await commerceSession();
  if (!s.allowed) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const v = await currentAgeVerification();
  return NextResponse.json({ verified: !!v, expiresAt: v?.expiresAt ?? null, provider: v?.provider ?? null });
}

// 성인 인증 — PRIVATE_TEST에서는 Mock 공급자, 결과는 성인 여부·시각·거래ID만 저장
export async function POST() {
  const s = await commerceSession();
  if (!s.allowed) return NextResponse.json({ error: "not_found" }, { status: 404 });
  try {
    const provider = getAgeProvider(s.settings.salesMode);
    const r = await provider.verify();
    if (!r.ok || !r.isAdult) return NextResponse.json({ verified: false, message: "만 19세 이상만 구매할 수 있습니다." }, { status: 403 });
    const v = await prisma.ageVerification.create({
      data: { provider: provider.name, externalTx: r.externalTx, isAdult: true, expiresAt: new Date(Date.now() + AGE_VERIFICATION_TTL_MS) },
    });
    const res = NextResponse.json({ verified: true, expiresAt: v.expiresAt, provider: provider.name });
    res.cookies.set(AGE_COOKIE, v.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: AGE_VERIFICATION_TTL_MS / 1000 });
    return res;
  } catch (e) {
    if (e instanceof ProviderUnavailable) return NextResponse.json({ verified: false, message: e.message }, { status: 503 });
    throw e;
  }
}
