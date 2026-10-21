import { describe, expect, it } from "vitest";
import { calcEconomics, calcWholesale, productEconomics, resolveCommissionRate } from "./economics";

const base = {
  price: 150000,
  vatBasis: "INCLUSIVE" as const,
  commissionRate: 15,
  pgRate: 3.3,
  pgBearer: "PLATFORM" as const,
  platformShippingCost: 4000,
  platformPromoCost: 0,
  otherVariableCost: 1000,
};

describe("calcEconomics", () => {
  it("VAT 포함 기준, 플랫폼 결제비 부담", () => {
    const r = calcEconomics(base);
    expect(r.basisAmount).toBe(150000);
    expect(r.commission).toBe(22500);
    expect(r.platformPgCost).toBe(4950);
    expect(r.contribution).toBe(22500 - 4950 - 4000 - 1000);
    expect(r.marginOnCommission).toBe(55.8);
    expect(r.marginOnGmv).toBe(8.4);
    expect(r.sellerPayout).toBe(127500);
  });

  it("VAT 제외 기준은 판매가/1.1 원 미만 버림", () => {
    const r = calcEconomics({ ...base, vatBasis: "EXCLUSIVE" });
    expect(r.basisAmount).toBe(136363);
    expect(r.commission).toBe(20454);
  });

  it("판매자가 결제비를 부담하면 플랫폼 공헌이익에서 빠지고 정산액에서 차감", () => {
    const r = calcEconomics({ ...base, pgBearer: "SELLER" });
    expect(r.platformPgCost).toBe(0);
    expect(r.contribution).toBe(22500 - 4000 - 1000);
    expect(r.sellerPayout).toBe(150000 - 22500 - 4950);
  });

  it("수수료 0이면 수수료 대비 이익률은 null", () => {
    const r = calcEconomics({ ...base, commissionRate: 0 });
    expect(r.commission).toBe(0);
    expect(r.marginOnCommission).toBeNull();
    expect(r.contribution).toBeLessThan(0);
  });

  it("판매가 0이면 거래액 대비 이익률 null", () => {
    expect(calcEconomics({ ...base, price: 0 }).marginOnGmv).toBeNull();
  });
});

describe("resolveCommissionRate", () => {
  it("상품 → 양조장 → 시스템 순으로 결정", () => {
    expect(resolveCommissionRate(12, 18, 15)).toBe(12);
    expect(resolveCommissionRate(null, 18, 15)).toBe(18);
    expect(resolveCommissionRate(null, null, 15)).toBe(15);
    expect(resolveCommissionRate(0, 18, 15)).toBe(0);
  });
});

describe("calcWholesale (매입형)", () => {
  const w = { price: 110000, wholesaleCost: 66000, pgRate: 3.3, platformShippingCost: 4000, platformPromoCost: 0, otherVariableCost: 1000 };
  it("VAT 제외 기준 매출총이익과 공헌이익", () => {
    const r = calcWholesale(w);
    expect(r.netSales).toBe(100000);
    expect(r.netCost).toBe(60000);
    expect(r.grossMargin).toBe(40000);
    expect(r.pgCost).toBe(3630);
    expect(r.contribution).toBe(40000 - 3630 - 4000 - 1000);
    expect(r.marginOnSales).toBe(31.4);
    expect(r.markup).toBe(66.7);
  });
  it("매입가 미입력은 표시", () => {
    expect(calcWholesale({ ...w, wholesaleCost: null }).missingCost).toBe(true);
  });
  it("productEconomics가 거래 모델에 따라 분기", () => {
    const base = { ...w, vatBasis: "INCLUSIVE" as const, commissionRate: null, pgBearer: "PLATFORM" as const };
    expect(productEconomics({ ...base, tradeModel: "WHOLESALE" }, 15).commission).toBe(40000);
    expect(productEconomics({ ...base, tradeModel: "COMMISSION" }, 15).commission).toBe(16500);
  });
});
