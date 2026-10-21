import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { requirePartner } from "@/lib/auth";
import { updatePartnerStock } from "@/lib/partner-actions";
import { prisma } from "@/lib/db";
import { ELIGIBILITY_LABEL, PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { won } from "@/lib/format";

export default async function PartnerHome() {
  const user = await requirePartner();
  const products = await prisma.product.findMany({ where: { breweryId: user.breweryId }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageTitle
        title={`${user.brewery?.name} · 상품과 재고`}
        desc="자사 상품만 조회·수정할 수 있습니다. 신규 상품은 SOOL RESERVE 검토 후 공개됩니다."
        action={
          <Link href="/partner/products/new" className="adm-btn">
            + 상품 등록
          </Link>
        }
      />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th>상품</th>
              <th className="text-right">판매가</th>
              <th>노출</th>
              <th>판매 적격</th>
              <th>출고 요일</th>
              <th>재고 (즉시 수정)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/partner/products/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="text-right tabular-nums">{won(p.price)}</td>
                <td>
                  <Pill>{PRODUCT_STATUS_LABEL[p.status]}</Pill>
                </td>
                <td>
                  <Pill tone={p.eligibility === "VERIFIED" ? "good" : p.eligibility === "INELIGIBLE" ? "bad" : "warn"}>{ELIGIBILITY_LABEL[p.eligibility]}</Pill>
                </td>
                <td className="text-xs">{p.shipDays.join(" ") || "-"}</td>
                <td>
                  <form action={updatePartnerStock} className="flex gap-1.5">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="stock" type="number" min={0} defaultValue={p.stock} className="adm-input w-20 py-1 text-right" aria-label="재고" />
                    <button className="adm-btn-ghost px-2 py-1 text-xs">저장</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-sm text-charcoal/50">등록된 상품이 없습니다.</p>}
      </div>
    </>
  );
}
