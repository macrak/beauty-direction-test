import { describe, expect, it } from "vitest";
import { curationScore } from "./curation";

describe("curationScore", () => {
  it("가중 평균, null 제외", () => {
    const s = curationScore(
      { scoreEligibility: 5, scoreReputation: 3, scoreStory: 3, scoreQuality: 5, scoreRarity: 3, scoreDesign: null },
      { scoreEligibility: 2, scoreQuality: 2 },
    );
    expect(s).toBe(Math.round(((5 * 2 + 3 + 3 + 5 * 2 + 3) / 7) * 100) / 100);
  });
  it("평가 항목이 5개 미만이면 미평가(null)", () => {
    expect(curationScore({ scoreGift: 5, scoreQuality: 5 }, {})).toBeNull();
  });
});
