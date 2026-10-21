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
  const basisAmount = input.vatBasis === "EXCLUSIVE" ? Math.floor((price * 10) / 11) : price;
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

// 매입형: 운영사가 판매자. 매출·원가 모두 VAT 제외 금액으로 비교
export interface WholesaleInput {
  price: number; // 판매가 (VAT 포함)
  wholesaleCost: number | null; // 매입가 (VAT 포함)
  pgRate: number;
  platformShippingCost: number;
  platformPromoCost: number;
  otherVariableCost: number;
}

export function calcWholesale(i: WholesaleInput) {
  const price = Math.max(0, Math.round(i.price));
  const netSales = Math.floor((price * 10) / 11);
  const netCost = i.wholesaleCost === null ? 0 : Math.floor((Math.max(0, i.wholesaleCost) * 10) / 11);
  const grossMargin = netSales - netCost; // 매출총이익
  const pgCost = Math.round((price * i.pgRate) / 100); // 판매자가 운영사이므로 결제비 전액 부담
  const contribution = grossMargin - pgCost - i.platformShippingCost - i.platformPromoCost - i.otherVariableCost;
  return {
    netSales,
    netCost,
    grossMargin,
    pgCost,
    contribution,
    marginOnSales: netSales > 0 ? round1((contribution / netSales) * 100) : null, // 순매출 대비 이익률
    markup: netCost > 0 ? round1(((netSales - netCost) / netCost) * 100) : null, // 원가 대비 마크업
    missingCost: i.wholesaleCost === null,
  };
}

interface ProductEconomicsSource {
  tradeModel?: "COMMISSION" | "WHOLESALE";
  wholesaleCost?: number | null;
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

// 대시보드·선별 공통 형태: commission = 플랫폼 수익(중개 수수료 또는 매입 매출총이익)
export function productEconomics(p: ProductEconomicsSource, systemRate: number) {
  if (p.tradeModel === "WHOLESALE") {
    const w = calcWholesale({
      price: p.price,
      wholesaleCost: p.wholesaleCost ?? null,
      pgRate: p.pgRate,
      platformShippingCost: p.platformShippingCost,
      platformPromoCost: p.platformPromoCost,
      otherVariableCost: p.otherVariableCost,
    });
    return {
      model: "WHOLESALE" as const,
      commissionRate: null as number | null,
      basisAmount: w.netSales,
      commission: w.grossMargin,
      pgCostTotal: w.pgCost,
      platformPgCost: w.pgCost,
      contribution: w.contribution,
      marginOnCommission: w.grossMargin > 0 ? round1((w.contribution / w.grossMargin) * 100) : null,
      marginOnGmv: p.price > 0 ? round1((w.contribution / p.price) * 100) : null,
      sellerPayout: 0,
      missingCost: w.missingCost,
    };
  }
  const commissionRate = resolveCommissionRate(p.commissionRate, p.brewery?.defaultCommissionRate, systemRate);
  return {
    model: "COMMISSION" as const,
    missingCost: false,
    commissionRate: commissionRate as number | null,
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
