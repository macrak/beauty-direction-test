// 판매 기능 노출 규칙 — 장바구니·주문·결제·가격 표시는 모두 여기서 판정한다.
import type { SalesMode } from "./settings";

export type PriceDisplay = "LIVE" | "REFERENCE" | "HIDDEN";

export function priceDisplay(mode: SalesMode, showReferencePrice: boolean): PriceDisplay {
  if (mode === "LIVE") return "LIVE";
  return showReferencePrice ? "REFERENCE" : "HIDDEN";
}

export interface PurchasableInput {
  mode: SalesMode;
  product: { status: string; eligibility: string; stock: number; tradeModel: string; isDemo: boolean; wholesaleCost?: number | null };
  brewery: { salesEnabled: boolean };
  operatorLicenseConfirmed?: boolean; // 매입형: 운영사 주류 판매·통신판매 자격 확인
}

// 판매 주체 요건: 중개형은 양조장 판매 활성, 매입형은 운영사 자격 확인 + 매입가 등록
function sellerReady(i: PurchasableInput): boolean {
  if (i.product.tradeModel === "WHOLESALE") return !!i.operatorLicenseConfirmed && i.product.wholesaleCost != null;
  return i.brewery.salesEnabled;
}

export function canPurchase(i: PurchasableInput): boolean {
  const { mode, product } = i;
  return (
    mode === "LIVE" &&
    !product.isDemo &&
    sellerReady(i) &&
    product.status === "PUBLISHED" &&
    product.eligibility === "VERIFIED" &&
    product.stock > 0
  );
}

// 주문 가능 여부 (세션 기준). PRIVATE_TEST는 관리자만, 판매자 승인·데모 조건은 건너뛰되
// 통신판매 적격(VERIFIED)과 재고는 테스트에서도 지킨다.
export function canOrder(i: PurchasableInput & { isStaff: boolean }): boolean {
  if (i.mode === "LIVE") return canPurchase(i);
  if (i.mode === "PRIVATE_TEST") {
    return i.isStaff && i.product.status === "PUBLISHED" && i.product.eligibility === "VERIFIED" && i.product.stock > 0;
  }
  return false;
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
  wholesaleProductCount: number;
  operatorLicenseConfirmed: boolean;
}

export function liveReadiness(i: LiveReadinessInput) {
  const items = [
    { label: "판매자 1곳 이상 (서류 승인 양조장 또는 자격 확인된 운영사 직매입)", ok: i.verifiedSellerCount > 0 || (i.operatorLicenseConfirmed && i.wholesaleProductCount > 0) },
    { label: "통신판매 적격(VERIFIED) 판매 상품 1개 이상 (데모 제외)", ok: i.verifiedProductCount > 0 },
    { label: "성인 인증 공급자 실키 등록 (AGE_VERIFICATION_SECRET)", ok: i.ageProviderKeySet },
    { label: "PG 실키 등록 (PG_SECRET_KEY)", ok: i.pgKeySet },
    { label: "PG사 주류 가맹 심사 완료 확인", ok: i.pgContractConfirmed },
    { label: "판매자별 정산 구조 확인", ok: i.settlementStructureConfirmed },
    { label: "필수 법적 고지(약관·개인정보·경고문구·중개자 고지) 게시", ok: i.requiredNoticesPublished },
    { label: "직매입 상품이 있으면 운영사 주류 판매·통신판매 자격 확인", ok: i.wholesaleProductCount === 0 || i.operatorLicenseConfirmed },
  ];
  return { items, ready: items.every((x) => x.ok) };
}
