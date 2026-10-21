import { PageTitle } from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { savePartnerProduct } from "@/lib/partner-actions";

export default function PartnerNewProduct() {
  return (
    <>
      <PageTitle title="상품 등록" desc="등록 후 '검토 대기' 상태가 되며, 통신판매 적격 확인과 큐레이션 검토 후 공개됩니다." />
      <ProductForm scopes={{ content: true, curation: false, economics: false }} action={savePartnerProduct} />
    </>
  );
}
