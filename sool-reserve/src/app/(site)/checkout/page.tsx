import { notFound } from "next/navigation";
import { commerceRouteAllowed } from "@/lib/commerce";
import { isStaffSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

// 판매 기능 게이트: SHOWCASE 모드에서는 관리자에게도 404
export default async function CheckoutPage() {
  const s = await getSettings();
  if (!commerceRouteAllowed(s.salesMode, await isStaffSession())) notFound();
  return (
    <div className="container-site py-24">
      <p className="eyebrow">{s.salesMode === "PRIVATE_TEST" ? "Private Test" : "Checkout"}</p>
      <h1 className="h-display mt-4">주문·결제</h1>
      <p className="mt-6 text-sm text-charcoal/60">3단계(판매 준비)에서 구현 예정입니다. 판매자별 주문 분할 · Mock 결제로 비공개 테스트합니다.</p>
    </div>
  );
}
