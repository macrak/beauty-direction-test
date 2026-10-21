import { describe, expect, it } from "vitest";
import { recommend, withJosa } from "./recommend";
import type { PublicProduct } from "./catalog";

const mk = (o: Partial<PublicProduct>): PublicProduct =>
  ({
    slug: "x",
    liquorType: "YAKJU",
    tasteSweetness: null,
    tasteAcidity: null,
    tasteBody: null,
    tasteCarbonation: null,
    tasteAroma: null,
    flavorTags: [],
    pairingCategories: [],
    giftPurposes: [],
    price: 100000,
    ...o,
  }) as PublicProduct;

describe("recommend", () => {
  it("맛 정보가 없는 축은 점수에 반영하지 않는다", () => {
    const r = recommend([mk({ slug: "none" }), mk({ slug: "sweet", tasteSweetness: 5 })], { tastes: ["sweet"], types: [] });
    expect(r.map((x) => x.product.slug)).toEqual(["sweet"]);
  });
  it("예산 범위 밖 · 가격 비공개 상품은 제외", () => {
    const r = recommend([mk({ slug: "a", price: 300000, tasteSweetness: 5 }), mk({ slug: "b", price: null, tasteSweetness: 5 })], {
      tastes: ["sweet"],
      types: [],
      budgetMax: 200000,
    });
    expect(r).toHaveLength(0);
  });
  it("조사 처리", () => {
    expect(withJosa("산미", "이", "가")).toBe("산미가");
    expect(withJosa("단맛", "이", "가")).toBe("단맛이");
    expect(withJosa("한식", "과", "와")).toBe("한식과");
    expect(withJosa("치즈", "과", "와")).toBe("치즈와");
  });
});
