import { SCORE_FIELDS, type ScoreKey } from "./labels";

export const MIN_SCORED_FIELDS = 5;

// 가중 평균 선별 점수 — 미평가(null) 항목은 제외, 평가 항목이 MIN_SCORED_FIELDS 미만이면 null(“미평가”)
export function curationScore(p: Partial<Record<ScoreKey, number | null>>, weights: Record<string, number>): number | null {
  let sum = 0;
  let wsum = 0;
  let n = 0;
  for (const { key } of SCORE_FIELDS) {
    const v = p[key];
    if (v === null || v === undefined) continue;
    const w = weights[key] ?? 1;
    sum += v * w;
    wsum += w;
    n++;
  }
  if (n < MIN_SCORED_FIELDS || wsum === 0) return null;
  return Math.round((sum / wsum) * 100) / 100;
}
