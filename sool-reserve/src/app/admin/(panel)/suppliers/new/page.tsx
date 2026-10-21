import { PageTitle } from "@/components/admin/AdminShell";
import SupplierForm from "@/components/admin/SupplierForm";
import { requireStaff } from "@/lib/auth";

export default async function NewSupplier() {
  await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  return (
    <>
      <PageTitle title="공급처 등록" />
      <SupplierForm />
    </>
  );
}
