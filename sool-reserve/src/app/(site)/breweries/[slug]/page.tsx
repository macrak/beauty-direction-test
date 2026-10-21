import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreweryVisual from "@/components/BreweryVisual";
import { DemoBadge } from "@/components/Badges";
import { ProductGrid } from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getPublicProducts } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

type Params = { params: { slug: string } };

async function load(slug: string) {
  const settings = await getSettings();
  const b = await prisma.brewery.findFirst({
    where: { slug, onboardingStatus: "LISTED", ...(settings.showDemoData ? {} : { isDemo: false }) },
  });
  return b ? { b, settings } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await load(params.slug);
  if (!r) return {};
  return { title: r.b.name, description: `${r.b.region} ${r.b.name} — ${r.b.tagline ?? ""}`, alternates: { canonical: `/breweries/${r.b.slug}` } };
}

export default async function BreweryPage({ params }: Params) {
  const r = await load(params.slug);
  if (!r) notFound();
  const { b, settings } = r;
  const products = await getPublicProducts({ breweryId: b.id }, settings);
  const story: [string, string | null][] = [
    ["양조장의 역사", b.history],
    ["장인 이야기", b.artisan],
    ["원료의 생산 지역", b.ingredientOrigin],
    ["물과 누룩", b.waterAndNuruk],
    ["전통 제조 방법", b.method],
    ["숙성 과정", b.aging],
    ["제조 철학", b.philosophy],
    ["수상 내역", b.awardsVerified ? b.awards : null],
  ];
  return (
    <>
      <section className="container-site grid items-center gap-10 pt-10 md:grid-cols-2 md:gap-16 md:pt-16">
        <div className="relative">
          {b.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.imageUrl} alt={`${b.name} 양조장`} className="aspect-[10/7] w-full object-cover" />
          ) : (
            <BreweryVisual seed={b.name.length} />
          )}
          {b.isDemo && <DemoBadge className="absolute left-4 top-4" />}
        </div>
        <div>
          <p className="eyebrow">
            {b.region}
            {b.foundedYear ? ` · Since ${b.foundedYear}` : ""}
          </p>
          <h1 className="h-display mt-4">{b.name}</h1>
          {b.nameEn && <p className="mt-2 font-serif text-lg italic text-charcoal/50">{b.nameEn}</p>}
          {b.tagline && <p className="mt-6 font-kserif text-lg text-burgundy">“{b.tagline}”</p>}
          {b.artisanTitle && <p className="mt-4 text-xs tracking-wider text-gold-deep">{b.artisanTitle}</p>}
          {b.isDemo && <p className="mt-6 text-xs text-charcoal/50">DEMO · 화면 구성을 위한 가상 양조장으로, 실제 입점 업체가 아닙니다.</p>}
        </div>
      </section>

      <section className="container-site mt-24 md:mt-32">
        <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {story
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <Reveal key={k}>
                <div className="grid gap-3 py-8 md:grid-cols-4">
                  <h2 className="eyebrow md:pt-1">{k}</h2>
                  <p className="text-[15px] leading-loose text-charcoal/75 md:col-span-3">{v}</p>
                </div>
              </Reveal>
            ))}
        </div>
        {b.videoUrl && (
          <p className="mt-8 text-center">
            <a href={b.videoUrl} target="_blank" rel="noreferrer" className="link-underline text-sm">
              양조 과정 영상 보기 →
            </a>
          </p>
        )}
      </section>

      {products.length > 0 && (
        <section className="container-site mt-24 md:mt-32">
          <p className="eyebrow">Signature</p>
          <h2 className="h-section mb-12 mt-3">대표 제품</h2>
          <ProductGrid products={products} />
        </section>
      )}
    </>
  );
}
