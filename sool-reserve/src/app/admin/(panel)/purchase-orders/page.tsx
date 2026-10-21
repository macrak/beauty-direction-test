import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { won } from "@/lib/format";

const PO_LABEL = { DRAFT: "작성 중", ORDERED: "발주 완료", RECEIVED: "입고 완료", CANCELLED: "취소" } as const;

export default async function PurchaseOrders() {
  const [list, lowStock] = await Promise.all([
    prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { supplier: true, _count: { select: { items: true } } } }),
    prisma.product.findMany({ where: { tradeModel: "WHOLESALE", status: "PUBLISHED", stock: { lte: 5 } }, include: { supplier: true }, orderBy: { stock: "asc" } }),
  ]);
  return (
    <>
      <PageTitle
        title="발주 · 입고"
        desc="직매입 상품의 발주서를 만들고, 입고 처리하면 재고와 매입가가 자동 반영됩니다."
        action={
          <Link href="/admin/purchase-orders/new" className="adm-btn">
            + 발주서 작성
          </Link>
        }
      />
      {lowStock.length > 0 && (
        <section className="adm-card mb-4 border-[#E8C77A] bg-[#FFFBF0]">
          <h2 className="text-sm font-semibold">재고 부족 (5병 이하) · 직매입 상품</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link href={p.supplierId ? `/admin/purchase-orders/new?supplier=${p.supplierId}` : `/admin/products/${p.id}`} className="adm-btn-ghost py-1">
                  {p.name} <span className="ml-1.5 tabular-nums text-[#9B1C1C]">{p.stock}병</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th>발주번호</th>
              <th>공급처</th>
              <th>작성일</th>
              <th className="text-right">품목</th>
              <th className="text-right">매입 금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {list.map((po) => (
              <tr key={po.id}>
                <td>
                  <Link href={`/admin/purchase-orders/${po.id}`} className="font-medium tabular-nums hover:underline">
                    {po.number}
                  </Link>
                </td>
                <td>{po.supplier.name}</td>
                <td className="text-xs">{po.createdAt.toLocaleDateString("ko-KR")}</td>
                <td className="text-right tabular-nums">{po._count.items}</td>
                <td className="text-right tabular-nums">{won(po.totalCost)}</td>
                <td>
                  <Pill tone={po.status === "RECEIVED" ? "good" : po.status === "CANCELLED" ? "bad" : "warn"}>{PO_LABEL[po.status]}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-charcoal/50">발주 내역이 없습니다.</p>}
      </div>
    </>
  );
}
