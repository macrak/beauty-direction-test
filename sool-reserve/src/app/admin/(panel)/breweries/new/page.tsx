import { PageTitle } from "@/components/admin/AdminShell";
import BreweryForm from "@/components/admin/BreweryForm";
import { requireStaff } from "@/lib/auth";
import { saveBrewery } from "@/lib/admin-actions";

export default async function NewBrewery() {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  return (
    <>
      <PageTitle title="양조장 등록" />
      <BreweryForm action={saveBrewery} canEnableSales={user.role === "SUPER_ADMIN"} />
    </>
  );
}
