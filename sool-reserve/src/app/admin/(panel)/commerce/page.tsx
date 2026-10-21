import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { computeLiveReadiness } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function Commerce() {
  const [s, r, orders, settlements, verifications] = await Promise.all([
    getSettings(),
    computeLiveReadiness(),
    prisma.order.count(),
    prisma.settlement.count(),
    prisma.ageVerification.count(),
  ]);
  const modules = [
    ["주문 관리", "판매자(양조장)별 SellerOrder 분할 저장 · 판매·배송·정산 책임 구분", `주문 ${orders}건`],
    ["결제 (PG)", process.env.PG_SECRET_KEY ? "실키 등록됨 — LIVE 전환 시에만 사용" : "실키 미등록 — Mock 공급자만 로드 (실결제 불가)", "신용카드 · 간편결제 · 취소 · 환불"],
    ["성인 인증", process.env.AGE_VERIFICATION_SECRET ? "공급자 키 등록됨" : "미연동 — Mock 공급자 (NICE/KCP/PASS 등 후보 검토 중)", `인증 기록 ${verifications}건 · 성인 여부/인증일/거래ID만 저장`],
    ["배송 관리", "판매자 직접 출고 · 운송장/추적 · 파손 신고", "상품별 배송 조건은 상품 관리에서 설정"],
    ["정산", "판매자별 거래액 − 수수료 − 판매자 부담 결제비", `정산 ${settlements}건`],
    ["고객 계정", "회원가입 · 관심상품 · 주문 내역", "LIVE 이후 공개"],
  ];
  return (
    <>
      <PageTitle title="주문 · 배송 · 정산 (3단계 준비)" desc="데이터 모델과 게이트만 구현된 상태입니다. 실제 판매 기능은 법적 조건 충족 전까지 비활성화됩니다." />
      <div className="adm-card mb-4 text-sm">
        현재 운영 모드: <strong>{s.salesMode}</strong> · LIVE 전환 {r.ready ? <Pill tone="good">가능</Pill> : <Pill tone="bad">불가 — 조건 미충족</Pill>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map(([t, d, x]) => (
          <div key={t} className="adm-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t}</h2>
              <Pill tone="warn">비활성</Pill>
            </div>
            <p className="mt-2 text-sm text-charcoal/70">{d}</p>
            <p className="mt-2 text-xs text-charcoal/50">{x}</p>
          </div>
        ))}
      </div>
    </>
  );
}
