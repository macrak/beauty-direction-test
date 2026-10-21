import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CartView from "@/components/CartView";
import { commerceSession } from "@/lib/orders";

export const metadata: Metadata = { title: "장바구니", robots: { index: false } };

// 판매 기능 게이트: SHOWCASE 모드에서는 관리자에게도 404, PRIVATE_TEST는 관리자만
export default async function CartPage() {
  const s = await commerceSession();
  if (!s.allowed) notFound();
  return (
    <div className="container-site pb-10 pt-12 md:pt-20">
      <p className="eyebrow">Cart</p>
      <h1 className="h-display mt-4 mb-12">장바구니</h1>
      <CartView testMode={s.settings.salesMode !== "LIVE"} />
    </div>
  );
}
