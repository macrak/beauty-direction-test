import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { getSettings } from "./settings";

export const ARTICLE_CATEGORY = {
  STORY: { label: "명주 이야기", en: "Story" },
  INTERVIEW: { label: "장인 인터뷰", en: "Interview" },
  GIFT_GUIDE: { label: "선물 가이드", en: "Gift Guide" },
  PAIRING: { label: "페어링", en: "Pairing" },
  GUIDE: { label: "보관 · 음용 가이드", en: "Guide" },
  TRAVEL: { label: "양조장 탐방", en: "Travel" },
} as const;

export type ArticleCategoryKey = keyof typeof ARTICLE_CATEGORY;

export const AD_CHECKS = [
  { key: "adCheckNoGlamour", label: "음주 미화·과음 조장·음주 장면 연출 표현이 없습니다" },
  { key: "adCheckNoMinors", label: "청소년이 등장하거나 청소년을 대상으로 하는 표현이 없습니다" },
  { key: "adCheckNoHealth", label: "건강 효능·질병 예방·치료 효과를 주장하지 않습니다" },
  { key: "adCheckWarning", label: "음주 경고문구가 함께 노출되는 영역에 게시합니다" },
  { key: "adCheckFacts", label: "수상·한정 수량·명인 칭호 등 사실관계를 확인했습니다" },
] as const;

export type AdCheckKey = (typeof AD_CHECKS)[number]["key"];

// 게시(PUBLISHED) 가능 여부 — 광고 기준 체크리스트 전부 충족해야 함
export function missingAdChecks(a: Partial<Record<AdCheckKey, boolean>>): string[] {
  return AD_CHECKS.filter((c) => !a[c.key]).map((c) => c.label);
}

export async function getPublishedArticles(where: Prisma.ArticleWhereInput = {}, take?: number) {
  const s = await getSettings();
  return prisma.article.findMany({
    where: {
      AND: [
        { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        s.showDemoData ? {} : { isDemo: false },
        where,
      ],
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: { brewery: { select: { name: true, slug: true } } },
  });
}

export type PublishedArticle = Awaited<ReturnType<typeof getPublishedArticles>>[number];

// ─── 본문 렌더링: 간이 마크다운 → 블록 (HTML 삽입 없음) ───────────────

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] };

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => l.startsWith("- "))) {
      blocks.push({ type: "ul", items: lines.map((l) => l.slice(2).trim()) });
    } else if (lines[0].startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].slice(3).trim() });
      if (lines.length > 1) blocks.push({ type: "p", text: lines.slice(1).join(" ") });
    } else if (lines.every((l) => l.startsWith(">"))) {
      blocks.push({ type: "quote", text: lines.map((l) => l.replace(/^>\s?/, "")).join(" ") });
    } else {
      blocks.push({ type: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}

export function estimateReadMinutes(body: string): number {
  return Math.max(1, Math.round(body.replace(/\s+/g, "").length / 500));
}
