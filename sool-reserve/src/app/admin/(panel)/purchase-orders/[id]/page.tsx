import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { updatePurchaseOrder } from "@/lib/commerce-actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { won } from "@/lib/format";

const PO_LABEL = { DRAFT: "작성 중", ORDERED: "발주 완료", RECEIVED: "입고 완료", CANCELLED: "취소" } as const;

export default async function PODetail({ params }: { params: { id: string } }) {
  const [po, settings] = await Promise.all([
    prisma.purchaseOrder.findUnique({ where: { id: params.id }, include: { supplier: true, items: { include: { product: true } } } }),
    getSettings(),
  ]);
  if (!po) notFound();
  const actions: [string, string][] = po.status === "DRAFT" ? [["ORDERED", "발주 완료로 변경"], ["CANCELLED", "발주 취소"]] : po.status === "ORDERED" ? [["RECEIVED", "입고 처리 (재고 반영)"], ["CANCELLED", "발주 취소"]] : [];
  const b = settings.business;
  return (
    <>
      <PageTitle
        title={`발주서 ${po.number}`}
        desc={`${po.supplier.name} · ${PO_LABEL[po.status]}`}
        action={
          <Link href="/admin/purchase-orders" className="adm-btn-ghost">
            ← 목록
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 발주서 문서 */}
        <article className="rounded-md border border-line bg-white p-6 md:p-10 lg:col-span-2">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-charcoal pb-5">
            <div>
              <p className="font-serif text-xs tracking-[0.3em] text-charcoal/50">PURCHASE ORDER</p>
              <h2 className="mt-1 text-2xl font-semibold">발 주 서</h2>
            </div>
            <div className="text-right text-xs leading-relaxed text-charcoal/70">
              <p className="font-medium tabular-nums text-charcoal">No. {po.number}</p>
              <p>작성일 {po.createdAt.toLocaleDateString("ko-KR")}</p>
              {po.orderedAt && <p>발주일 {po.orderedAt.toLocaleDateString("ko-KR")}</p>}
              {po.receivedAt && <p>입고일 {po.receivedAt.toLocaleDateString("ko-KR")}</p>}
            </div>
          </header>
          <div className="mt-5 grid gap-6 text-sm md:grid-cols-2">
            <div>
              <p className="text-xs text-charcoal/50">공급처 (수신)</p>
              <p className="mt-1 font-medium">{po.supplier.name}</p>
              <p className="text-xs text-charcoal/60">
                {po.supplier.contactName} {po.supplier.phone} {po.supplier.email}
              </p>
              <p className="text-xs text-charcoal/60">
                {po.supplier.licenseType} {po.supplier.licenseNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal/50">발주처 (발신)</p>
              <p className="mt-1 font-medium">{b.companyName}</p>
              <p className="text-xs text-charcoal/60">
                사업자 {b.businessNumber} · {b.phone} · {b.email}
              </p>
              <p className="text-xs text-charcoal/60">{b.address}</p>
            </div>
          </div>
          <table className="adm-table mt-6">
            <thead>
              <tr>
                <th>#</th>
                <th>품목</th>
                <th className="text-right">수량</th>
                <th className="text-right">단가</th>
                <th className="text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((i, idx) => (
                <tr key={i.id}>
                  <td className="text-charcoal/50">{idx + 1}</td>
                  <td>
                    {i.product.name} <span className="text-xs text-charcoal/45">{i.product.volumeMl}ml · {i.product.abv}%</span>
                  </td>
                  <td className="text-right tabular-nums">{i.quantity}</td>
                  <td className="text-right tabular-nums">{won(i.unitCost)}</td>
                  <td className="text-right tabular-nums">{won(i.unitCost * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <dl className="w-64 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-charcoal/55">공급가액</dt>
                <dd className="tabular-nums">{won(Math.floor((po.totalCost * 10) / 11))}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-charcoal/55">부가세</dt>
                <dd className="tabular-nums">{won(po.totalCost - Math.floor((po.totalCost * 10) / 11))}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-charcoal py-2 font-semibold">
                <dt>합계</dt>
                <dd className="tabular-nums">{won(po.totalCost)}</dd>
              </div>
            </dl>
          </div>
          {po.note && <p className="mt-4 border-t border-line pt-4 text-sm">요청 사항 · {po.note}</p>}
          <p className="mt-6 text-xs text-charcoal/50">결제 조건 · {po.supplier.paymentTerms ?? "-"}</p>
        </article>
        <aside className="space-y-4">
          <section className="adm-card">
            <h2 className="text-sm font-semibold">상태</h2>
            <p className="mt-2">
              <Pill tone={po.status === "RECEIVED" ? "good" : po.status === "CANCELLED" ? "bad" : "warn"}>{PO_LABEL[po.status]}</Pill>
            </p>
            <div className="mt-4 space-y-2">
              {actions.map(([to, label]) => (
                <ActionForm key={to} action={updatePurchaseOrder} submitLabel={label}>
                  <input type="hidden" name="id" value={po.id} />
                  <input type="hidden" name="to" value={to} />
                </ActionForm>
              ))}
              {po.status === "RECEIVED" && <p className="text-xs text-charcoal/55">입고 완료 — 재고와 매입가가 반영되었습니다.</p>}
            </div>
          </section>
          <p className="text-xs text-charcoal/50">발주서는 브라우저 인쇄(⌘/Ctrl + P)로 PDF 저장 후 공급처에 전달할 수 있습니다.</p>
        </aside>
      </div>
    </>
  );
}
