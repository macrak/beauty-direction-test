import Link from "next/link";
import BottleArt from "@/components/BottleArt";
import BreweryVisual from "@/components/BreweryVisual";
import { ProductGrid } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { DemoBadge } from "@/components/Badges";
import { getPublicProducts, getSlotProducts } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { GIFT_PURPOSES } from "@/lib/labels";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const settings = await getSettings();
  const [main, limited, all, breweries] = await Promise.all([
    getSlotProducts("MAIN", settings),
    getSlotProducts("LIMITED", settings),
    getPublicProducts({}, settings),
    prisma.brewery.findMany({
      where: { onboardingStatus: "LISTED", ...(settings.showDemoData ? {} : { isDemo: false }) },
      orderBy: { foundedYear: "asc" },
      take: 3,
    }),
  ]);
  const collection = (main.length ? main : all).slice(0, 8);
  const showPrices = all.some((p) => p.price !== null);
  const tiers = settings.priceTiers.map((min) => ({
    min,
    count: all.filter((p) => p.price !== null && p.price >= min && p.eligibility !== "INELIGIBLE").length,
  }));
  const limitedCount = all.filter((p) => p.isLimited && p.limitedVerified).length;

  return (
    <>
      {/* SECTION 1. HERO */}
      <section className="hero-light relative -mt-16 overflow-hidden md:-mt-20">
        <div className="container-site grid min-h-[100svh] items-center gap-6 pb-16 pt-28 md:grid-cols-2 md:pt-20">
          <div className="order-2 md:order-1">
            <p className="eyebrow animate-[fadeIn_1.2s_ease]">The Reserve of Korean Sool</p>
            <h1 className="h-display mt-6 text-[2.2rem] md:text-6xl">{settings.slogan}</h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-charcoal/65 md:text-base">{settings.subCopy}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/collection" className="btn-primary">
                컬렉션 살펴보기
              </Link>
              <Link href="/story" className="btn-ghost">
                브랜드 스토리
              </Link>
            </div>
          </div>
          <div className="relative order-1 flex justify-center md:order-2">
            <div className="absolute top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(182,154,104,0.28)_0%,rgba(247,244,238,0)_65%)]" />
            <BottleArt type="YAKJU" className="relative h-[46vh] w-auto drop-shadow-[0_30px_40px_rgba(32,32,32,0.18)] md:h-[68vh]" label="SOOL RESERVE" />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-luxe text-charcoal/40 md:flex">
          SCROLL
          <span className="h-10 w-px bg-charcoal/25" />
        </div>
      </section>

      {/* SECTION 2. THE COLLECTION */}
      <section className="container-site py-24 md:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="The Collection"
            title="대한민국의 명주를 만나다."
            desc="양조장의 신뢰, 술의 완성도, 이야기와 희소성. 열 가지 기준으로 엄선한 전통주입니다."
            action={
              <Link href="/collection" className="link-underline text-sm">
                전체 컬렉션 보기 →
              </Link>
            }
          />
        </Reveal>
        <Reveal>
          <ProductGrid products={collection} />
        </Reveal>
      </section>

      {/* SECTION 3. PRICE COLLECTION — 가격이 표시되는 모드에서만 노출 */}
      {showPrices && (
        <section className="border-y border-line bg-beige/40 py-24 md:py-28">
          <div className="container-site">
            <Reveal>
              <SectionHeading eyebrow="Price Collection" title="가치에 맞는 한 병을 고르다." desc="가격대별로 엄선한 컬렉션. 표시 가격은 참고 소비자가입니다." align="center" />
            </Reveal>
            <Reveal className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-5">
              {tiers.map((t) => (
                <Link key={t.min} href={`/collection?min=${t.min}`} className="group flex flex-col items-center gap-2 bg-ivory px-4 py-10 text-center transition hover:bg-white">
                  <span className="font-serif text-2xl md:text-3xl">{t.min / 10000}만 원</span>
                  <span className="text-xs tracking-wider text-charcoal/50">이상 · {t.count}종</span>
                </Link>
              ))}
              <Link href="/limited" className="group col-span-2 flex flex-col items-center gap-2 bg-burgundy px-4 py-10 text-center text-ivory transition hover:bg-[#3d1922] md:col-span-1">
                <span className="font-kserif text-xl md:text-2xl">특별 한정판</span>
                <span className="text-xs tracking-wider text-ivory/60">{limitedCount}종</span>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* SECTION 4. MASTER BREWERIES */}
      <section className="container-site py-24 md:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Master Breweries"
            title="술을 빚는 사람들."
            desc="한 병의 술 뒤에는 물과 쌀, 누룩, 그리고 수십 년을 이어 온 손이 있습니다."
            action={
              <Link href="/breweries" className="link-underline text-sm">
                모든 양조장 →
              </Link>
            }
          />
        </Reveal>
        <div className="space-y-20 md:space-y-28">
          {breweries.map((b, i) => (
            <Reveal key={b.id}>
              <article className={`grid items-center gap-8 md:grid-cols-12 md:gap-16 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative md:col-span-6">
                  <BreweryVisual seed={i} />
                  {b.isDemo && <DemoBadge className="absolute left-4 top-4" />}
                </div>
                <div className="md:col-span-6">
                  <p className="eyebrow">
                    {b.region} · Since {b.foundedYear}
                  </p>
                  <h3 className="mt-4 font-kserif text-2xl md:text-3xl">{b.name}</h3>
                  <p className="mt-2 font-serif text-lg italic text-charcoal/50">{b.tagline}</p>
                  <p className="mt-6 text-[15px] leading-loose text-charcoal/70">{b.history}</p>
                  <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 text-sm">
                    <div>
                      <dt className="text-xs text-charcoal/45">물과 누룩</dt>
                      <dd className="mt-1 leading-relaxed">{b.waterAndNuruk}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-charcoal/45">제조 방식</dt>
                      <dd className="mt-1 leading-relaxed">{b.method}</dd>
                    </div>
                  </dl>
                  <Link href={`/breweries/${b.slug}`} className="link-underline mt-8 inline-block text-sm">
                    양조장 이야기 →
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 5. PREMIUM GIFT */}
      <section className="bg-charcoal py-24 text-ivory md:py-32">
        <div className="container-site">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <p className="font-serif text-xs uppercase tracking-luxe text-gold">Premium Gift</p>
              <h2 className="h-section mt-3">마음을 전하는 가장 품격 있는 방법.</h2>
              <p className="mt-4 text-sm leading-relaxed text-ivory/55 md:text-[15px]">받는 분과 자리에 맞춰 고른 선물 컬렉션.</p>
            </div>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-px bg-ivory/10 md:grid-cols-3">
            {GIFT_PURPOSES.map((g) => (
              <Link key={g.key} href={`/gift?purpose=${encodeURIComponent(g.key)}`} className="group bg-charcoal p-6 transition hover:bg-[#2a2a2a] md:p-10">
                <p className="font-serif text-xs uppercase tracking-luxe text-gold/80">{g.en}</p>
                <h3 className="mt-3 font-kserif text-lg md:text-2xl">{g.key}</h3>
                <p className="mt-3 text-xs leading-relaxed text-ivory/50 md:text-sm">{g.desc}</p>
                <span className="mt-6 inline-block text-xs text-ivory/60 transition group-hover:translate-x-1 group-hover:text-gold">둘러보기 →</span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* SECTION 6. LIMITED EDITION */}
      {limited.length > 0 && (
        <section className="container-site py-24 md:py-32">
          <Reveal>
            <SectionHeading
              eyebrow="Limited Edition"
              title="쉽게 만날 수 없는 특별한 한 병."
              desc="생산 수량이 검증된 한정 생산 제품만 소개합니다."
              action={
                <Link href="/limited" className="link-underline text-sm">
                  리미티드 전체 →
                </Link>
              }
            />
          </Reveal>
          <Reveal className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {limited.map((p) => (
              <div key={p.id}>
                <ProductCard p={p} />
                {p.productionCount && <p className="mt-2 font-serif text-sm italic text-burgundy">{p.productionCount.toLocaleString()} bottles only</p>}
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {/* SECTION 7. TASTE DISCOVERY */}
      <section className="border-y border-line bg-beige/50 py-24 md:py-32">
        <div className="container-site grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Taste Discovery</p>
            <h2 className="h-section mt-3">당신의 취향에 맞는 명주.</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-charcoal/65">
              단맛, 산미, 바디감, 탄산감, 향. 다섯 가지 질문에 답하시면 실제 등록된 맛 정보를 바탕으로 어울리는 술을 추천해 드립니다.
            </p>
            <Link href="/taste" className="btn-primary mt-10">
              취향 찾기 시작
            </Link>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["sweet", "달콤한"],
              ["dry", "드라이한"],
              ["acidic", "산미가 있는"],
              ["aromatic", "향이 풍부한"],
              ["full", "바디감이 높은"],
              ["sparkling", "탄산이 있는"],
            ].map(([k, l]) => (
              <Link key={k} href={`/collection?taste=${k}`} className="border border-charcoal/15 bg-ivory px-4 py-6 text-center font-kserif text-sm transition hover:border-burgundy hover:text-burgundy md:text-base">
                {l}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* SECTION 8. BRAND PHILOSOPHY */}
      <section className="container-site py-28 text-center md:py-40">
        <Reveal>
          <p className="eyebrow">Philosophy</p>
          <h2 className="mx-auto mt-6 max-w-3xl font-kserif text-2xl font-light leading-relaxed md:text-[2.6rem] md:leading-snug">
            좋은 술을 넘어,
            <br />
            가치 있는 술을 선택합니다.
          </h2>
          <div className="mx-auto my-10 h-px w-12 bg-gold" />
          <p className="mx-auto max-w-2xl text-[15px] leading-loose text-charcoal/65">
            우리는 많이 파는 대신 오래 남을 술을 고릅니다. 양조장의 철학과 원료, 시간과 손의 기록을 함께 전하며,
            한 병의 술이 한국의 문화로 기억되도록 큐레이션합니다.
          </p>
          <Link href="/story" className="link-underline mt-10 inline-block text-sm">
            SOOL RESERVE의 선별 기준 →
          </Link>
        </Reveal>
      </section>
    </>
  );
}
