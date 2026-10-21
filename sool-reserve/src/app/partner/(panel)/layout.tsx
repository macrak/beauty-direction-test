import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { requirePartner } from "@/lib/auth";

export const metadata: Metadata = { title: "파트너 센터", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/partner", label: "상품 · 재고" },
  { href: "/partner/products/new", label: "상품 등록" },
  { href: "/partner/orders", label: "주문 · 정산 · 판매 현황" },
  { href: "/partner/profile", label: "양조장 정보" },
];

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePartner();
  return (
    <AdminShell title="PARTNER CENTER" nav={NAV} user={user} area="partner">
      {children}
    </AdminShell>
  );
}
