import type { NoticeType } from "@prisma/client";
import { prisma } from "./db";

// 시행일(effectiveFrom)이 지난 최신 버전을 현재 고지로 사용 — 시행일 0시에 자동 전환
export async function getCurrentNotice(type: NoticeType, at: Date = new Date()) {
  return prisma.legalNotice.findFirst({
    where: { type, effectiveFrom: { lte: at } },
    orderBy: { effectiveFrom: "desc" },
  });
}

export async function getCurrentNotices(types: NoticeType[], at: Date = new Date()) {
  const entries = await Promise.all(types.map(async (t) => [t, await getCurrentNotice(t, at)] as const));
  return Object.fromEntries(entries) as Record<NoticeType, Awaited<ReturnType<typeof getCurrentNotice>>>;
}

export const REQUIRED_NOTICES: NoticeType[] = ["HEALTH_WARNING", "YOUTH_NOTICE", "INTERMEDIARY", "TERMS", "PRIVACY"];
