import { PageTitle } from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { requireStaff } from "@/lib/auth";
import { saveProduct } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function NewProduct() {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const [breweries, suppliers, s] = await Promise.all([
    prisma.brewery.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, defaultCommissionRate: true } }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, licenseVerified: true } }),
    getSettings(),
  ]);
  return (
    <>
      <PageTitle title="상품 등록" desc={`입점 기준가 ${s.minListingPrice.toLocaleString()}원 이상 상품을 우선 등록합니다. 저장 후 '공개'로 바꿔야 고객 화면에 노출됩니다.`} />
      {breweries.length === 0 ? (
        <p className="adm-card text-sm">먼저 양조장을 등록해 주세요.</p>
      ) : (
        <ProductForm
          breweries={breweries}
          scopes={{ content: true, curation: true, economics: user.role === "SUPER_ADMIN" }}
          action={saveProduct}
          systemRate={s.defaultCommissionRate}
          suppliers={suppliers}
        />
      )}
    </>
  );
}
