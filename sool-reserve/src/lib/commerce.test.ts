import { describe, expect, it } from "vitest";
import { canPurchase, commerceRouteAllowed, liveReadiness, priceDisplay } from "./commerce";

const product = { status: "PUBLISHED", eligibility: "VERIFIED", stock: 5, tradeModel: "COMMISSION", isDemo: false };

describe("판매 기능 게이트", () => {
  it("SHOWCASE·PRIVATE_TEST에서는 어떤 상품도 구매 불가", () => {
    expect(canPurchase({ mode: "SHOWCASE", product, brewery: { salesEnabled: true } })).toBe(false);
    expect(canPurchase({ mode: "PRIVATE_TEST", product, brewery: { salesEnabled: true } })).toBe(false);
  });
  it("LIVE라도 적격·재고·판매자·데모 조건을 모두 충족해야 구매 가능", () => {
    const b = { salesEnabled: true };
    expect(canPurchase({ mode: "LIVE", product, brewery: b })).toBe(true);
    expect(canPurchase({ mode: "LIVE", product: { ...product, eligibility: "INELIGIBLE" }, brewery: b })).toBe(false);
    expect(canPurchase({ mode: "LIVE", product: { ...product, stock: 0 }, brewery: b })).toBe(false);
    expect(canPurchase({ mode: "LIVE", product: { ...product, isDemo: true }, brewery: b })).toBe(false);
    expect(canPurchase({ mode: "LIVE", product: { ...product, tradeModel: "WHOLESALE" }, brewery: b })).toBe(false);
    expect(canPurchase({ mode: "LIVE", product, brewery: { salesEnabled: false } })).toBe(false);
  });
  it("장바구니 라우트는 SHOWCASE에서 관리자도 접근 불가", () => {
    expect(commerceRouteAllowed("SHOWCASE", true)).toBe(false);
    expect(commerceRouteAllowed("PRIVATE_TEST", false)).toBe(false);
    expect(commerceRouteAllowed("PRIVATE_TEST", true)).toBe(true);
    expect(commerceRouteAllowed("LIVE", false)).toBe(true);
  });
  it("가격 표시 모드", () => {
    expect(priceDisplay("SHOWCASE", true)).toBe("REFERENCE");
    expect(priceDisplay("SHOWCASE", false)).toBe("HIDDEN");
    expect(priceDisplay("LIVE", false)).toBe("LIVE");
  });
  it("PG 키 없이 LIVE 전환 불가", () => {
    const r = liveReadiness({
      verifiedSellerCount: 1,
      verifiedProductCount: 1,
      ageProviderKeySet: true,
      pgKeySet: false,
      pgContractConfirmed: true,
      settlementStructureConfirmed: true,
      requiredNoticesPublished: true,
    });
    expect(r.ready).toBe(false);
  });
});
