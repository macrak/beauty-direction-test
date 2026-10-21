// 판매 기능 노출 규칙 — 장바구니·주문·결제·가격 표시는 모두 여기서 판정한다.
import type { SalesMode } from "./settings";

export type PriceDisplay = "LIVE" | "REFERENCE" | "HIDDEN";

export function priceDisplay(mode: SalesMode, showReferencePrice: boolean): PriceDisplay {
  if (mode === "LIVE") return "LIVE";
  return showReferencePrice ? "REFERENCE" : "HIDDEN";
}

export interface PurchasableInput {
  mode: SalesMode;
  product: { status: string; eligibility: string; stock: number; tradeModel: string; isDemo: boolean };
  brewery: { salesEnabled: boolean };
}

export function canPurchase({ mode, product, brewery }: PurchasableInput): boolean {
  return (
    mode === "LIVE" &&
    !product.isDemo &&
    brewery.salesEnabled &&
    product.status === "PUBLISHED" &&
    product.eligibility === "VERIFIED" &&
    product.tradeModel === "COMMISSION" &&
    product.stock > 0
  );
}

// 장바구니/주문 라우트 접근: SHOWCASE는 누구도 불가(404), PRIVATE_TEST는 관리자만, LIVE는 공개
export function commerceRouteAllowed(mode: SalesMode, isStaff: boolean): boolean {
  if (mode === "LIVE") return true;
  if (mode === "PRIVATE_TEST") return isStaff;
  return false;
}

export interface LiveReadinessInput {
  verifiedSellerCount: number;
  verifiedProductCount: number;
  ageProviderKeySet: boolean;
  pgKeySet: boolean;
  pgContractConfirmed: boolean;
  settlementStructureConfirmed: boolean;
  requiredNoticesPublished: boolean;
}

export function liveReadiness(i: LiveReadinessInput) {
  const items = [
    { label: "서류 승인된 판매 활성 판매자 1곳 이상", ok: i.verifiedSellerCount > 0 },
    { label: "통신판매 적격(VERIFIED) 판매 상품 1개 이상 (데모 제외)", ok: i.verifiedProductCount > 0 },
    { label: "성인 인증 공급자 실키 등록 (AGE_VERIFICATION_SECRET)", ok: i.ageProviderKeySet },
    { label: "PG 실키 등록 (PG_SECRET_KEY)", ok: i.pgKeySet },
    { label: "PG사 주류 가맹 심사 완료 확인", ok: i.pgContractConfirmed },
    { label: "판매자별 정산 구조 확인", ok: i.settlementStructureConfirmed },
    { label: "필수 법적 고지(약관·개인정보·경고문구·중개자 고지) 게시", ok: i.requiredNoticesPublished },
  ];
  return { items, ready: items.every((x) => x.ok) };
}
