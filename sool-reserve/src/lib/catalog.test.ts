import { describe, expect, it } from "vitest";
import { toPublicProduct } from "./catalog";

describe("toPublicProduct", () => {
  const product = {
    id: "p1", slug: "s", name: "n", price: 150000, status: "PUBLISHED", eligibility: "VERIFIED", stock: 3,
    tradeModel: "COMMISSION", isDemo: false, commissionRate: 18, platformShippingCost: 4000, wholesaleCost: 90000,
    scoreProfit: 5, expectedMonthlyUnits: 10, flavorTags: [], occasions: [], giftPurposes: [], pairingCategories: [], shipDays: [],
    brewery: { slug: "b", name: "B", nameEn: null, region: "r", isDemo: false, salesEnabled: true, supplyTerms: "secret", defaultCommissionRate: 20 },
  } as never;

  it("내부 수익·공급 조건 필드를 고객 응답에서 제외", () => {
    const pub = toPublicProduct(product, { salesMode: "SHOWCASE", showReferencePrice: true }) as unknown as Record<string, unknown>;
    for (const k of ["commissionRate", "platformShippingCost", "wholesaleCost", "scoreProfit", "expectedMonthlyUnits", "stock", "status"]) {
      expect(pub).not.toHaveProperty(k);
    }
    expect(pub.brewery).not.toHaveProperty("supplyTerms");
    expect(pub.brewery).not.toHaveProperty("defaultCommissionRate");
    expect(pub.purchasable).toBe(false);
    expect(pub.priceMode).toBe("REFERENCE");
  });

  it("가격 숨김 설정이면 price=null", () => {
    const pub = toPublicProduct(product, { salesMode: "SHOWCASE", showReferencePrice: false });
    expect(pub.price).toBeNull();
  });
});
