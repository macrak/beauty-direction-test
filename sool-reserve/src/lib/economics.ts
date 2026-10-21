// 상품별 수익 계산 — 대시보드·상품 목록·선별 필터가 모두 이 함수만 사용한다.
// 모든 금액은 원 단위 정수, 비율은 % 값(예: 15 = 15%).

export type VatBasis = "INCLUSIVE" | "EXCLUSIVE";
export type CostBearer = "PLATFORM" | "SELLER";

export interface EconomicsInput {
  price: number; // 판매가 (VAT 포함)
  vatBasis: VatBasis;
  commissionRate: number; // %
  pgRate: number; // %
  pgBearer: CostBearer;
  platformShippingCost: number;
  platformPromoCost: number;
  otherVariableCost: number;
}

export interface EconomicsResult {
  basisAmount: number; // 수수료 기준금액
  commission: number; // 플랫폼 수수료 수익
  pgCostTotal: number; // 결제비 총액
  platformPgCost: number; // 플랫폼 부담 결제비
  contribution: number; // 예상 플랫폼 공헌이익
  marginOnCommission: number | null; // 수수료 대비 공헌이익률 (%)
  marginOnGmv: number | null; // 거래액 대비 공헌이익률 (%)
  sellerPayout: number; // 판매자 정산 예상액
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function calcEconomics(input: EconomicsInput): EconomicsResult {
  const price = Math.max(0, Math.round(input.price));
  const basisAmount = input.vatBasis === "EXCLUSIVE" ? Math.floor(price / 1.1) : price;
  const commission = Math.round((basisAmount * input.commissionRate) / 100);
  const pgCostTotal = Math.round((price * input.pgRate) / 100);
  const platformPgCost = input.pgBearer === "PLATFORM" ? pgCostTotal : 0;
  const sellerPgCost = input.pgBearer === "SELLER" ? pgCostTotal : 0;
  const contribution =
    commission - platformPgCost - input.platformShippingCost - input.platformPromoCost - input.otherVariableCost;
  return {
    basisAmount,
    commission,
    pgCostTotal,
    platformPgCost,
    contribution,
    marginOnCommission: commission > 0 ? round1((contribution / commission) * 100) : null,
    marginOnGmv: price > 0 ? round1((contribution / price) * 100) : null,
    sellerPayout: price - commission - sellerPgCost,
  };
}

// 수수료율 결정 순서: 상품 → 양조장 기본값 → 시스템 기본값
export function resolveCommissionRate(
  productRate: number | null | undefined,
  breweryRate: number | null | undefined,
  systemRate: number,
): number {
  if (productRate !== null && productRate !== undefined) return productRate;
  if (breweryRate !== null && breweryRate !== undefined) return breweryRate;
  return systemRate;
}

interface ProductEconomicsSource {
  price: number;
  vatBasis: VatBasis;
  commissionRate: number | null;
  pgRate: number;
  pgBearer: CostBearer;
  platformShippingCost: number;
  platformPromoCost: number;
  otherVariableCost: number;
  brewery?: { defaultCommissionRate: number | null } | null;
}

export function productEconomics(p: ProductEconomicsSource, systemRate: number) {
  const commissionRate = resolveCommissionRate(p.commissionRate, p.brewery?.defaultCommissionRate, systemRate);
  return {
    commissionRate,
    ...calcEconomics({
      price: p.price,
      vatBasis: p.vatBasis,
      commissionRate,
      pgRate: p.pgRate,
      pgBearer: p.pgBearer,
      platformShippingCost: p.platformShippingCost,
      platformPromoCost: p.platformPromoCost,
      otherVariableCost: p.otherVariableCost,
    }),
  };
}
