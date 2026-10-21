import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BreweryPhoto from "@/components/BreweryPhoto";
import { ArtisanArt, PROCESS_STEPS, ProcessArt } from "@/components/BreweryVisual";
import { DemoBadge } from "@/components/Badges";
import { ProductGrid } from "@/components/ProductCard";
import ArticleCard from "@/components/ArticleCard";
import Reveal from "@/components/Reveal";
import { getPublicProducts } from "@/lib/catalog";
import { getPublishedArticles } from "@/lib/magazine";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

type Params = { params: { slug: string } };

interface GalleryItem {
  url: string;
  caption?: string;
}

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
  const [products, articles] = await Promise.all([getPublicProducts({ breweryId: b.id }, settings), getPublishedArticles({ breweryId: b.id }, 3)]);
  const gallery = (Array.isArray(b.gallery) ? (b.gallery as unknown as GalleryItem[]) : []).filter((g) => g?.url);
  const story: [string, string | null][] = [
    ["원료의 생산 지역", b.ingredientOrigin],
    ["물과 누룩", b.waterAndNuruk],
    ["전통 제조 방법", b.method],
    ["숙성 과정", b.aging],
    ["수상 내역", b.awardsVerified ? b.awards : null],
  ];
  return (
    <>
      {/* 히어로 */}
      <section className="container-site grid items-center gap-10 pt-10 md:grid-cols-12 md:gap-16 md:pt-16">
        <div className="relative md:col-span-7">
          <BreweryPhoto brewery={b} seed={b.name.length} />
          {b.isDemo && <DemoBadge className="absolute left-4 top-4" />}
        </div>
        <div className="md:col-span-5">
          <p className="eyebrow">
            {b.region}
            {b.foundedYear ? ` · Since ${b.foundedYear}` : ""}
          </p>
          <h1 className="h-display mt-4">{b.name}</h1>
          {b.nameEn && <p className="mt-2 font-serif text-lg italic text-charcoal/50">{b.nameEn}</p>}
          {b.tagline && <p className="mt-6 font-kserif text-lg text-burgundy">“{b.tagline}”</p>}
          {b.history && <p className="mt-6 text-[15px] leading-loose text-charcoal/70">{b.history}</p>}
          {b.isDemo && <p className="mt-6 text-xs text-charcoal/50">DEMO · 화면 구성을 위한 가상 양조장으로, 실제 입점 업체가 아닙니다.</p>}
        </div>
      </section>

      {/* 장인 */}
      {(b.artisan || b.artisanImageUrl) && (
        <section className="mt-24 bg-charcoal py-20 text-ivory md:mt-32 md:py-28">
          <div className="container-site grid items-center gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              {b.artisanImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.artisanImageUrl} alt={`${b.name} 장인`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
              ) : (
                <div className="aspect-[4/5] overflow-hidden opacity-90">
                  <ArtisanArt />
                </div>
              )}
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7">
              <p className="font-serif text-xs uppercase tracking-luxe text-gold">The Artisan</p>
              {b.artisanTitle && <p className="mt-4 text-xs tracking-wider text-gold/80">{b.artisanTitle}</p>}
              <p className="mt-6 font-kserif text-2xl font-light leading-relaxed md:text-3xl">{b.artisan}</p>
              {b.philosophy && (
                <blockquote className="mt-10 border-l border-gold pl-6 font-kserif text-lg text-ivory/80">“{b.philosophy}”</blockquote>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* 제조 과정 */}
      <section className="container-site mt-24 md:mt-32">
        <Reveal>
          <p className="eyebrow">The Process</p>
          <h2 className="h-section mt-3">한 병이 되기까지</h2>
        </Reveal>
        {gallery.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {gallery.map((g, i) => (
              <Reveal key={g.url} delay={i * 80}>
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={g.caption ?? `${b.name} 제조 과정`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  {g.caption && <figcaption className="mt-3 text-sm text-charcoal/65">{g.caption}</figcaption>}
                </figure>
              </Reveal>
            ))}
          </div>
        ) : (
          <ol className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-6">
            {PROCESS_STEPS.map((s, i) => (
              <Reveal key={s.key} delay={i * 60}>
                <li className="list-none">
                  <ProcessArt step={s.key} />
                  <p className="mt-3 font-serif text-xs text-gold-deep">
                    {String(i + 1).padStart(2, "0")} · {s.en}
                  </p>
                  <p className="mt-1 font-kserif text-[15px]">{s.label}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        )}
        <dl className="mx-auto mt-16 max-w-3xl divide-y divide-line border-y border-line">
          {story
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid gap-3 py-6 md:grid-cols-4">
                <dt className="eyebrow md:pt-1">{k}</dt>
                <dd className="text-[15px] leading-loose text-charcoal/75 md:col-span-3">{v}</dd>
              </div>
            ))}
        </dl>
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

      {articles.length > 0 && (
        <section className="container-site mt-24 md:mt-32">
          <p className="eyebrow">Journal</p>
          <h2 className="h-section mb-12 mt-3">{b.name}의 이야기</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      <p className="container-site mt-16">
        <Link href="/breweries" className="link-underline text-sm">
          ← 모든 양조장
        </Link>
      </p>
    </>
  );
}
