import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "관리자", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "대시보드", group: "개요" },
  { href: "/admin/profitability", label: "수익성 분석", group: "개요" },
  { href: "/admin/breweries", label: "양조장 입점 관리", group: "카탈로그" },
  { href: "/admin/products", label: "상품 관리", group: "카탈로그" },
  { href: "/admin/selection", label: "상품 선별", group: "카탈로그" },
  { href: "/admin/featured", label: "추천 상품 설정", group: "카탈로그" },
  { href: "/admin/inquiries", label: "문의 관리", group: "운영" },
  { href: "/admin/legal", label: "법적 고지 · 경고문구", group: "운영" },
  { href: "/admin/commerce", label: "주문·배송·정산 (3단계)", group: "운영" },
  { href: "/admin/settings", label: "시스템 설정", group: "시스템" },
  { href: "/admin/users", label: "계정 · 권한", group: "시스템" },
  { href: "/admin/audit", label: "변경 이력", group: "시스템" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const s = await getSettings();
  const modeLabel = { SHOWCASE: "SHOWCASE · 소개 전용 (구매 기능 비공개)", PRIVATE_TEST: "PRIVATE TEST · 관리자 전용 테스트", LIVE: "LIVE · 판매 중" }[s.salesMode];
  return (
    <AdminShell
      title="ADMIN CONSOLE"
      nav={NAV}
      user={user}
      area="admin"
      banner={
        <div className={`px-4 py-2 text-center text-xs md:px-8 ${s.salesMode === "LIVE" ? "bg-[#22603A] text-white" : "bg-charcoal text-ivory/85"}`}>
          운영 모드: {modeLabel}
          {s.showDemoData && " · 데모 데이터 노출 중"}
        </div>
      }
    >
      {children}
    </AdminShell>
  );
}
