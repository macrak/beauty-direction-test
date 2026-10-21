import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import BreweryForm from "@/components/admin/BreweryForm";
import { requireStaff } from "@/lib/auth";
import { saveBrewery } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { PRODUCT_STATUS_LABEL } from "@/lib/labels";

export default async function EditBrewery({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const b = await prisma.brewery.findUnique({
    where: { id: params.id },
    include: { compliance: true, products: { orderBy: { sortOrder: "asc" } }, users: { select: { email: true, active: true } } },
  });
  if (!b) notFound();
  return (
    <>
      <PageTitle
        title={b.name}
        desc={b.isDemo ? "DEMO 데이터 — 실제 입점 업체가 아닙니다." : undefined}
        action={
          b.onboardingStatus === "LISTED" ? (
            <Link href={`/breweries/${b.slug}`} target="_blank" className="adm-btn-ghost">
              고객 화면 보기 ↗
            </Link>
          ) : null
        }
      />
      {searchParams.saved && <p className="mb-4 rounded bg-[#E3EFE5] px-3 py-2 text-sm text-[#22603A]">저장되었습니다.</p>}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="adm-card">
          <h2 className="text-sm font-semibold">소속 상품 ({b.products.length})</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {b.products.map((p) => (
              <li key={p.id} className="flex justify-between">
                <Link href={`/admin/products/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
                <Pill>{PRODUCT_STATUS_LABEL[p.status]}</Pill>
              </li>
            ))}
          </ul>
        </div>
        <div className="adm-card">
          <h2 className="text-sm font-semibold">양조장 전용 계정</h2>
          {b.users.length ? (
            <ul className="mt-2 text-sm">
              {b.users.map((u) => (
                <li key={u.email}>
                  {u.email} {!u.active && <Pill tone="bad">비활성</Pill>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-charcoal/55">계정 없음</p>
          )}
          <Link href="/admin/users" className="mt-3 inline-block text-xs underline">
            계정 · 권한에서 생성
          </Link>
        </div>
      </div>
      <BreweryForm brewery={b} action={saveBrewery} canEnableSales={user.role === "SUPER_ADMIN"} />
    </>
  );
}
