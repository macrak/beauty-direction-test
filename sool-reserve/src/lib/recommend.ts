// 취향 추천 — DB의 실제 상품 정보만 사용. 맛 정보가 없는 축은 점수에 반영하지 않는다.
import type { PublicProduct } from "./catalog";

export interface TasteAnswers {
  tastes: string[]; // sweet | dry | acidic | aromatic | full | sparkling | smooth
  types: string[]; // LiquorType 값
  food?: string; // 페어링 카테고리
  purpose?: "self" | "gift";
  budgetMin?: number;
  budgetMax?: number;
}

export interface Recommendation {
  product: PublicProduct;
  score: number;
  reasons: string[];
}

const TASTE_RULES: Record<string, { label: string; fit: (p: PublicProduct) => number | null }> = {
  sweet: { label: "단맛", fit: (p) => (p.tasteSweetness === null ? null : (p.tasteSweetness - 1) / 4) },
  dry: { label: "드라이함", fit: (p) => (p.tasteSweetness === null ? null : (5 - p.tasteSweetness) / 4) },
  acidic: { label: "산미", fit: (p) => (p.tasteAcidity === null ? null : (p.tasteAcidity - 1) / 4) },
  aromatic: { label: "풍부한 향", fit: (p) => (p.tasteAroma === null ? null : (p.tasteAroma - 1) / 4) },
  full: { label: "바디감", fit: (p) => (p.tasteBody === null ? null : (p.tasteBody - 1) / 4) },
  sparkling: { label: "탄산감", fit: (p) => (p.tasteCarbonation === null ? null : (p.tasteCarbonation - 1) / 4) },
  smooth: { label: "부드러움", fit: (p) => (p.flavorTags.includes("부드러운") ? 1 : 0) },
};

// 받침 유무에 따라 조사 선택 (이/가, 과/와)
export function withJosa(word: string, withBatchim: string, without: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${has ? withBatchim : without}`;
}

export function recommend(products: PublicProduct[], a: TasteAnswers, limit = 6): Recommendation[] {
  const scored: Recommendation[] = [];
  for (const p of products) {
    if (a.budgetMin !== undefined && (p.price === null || p.price < a.budgetMin)) continue;
    if (a.budgetMax !== undefined && (p.price === null || p.price > a.budgetMax)) continue;
    let score = 0;
    const reasons: string[] = [];
    for (const t of a.tastes) {
      const rule = TASTE_RULES[t];
      const fit = rule?.fit(p);
      if (fit === null || fit === undefined) continue;
      score += fit * 3;
      if (fit >= 0.75) reasons.push(`${withJosa(rule.label, "이", "가")} 두드러집니다`);
    }
    if (a.types.length && a.types.includes(p.liquorType)) {
      score += 2;
      reasons.push("선호하신 주종입니다");
    }
    if (a.food && p.pairingCategories.includes(a.food)) {
      score += 1.5;
      reasons.push(`${withJosa(a.food, "과", "와")} 잘 어울립니다`);
    }
    if (a.purpose === "gift" && p.giftPurposes.length > 0) {
      score += 1;
      reasons.push("선물용 구성이 준비되어 있습니다");
    }
    if (score > 0) scored.push({ product: p, score: Math.round(score * 10) / 10, reasons });
  }
  return scored.sort((x, y) => y.score - x.score).slice(0, limit);
}
