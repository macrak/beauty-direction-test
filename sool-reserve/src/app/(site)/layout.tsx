import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AgeNotice from "@/components/AgeNotice";
import { getSettings } from "@/lib/settings";
import { commerceSession } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const { allowed } = await commerceSession();
  return (
    <>
      <SiteHeader brandName={settings.brandName} cartEnabled={allowed} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
      <AgeNotice />
    </>
  );
}
