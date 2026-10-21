import { PageTitle } from "@/components/admin/AdminShell";
import ArticleForm from "@/components/admin/ArticleForm";
import { requireStaff } from "@/lib/auth";
import { saveArticle } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";

export default async function NewArticle() {
  await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const [products, breweries] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brewery: { select: { name: true } } } }),
    prisma.brewery.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <PageTitle title="새 글" />
      <ArticleForm products={products} breweries={breweries} action={saveArticle} />
    </>
  );
}
