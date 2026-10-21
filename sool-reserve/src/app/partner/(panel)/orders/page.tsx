import { PageTitle } from "@/components/admin/AdminShell";
import { requirePartner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { won } from "@/lib/format";

export default async function PartnerOrders() {
  const user = await requirePartner();
  const [orders, settlements] = await Promise.all([
    prisma.sellerOrder.findMany({ where: { breweryId: user.breweryId }, take: 50 }),
    prisma.settlement.findMany({ where: { breweryId: user.breweryId }, take: 24, orderBy: { periodStart: "desc" } }),
  ]);
  return (
    <>
      <PageTitle title="주문 · 정산 · 판매 현황" desc="판매 기능이 활성화되면 자사 주문·출고·정산 내역만 표시됩니다." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="adm-card">
          <h2 className="text-sm font-semibold">주문</h2>
          <p className="mt-2 text-sm text-charcoal/55">{orders.length ? `${orders.length}건` : "판매 기능 활성화 전입니다. 주문 내역이 없습니다."}</p>
        </div>
        <div className="adm-card">
          <h2 className="text-sm font-semibold">정산</h2>
          {settlements.length ? (
            <ul className="mt-2 text-sm">
              {settlements.map((s) => (
                <li key={s.id}>
                  {s.periodStart.toLocaleDateString("ko-KR")} · 지급 {won(s.payout)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-charcoal/55">정산 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </>
  );
}
