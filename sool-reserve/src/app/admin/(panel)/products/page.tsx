import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { productsWithEconomics } from "@/lib/adminData";
import { quickUpdateProduct } from "@/lib/admin-actions";
import { ELIGIBILITY_LABEL, LIQUOR_TYPE_LABEL, PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { pct, won } from "@/lib/format";
import { prisma } from "@/lib/db";

type SP = { q?: string; brewery?: string; status?: string; eligibility?: string; taste?: string; stock?: string };

export default async function ProductsAdmin({ searchParams }: { searchParams: SP }) {
  const where: Prisma.ProductWhereInput = {};
  if (searchParams.q) where.OR = [{ name: { contains: searchParams.q, mode: "insensitive" } }, { nameEn: { contains: searchParams.q, mode: "insensitive" } }];
  if (searchParams.brewery) where.breweryId = searchParams.brewery;
  if (searchParams.status) where.status = searchParams.status as never;
  if (searchParams.eligibility === "pending") where.eligibility = { in: ["UNCHECKED", "IN_REVIEW"] };
  else if (searchParams.eligibility) where.eligibility = searchParams.eligibility as never;
  if (searchParams.taste === "none") where.tasteSource = "NONE";
  if (searchParams.stock === "0") where.stock = 0;
  const [{ rows }, breweries] = await Promise.all([productsWithEconomics(where), prisma.brewery.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]);

  return (
    <>
      <PageTitle
        title="상품 관리"
        desc="판매가·재고·노출 상태는 목록에서 바로 수정할 수 있습니다. 변경은 고객 화면에 즉시 반영되고 변경 이력에 기록됩니다."
        action={
          <Link href="/admin/products/new" className="adm-btn">
            + 상품 등록
          </Link>
        }
      />
      <form className="adm-card mb-4 grid gap-3 md:grid-cols-5">
        <input name="q" defaultValue={searchParams.q} placeholder="상품명 검색" className="adm-input" />
        <select name="brewery" defaultValue={searchParams.brewery ?? ""} className="adm-input">
          <option value="">전체 양조장</option>
          {breweries.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status ?? ""} className="adm-input">
          <option value="">전체 상태</option>
          {Object.entries(PRODUCT_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="eligibility" defaultValue={searchParams.eligibility ?? ""} className="adm-input">
          <option value="">전체 적격 상태</option>
          <option value="pending">미확인·검토 중</option>
          {Object.entries(ELIGIBILITY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button className="adm-btn-ghost">필터</button>
      </form>
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[1100px]">
          <thead>
            <tr>
              <th>상품</th>
              <th>주종</th>
              <th>적격</th>
              <th>맛</th>
              <th className="text-right">수수료율</th>
              <th className="text-right">개당 공헌이익</th>
              <th className="text-right">이익률(수수료 대비)</th>
              <th>판매가 · 재고 · 상태 (즉시 수정)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/products/${r.id}`} className="font-medium hover:underline">
                    {r.name}
                  </Link>
                  <div className="text-xs text-charcoal/50">
                    {r.brewery.name} {r.isDemo && <Pill>DEMO</Pill>}
                  </div>
                </td>
                <td className="text-xs">{LIQUOR_TYPE_LABEL[r.liquorType]}</td>
                <td>
                  <Pill tone={r.eligibility === "VERIFIED" ? "good" : r.eligibility === "INELIGIBLE" ? "bad" : "warn"}>{ELIGIBILITY_LABEL[r.eligibility]}</Pill>
                </td>
                <td>{r.tasteSource === "NONE" ? <Pill tone="warn">미등록</Pill> : <Pill>{r.tasteSource === "MANUFACTURER" ? "제조사" : "자체"}</Pill>}</td>
                <td className="text-right tabular-nums">{r.econ.commissionRate}%</td>
                <td className={`text-right tabular-nums ${r.econ.contribution < 0 ? "text-[#9B1C1C]" : ""}`}>{won(r.econ.contribution)}</td>
                <td className="text-right tabular-nums">{pct(r.econ.marginOnCommission)}</td>
                <td>
                  <form action={quickUpdateProduct} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={r.id} />
                    <input name="price" type="number" step="1000" defaultValue={r.price} className="adm-input w-28 py-1 text-right" aria-label="판매가" />
                    <input name="stock" type="number" defaultValue={r.stock} className="adm-input w-16 py-1 text-right" aria-label="재고" />
                    <select name="status" defaultValue={r.status} className="adm-input w-24 py-1" aria-label="상태">
                      {Object.entries(PRODUCT_STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <button className="adm-btn-ghost px-2 py-1 text-xs">저장</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-charcoal/50">조건에 맞는 상품이 없습니다.</p>}
      </div>
    </>
  );
}
