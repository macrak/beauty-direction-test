import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AgeNotice from "@/components/AgeNotice";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader brandName={settings.brandName} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
      <AgeNotice />
    </>
  );
}
