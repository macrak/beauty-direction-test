import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { requireStaff } from "@/lib/auth";
import { createPurchaseOrder } from "@/lib/commerce-actions";
import { prisma } from "@/lib/db";
import { won } from "@/lib/format";

export default async function NewPO({ searchParams }: { searchParams: { supplier?: string } }) {
  await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  const suppliers = await prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  const s = searchParams.supplier ? await prisma.supplier.findUnique({ where: { id: searchParams.supplier }, include: { products: { orderBy: { name: "asc" } } } }) : null;
  if (!s) {
    return (
      <>
        <PageTitle title="발주서 작성" desc="공급처를 선택하세요." />
        <div className="grid gap-3 md:grid-cols-3">
          {suppliers.map((x) => (
            <Link key={x.id} href={`?supplier=${x.id}`} className="adm-card block hover:border-charcoal">
              <p className="font-medium">{x.name}</p>
              <p className="mt-1 text-xs text-charcoal/55">공급 상품 {x._count.products}개 {x.licenseVerified ? "" : "· 면허 미확인"}</p>
            </Link>
          ))}
        </div>
        {suppliers.length === 0 && <p className="adm-card text-sm">먼저 공급처를 등록해 주세요.</p>}
      </>
    );
  }
  return (
    <>
      <PageTitle title={`발주서 작성 · ${s.name}`} desc={`입고 소요 ${s.leadTimeDays ?? "-"}일 · 결제 조건 ${s.paymentTerms ?? "-"}`} />
      {!s.licenseVerified && <p className="mb-4 rounded border border-[#E8C77A] bg-[#FFFBF0] px-3 py-2 text-sm">이 공급처는 주류 판매 면허 확인이 끝나지 않았습니다. 확인 후 발주하세요.</p>}
      <ActionForm action={createPurchaseOrder} submitLabel="발주서 만들기" stickyFooter>
        <input type="hidden" name="supplierId" value={s.id} />
        <div className="adm-card overflow-x-auto p-0">
          <table className="adm-table min-w-[720px]">
            <thead>
              <tr>
                <th>상품</th>
                <th className="text-right">현재 재고</th>
                <th className="text-right">최근 매입가</th>
                <th className="text-right">발주 수량</th>
                <th className="text-right">매입 단가 (VAT 포함)</th>
              </tr>
            </thead>
            <tbody>
              {s.products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name} {p.stock <= 5 && <Pill tone="warn">재고 부족</Pill>}
                  </td>
                  <td className="text-right tabular-nums">{p.stock}</td>
                  <td className="text-right tabular-nums">{p.wholesaleCost ? won(p.wholesaleCost) : "-"}</td>
                  <td className="text-right">
                    <input name={`qty_${p.id}`} type="number" min={0} defaultValue={0} className="adm-input ml-auto w-24 py-1 text-right" aria-label={`${p.name} 발주 수량`} />
                  </td>
                  <td className="text-right">
                    <input name={`cost_${p.id}`} type="number" min={0} step={100} defaultValue={p.wholesaleCost ?? ""} className="adm-input ml-auto w-32 py-1 text-right" aria-label={`${p.name} 매입 단가`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {s.products.length === 0 && <p className="p-6 text-center text-sm text-charcoal/50">이 공급처에 연결된 상품이 없습니다. 상품 수정에서 공급처를 지정하세요.</p>}
        </div>
        <div className="adm-card mt-4">
          <label className="block">
            <span className="adm-label">요청 사항</span>
            <textarea name="note" rows={2} className="adm-input" placeholder="예: 냉장 상품 화요일 입고 요청" />
          </label>
        </div>
      </ActionForm>
    </>
  );
}
