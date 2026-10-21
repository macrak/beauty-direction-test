import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/AdminShell";
import ArticleForm from "@/components/admin/ArticleForm";
import { requireStaff } from "@/lib/auth";
import { deleteArticle, saveArticle } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";

export default async function EditArticle({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const [a, products, breweries] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id }, include: { products: { orderBy: { position: "asc" } } } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brewery: { select: { name: true } } } }),
    prisma.brewery.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!a) notFound();
  return (
    <>
      <PageTitle
        title={a.title}
        action={
          <div className="flex gap-2">
            {a.status === "PUBLISHED" && (
              <Link href={`/magazine/${a.slug}`} target="_blank" className="adm-btn-ghost">
                고객 화면 보기 ↗
              </Link>
            )}
            <form action={deleteArticle}>
              <input type="hidden" name="id" value={a.id} />
              <button className="adm-btn-ghost text-[#9B1C1C]">삭제</button>
            </form>
          </div>
        }
      />
      {searchParams.saved && <p className="mb-4 rounded bg-[#E3EFE5] px-3 py-2 text-sm text-[#22603A]">저장되었습니다.</p>}
      <ArticleForm article={a} productIds={a.products.map((p) => p.productId)} products={products} breweries={breweries} action={saveArticle} />
    </>
  );
}
