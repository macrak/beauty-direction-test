import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CheckoutView from "@/components/CheckoutView";
import { commerceSession } from "@/lib/orders";

export const metadata: Metadata = { title: "주문 · 결제", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await commerceSession();
  if (!s.allowed) notFound();
  const testMode = s.settings.salesMode !== "LIVE";
  return (
    <div className="container-site pb-10 pt-12 md:pt-20">
      <p className="eyebrow">{testMode ? "Checkout · Private Test" : "Checkout"}</p>
      <h1 className="h-display mt-4 mb-12">주문 · 결제</h1>
      <CheckoutView testMode={testMode} ageProvider={testMode ? "mock" : "live"} />
    </div>
  );
}
