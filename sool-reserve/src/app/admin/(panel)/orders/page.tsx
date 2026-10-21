import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/OrderBits";
import { prisma } from "@/lib/db";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { won } from "@/lib/format";

const TABS: [string, string][] = [["", "전체"], ["PAID", "결제 완료"], ["PREPARING", "준비 중"], ["SHIPPED", "배송 중"], ["DELIVERED", "배송 완료"], ["CANCELLED", "취소·환불"]];

export default async function Orders({ searchParams }: { searchParams: { status?: string } }) {
  const st = searchParams.status;
  const where = st === "CANCELLED" ? { status: { in: ["CANCELLED", "REFUNDED"] as OrderStatus[] } } : st && st in ORDER_STATUS_LABEL ? { status: st as OrderStatus } : {};
  const [orders, all, settings] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { sellerOrders: { include: { brewery: true } } } }),
    prisma.order.findMany({ select: { status: true, totalAmount: true, createdAt: true } }),
    getSettings(),
  ]);
  const paid = all.filter((o) => !["CANCELLED", "REFUNDED", "PENDING"].includes(o.status));
  const kpi = [
    ["결제 완료 주문", `${paid.length}건`],
    ["결제 금액", won(paid.reduce((a, o) => a + o.totalAmount, 0))],
    ["출고 대기", `${all.filter((o) => o.status === "PAID" || o.status === "PREPARING").length}건`],
    ["취소·환불", `${all.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED").length}건`],
  ];
  return (
    <>
      <PageTitle
        title="주문 관리"
        desc={settings.salesMode === "LIVE" ? "판매자별로 분할된 주문의 배송·취소를 처리합니다." : `현재 ${settings.salesMode} 모드 — 관리자 테스트 주문만 생성됩니다 (Mock 결제).`}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map(([l, v]) => (
          <div key={l} className="adm-card">
            <p className="text-xs text-charcoal/55">{l}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 mt-6 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <Link key={k} href={k ? `?status=${k}` : "/admin/orders"} className={`adm-btn-ghost py-1 ${(st ?? "") === k ? "border-charcoal" : ""}`}>
            {l}
          </Link>
        ))}
      </div>
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[860px]">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문 일시</th>
              <th>받는 분</th>
              <th>판매자</th>
              <th className="text-right">결제 금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium tabular-nums hover:underline">
                    {o.orderNumber}
                  </Link>{" "}
                  {o.isTest && <Pill>테스트</Pill>}
                </td>
                <td className="whitespace-nowrap text-xs">{o.createdAt.toLocaleString("ko-KR")}</td>
                <td>{o.recipientName}</td>
                <td className="text-xs">{o.sellerOrders.map((s) => (s.sellerType === "OPERATOR" ? "직매입" : s.brewery?.name)).join(", ")}</td>
                <td className="text-right tabular-nums">{won(o.totalAmount)}</td>
                <td>
                  <StatusPill s={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-8 text-center text-sm text-charcoal/50">
            주문이 없습니다. {settings.salesMode === "SHOWCASE" && "시스템 설정에서 운영 모드를 PRIVATE_TEST로 바꾸면 관리자 계정으로 테스트 주문을 넣을 수 있습니다."}
          </p>
        )}
      </div>
    </>
  );
}
