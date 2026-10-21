import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { requireStaff } from "@/lib/auth";
import { deleteProduct, saveProduct } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ELIGIBILITY_LABEL, PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { dateKo } from "@/lib/format";

export default async function EditProduct({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const user = await requireStaff();
  const [p, breweries, s, logs] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.brewery.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, defaultCommissionRate: true } }),
    getSettings(),
    prisma.auditLog.findMany({ where: { entity: "Product", entityId: params.id }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  if (!p) notFound();
  const scopes = {
    content: user.role === "SUPER_ADMIN" || user.role === "CURATOR",
    curation: user.role === "SUPER_ADMIN" || user.role === "CURATOR",
    economics: user.role === "SUPER_ADMIN" || user.role === "FINANCE",
  };
  return (
    <>
      <PageTitle
        title={p.name}
        desc={`${PRODUCT_STATUS_LABEL[p.status]} · ${ELIGIBILITY_LABEL[p.eligibility]}${p.isDemo ? " · DEMO" : ""}`}
        action={
          <div className="flex gap-2">
            {p.status === "PUBLISHED" && (
              <Link href={`/products/${p.slug}`} target="_blank" className="adm-btn-ghost">
                고객 화면 보기 ↗
              </Link>
            )}
            {user.role === "SUPER_ADMIN" && (
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button className="adm-btn-ghost text-[#9B1C1C]">삭제</button>
              </form>
            )}
          </div>
        }
      />
      {searchParams.saved && <p className="mb-4 rounded bg-[#E3EFE5] px-3 py-2 text-sm text-[#22603A]">저장되었습니다. 고객 화면에 반영되었습니다.</p>}
      {!scopes.content && <p className="mb-4 text-sm text-charcoal/60">재무 권한: 수익 구조 항목만 수정할 수 있습니다.</p>}
      <ProductForm product={p} breweries={breweries} scopes={scopes} action={saveProduct} systemRate={s.defaultCommissionRate} />
      {logs.length > 0 && (
        <div className="adm-card mt-4">
          <h2 className="text-sm font-semibold">최근 변경 이력</h2>
          <ul className="mt-2 space-y-1 text-xs text-charcoal/65">
            {logs.map((l) => (
              <li key={l.id}>
                {dateKo(l.createdAt)} {l.createdAt.toLocaleTimeString("ko-KR")} · {l.userEmail} · {l.action}{" "}
                {l.changes && Object.keys(l.changes as object).length > 0 && (
                  <Pill>{Object.entries(l.changes as Record<string, { from: unknown; to: unknown }>).map(([k, v]) => `${k}: ${String(v?.from)}→${String(v?.to)}`).join(", ")}</Pill>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
