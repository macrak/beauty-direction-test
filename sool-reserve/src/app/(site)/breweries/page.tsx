import type { Metadata } from "next";
import Link from "next/link";
import BreweryVisual from "@/components/BreweryVisual";
import { DemoBadge } from "@/components/Badges";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "양조장", description: "SOOL RESERVE가 소개하는 전통주 양조장과 장인의 이야기." };

export default async function BreweriesPage() {
  const settings = await getSettings();
  const breweries = await prisma.brewery.findMany({
    where: { onboardingStatus: "LISTED", ...(settings.showDemoData ? {} : { isDemo: false }) },
    include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
    orderBy: { foundedYear: "asc" },
  });
  return (
    <div className="container-site pt-12 md:pt-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Master Breweries</p>
        <h1 className="h-display mt-4">술을 빚는 사람들.</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-charcoal/60">지역의 물과 쌀, 집안의 누룩, 그리고 시간을 지켜 온 양조장들을 소개합니다.</p>
      </header>
      <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {breweries.map((b, i) => (
          <Reveal key={b.id}>
            <Link href={`/breweries/${b.slug}`} className="group block">
              <div className="relative overflow-hidden">
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrl} alt={`${b.name} 양조장`} className="aspect-[10/7] w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                ) : (
                  <div className="transition duration-700 group-hover:scale-[1.02]">
                    <BreweryVisual seed={i} />
                  </div>
                )}
                {b.isDemo && <DemoBadge className="absolute left-3 top-3" />}
              </div>
              <p className="eyebrow mt-5">
                {b.region}
                {b.foundedYear ? ` · Since ${b.foundedYear}` : ""}
              </p>
              <h2 className="mt-2 font-kserif text-xl">{b.name}</h2>
              <p className="mt-2 text-sm text-charcoal/60">{b.tagline}</p>
              <p className="mt-3 text-xs text-charcoal/45">소개 상품 {b._count.products}종</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
