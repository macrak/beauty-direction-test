import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { requirePartner } from "@/lib/auth";
import { savePartnerProduct } from "@/lib/partner-actions";
import { prisma } from "@/lib/db";
import { ELIGIBILITY_LABEL, PRODUCT_STATUS_LABEL } from "@/lib/labels";

export default async function PartnerEditProduct({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const user = await requirePartner();
  // 테넌트 격리: 다른 양조장 상품 ID로 접근하면 404
  const p = await prisma.product.findFirst({ where: { id: params.id, breweryId: user.breweryId } });
  if (!p) notFound();
  return (
    <>
      <PageTitle title={p.name} desc={`${PRODUCT_STATUS_LABEL[p.status]} · ${ELIGIBILITY_LABEL[p.eligibility]} — 노출 상태·적격성·수수료는 SOOL RESERVE가 관리합니다.`} />
      {searchParams.saved && <p className="mb-4 rounded bg-[#E3EFE5] px-3 py-2 text-sm text-[#22603A]">저장되었습니다.</p>}
      <ProductForm product={p} scopes={{ content: true, curation: false, economics: false }} action={savePartnerProduct} />
    </>
  );
}
