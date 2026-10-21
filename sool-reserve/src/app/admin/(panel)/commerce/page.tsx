import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { computeLiveReadiness } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function Commerce() {
  const [s, r, orders, testOrders, suppliers, wholesale, verifications] = await Promise.all([
    getSettings(),
    computeLiveReadiness(),
    prisma.order.count(),
    prisma.order.count({ where: { isTest: true } }),
    prisma.supplier.count({ where: { active: true } }),
    prisma.product.count({ where: { tradeModel: "WHOLESALE" } }),
    prisma.ageVerification.count(),
  ]);
  const testing = s.salesMode === "PRIVATE_TEST";
  const modules: [string, string, string, "good" | "warn" | "neutral", string][] = [
    ["장바구니 · 주문", "판매자(양조장·직매입)별 주문 분할, 재고 차감, 판매자별 배송비", `주문 ${orders}건 (테스트 ${testOrders})`, testing || s.salesMode === "LIVE" ? "good" : "neutral", "/admin/orders"],
    ["결제 (PG)", process.env.PG_SECRET_KEY ? "실키 등록 — 실제 PG 연동 구현 필요 (계약 PG사 SDK)" : "Mock 결제만 동작 · 실결제 경로 없음", "카드 · 간편결제 · 취소 · 환불", testing ? "good" : "neutral", "/admin/orders"],
    ["성인 인증", process.env.AGE_VERIFICATION_SECRET ? "실키 등록 — 본인확인기관 연동 구현 필요" : "Mock 인증만 동작 · 주문 시 서버 재검증", `인증 기록 ${verifications}건 · 성인 여부·시각·거래ID만 저장`, testing ? "good" : "neutral", "/admin/orders"],
    ["배송 관리", "판매자별 출고 · 운송장 · 배송 완료 · 파손 신고", "양조장은 파트너 센터에서 자사 주문만 처리", testing ? "good" : "neutral", "/admin/orders"],
    ["정산", "월별 배송 완료 기준 · 양조장 지급액 · 직매입 손익", "지급·세금계산서는 별도 처리", "good", "/admin/settlements"],
    ["직매입 (공급처 · 발주)", `공급처 ${suppliers}곳 · 매입형 상품 ${wholesale}개`, "발주서 → 입고 시 재고·매입가 자동 반영", "good", "/admin/suppliers"],
  ];
  return (
    <>
      <PageTitle title="판매 준비 현황" desc="주문·결제·배송·정산 기능의 활성 상태와 실제 판매(LIVE) 전환 조건입니다." />
      <div className="adm-card mb-4 flex flex-wrap items-center gap-3 text-sm">
        현재 운영 모드: <strong>{s.salesMode}</strong>
        {s.salesMode === "SHOWCASE" && <span className="text-charcoal/60">— 시스템 설정에서 PRIVATE_TEST로 바꾸면 관리자 계정으로 실제와 같은 주문 흐름을 테스트할 수 있습니다.</span>}
        <span className="ml-auto">LIVE 전환 {r.ready ? <Pill tone="good">가능</Pill> : <Pill tone="bad">불가 — 조건 미충족</Pill>}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map(([t, d, x, tone, href]) => (
          <Link key={t} href={href} className="adm-card block hover:border-charcoal">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t}</h2>
              <Pill tone={tone}>{tone === "good" ? "사용 가능" : "비활성"}</Pill>
            </div>
            <p className="mt-2 text-sm text-charcoal/70">{d}</p>
            <p className="mt-2 text-xs text-charcoal/50">{x}</p>
          </Link>
        ))}
      </div>
      <section className="adm-card mt-4">
        <h2 className="text-sm font-semibold">LIVE 전환 조건</h2>
        <ul className="mt-3 grid gap-1.5 text-sm md:grid-cols-2">
          {r.items.map((i) => (
            <li key={i.label} className="flex items-center gap-2">
              <Pill tone={i.ok ? "good" : "bad"}>{i.ok ? "충족" : "미충족"}</Pill>
              <span className="text-xs">{i.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
