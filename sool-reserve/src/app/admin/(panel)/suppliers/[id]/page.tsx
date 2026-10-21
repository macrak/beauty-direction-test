import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import SupplierForm from "@/components/admin/SupplierForm";
import { prisma } from "@/lib/db";
import { calcWholesale } from "@/lib/economics";
import { pct, won } from "@/lib/format";

const PO_LABEL = { DRAFT: "작성 중", ORDERED: "발주 완료", RECEIVED: "입고 완료", CANCELLED: "취소" } as const;

export default async function SupplierDetail({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const s = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: { products: { orderBy: { name: "asc" } }, purchaseOrders: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!s) notFound();
  return (
    <>
      <PageTitle
        title={s.name}
        desc={s.isDemo ? "DEMO 공급처 — 실제 거래처가 아닙니다." : undefined}
        action={
          <Link href={`/admin/purchase-orders/new?supplier=${s.id}`} className="adm-btn">
            + 발주서 작성
          </Link>
        }
      />
      {searchParams.saved && <p className="mb-4 rounded bg-[#E3EFE5] px-3 py-2 text-sm text-[#22603A]">저장되었습니다.</p>}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="adm-card overflow-x-auto">
          <h2 className="text-sm font-semibold">공급 상품 ({s.products.length})</h2>
          <table className="adm-table mt-2 min-w-[520px]">
            <thead>
              <tr>
                <th>상품</th>
                <th className="text-right">매입가</th>
                <th className="text-right">판매가</th>
                <th className="text-right">이익률</th>
                <th className="text-right">재고</th>
              </tr>
            </thead>
            <tbody>
              {s.products.map((p) => {
                const w = calcWholesale({ ...p, wholesaleCost: p.wholesaleCost });
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/products/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="text-right tabular-nums">{p.wholesaleCost ? won(p.wholesaleCost) : <Pill tone="warn">미입력</Pill>}</td>
                    <td className="text-right tabular-nums">{won(p.price)}</td>
                    <td className="text-right tabular-nums">{pct(w.marginOnSales)}</td>
                    <td className="text-right tabular-nums">{p.stock}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {s.products.length === 0 && <p className="mt-2 text-sm text-charcoal/50">상품 수정 화면에서 거래 모델을 &apos;매입&apos;으로, 공급처를 이 업체로 지정하세요.</p>}
        </section>
        <section className="adm-card">
          <h2 className="text-sm font-semibold">최근 발주</h2>
          <ul className="mt-2 divide-y divide-line text-sm">
            {s.purchaseOrders.map((po) => (
              <li key={po.id} className="flex items-center justify-between py-2">
                <Link href={`/admin/purchase-orders/${po.id}`} className="tabular-nums hover:underline">
                  {po.number}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums">{won(po.totalCost)}</span>
                  <Pill tone={po.status === "RECEIVED" ? "good" : po.status === "CANCELLED" ? "bad" : "warn"}>{PO_LABEL[po.status]}</Pill>
                </span>
              </li>
            ))}
            {s.purchaseOrders.length === 0 && <li className="py-2 text-charcoal/50">발주 내역이 없습니다.</li>}
          </ul>
        </section>
      </div>
      <SupplierForm s={s} />
    </>
  );
}
