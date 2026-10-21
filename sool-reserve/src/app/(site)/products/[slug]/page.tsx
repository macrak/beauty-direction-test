import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { DemoBadge, ProductBadges } from "@/components/Badges";
import Price from "@/components/Price";
import TasteRadar from "@/components/TasteRadar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getPublicProduct, getPublicProducts } from "@/lib/catalog";
import { getCurrentNotices } from "@/lib/legal";
import { ELIGIBILITY_LABEL, LEGAL_CLASS_LABEL, LIQUOR_TYPE_LABEL, TASTE_AXES, TASTE_SOURCE_LABEL } from "@/lib/labels";
import { dateKo, won } from "@/lib/format";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await getPublicProduct(params.slug);
  if (!r) return {};
  const p = r.product;
  return {
    title: p.metaTitle || `${p.name} — ${p.brewery.name}`,
    description: p.metaDescription || `${p.summary ?? ""} ${LIQUOR_TYPE_LABEL[p.liquorType]} ${p.abv}% ${p.volumeMl}ml.`.trim(),
    alternates: { canonical: `/products/${p.slug}` },
  };
}

interface Pairing {
  category: string;
  name: string;
  description?: string;
  recipe?: string;
}

const PAIRING_ICON: Record<string, string> = {
  한식: "M12 22c6 0 10-4 10-9H2c0 5 4 9 10 9zM6 10l2-6M12 10V3M18 10l-2-6",
  육류: "M4 14c0-5 5-9 10-9 4 0 6 3 6 6 0 5-5 9-10 9-3 0-6-2-6-6zM10 13a2 2 0 104 0 2 2 0 00-4 0",
  해산물: "M2 12c4-6 12-6 16 0-4 6-12 6-16 0zM18 12l4-4v8zM7 11h.01",
  치즈: "M3 17l18-7v9H3zM3 17l9-12 9 5M8 15h.01M15 16h.01",
  디저트: "M5 11h14l-2 10H7zM8 11a4 4 0 118 0M12 3v2",
  "퓨전 요리": "M4 20h16M6 16a6 6 0 0112 0M12 6v4M9 8l3-2 3 2",
};

export default async function ProductPage({ params }: Params) {
  const r = await getPublicProduct(params.slug);
  if (!r) notFound();
  const { product: p, brewery: b } = r;
  const notices = await getCurrentNotices(["HEALTH_WARNING", "INTERMEDIARY"]);
  const related = (await getPublicProducts({ breweryId: b.id, NOT: { id: p.id } })).slice(0, 4);
  const pairings = (Array.isArray(p.pairings) ? (p.pairings as unknown as Pairing[]) : []).filter((x) => x?.name);
  const taste = TASTE_AXES.map((a) => ({ axis: a.label, value: p[a.key] as number | null }));
  const tasteCount = taste.filter((t) => t.value !== null).length;
  const hasGift = p.giftPurposes.length > 0 || p.giftBoxContents || p.giftWrapOptions;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    alternateName: p.nameEn ?? undefined,
    description: p.description ?? p.summary ?? undefined,
    brand: { "@type": "Brand", name: p.brewery.name },
    category: LIQUOR_TYPE_LABEL[p.liquorType],
    // 가격·구매 정보는 실제 판매(LIVE) 상태에서만 구조화 데이터에 포함
    ...(p.purchasable && p.price !== null
      ? { offers: { "@type": "Offer", price: p.price, priceCurrency: "KRW", availability: "https://schema.org/InStock" } }
      : {}),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 상단: 이미지 + 요약 */}
      <section className="container-site grid gap-10 pt-6 md:grid-cols-12 md:gap-16 md:pt-12">
        <div className="md:col-span-7">
          <div className={`relative ${p.gallery.length ? "" : "md:sticky md:top-24"}`}>
            <ProductImage product={p} className="aspect-[4/5]" />
            {p.isDemo && <DemoBadge className="absolute left-4 top-4" />}
          </div>
          {p.gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {p.gallery.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt={`${p.name} 상세 사진 ${i + 1}`} className="aspect-square w-full bg-beige object-cover" loading="lazy" />
              ))}
            </div>
          )}
          {p.imageCredit && <p className="mt-2 text-[10px] text-charcoal/40">사진 {p.imageCredit}</p>}
        </div>
        <div className="md:col-span-5 md:py-8">
          <nav className="text-[11px] tracking-wider text-charcoal/45" aria-label="경로">
            <Link href="/collection" className="hover:text-charcoal">
              컬렉션
            </Link>{" "}
            / {LIQUOR_TYPE_LABEL[p.liquorType]}
          </nav>
          <div className="mt-6">
            <ProductBadges p={p} />
          </div>
          <Link href={`/breweries/${p.brewery.slug}`} className="mt-5 block text-sm tracking-wide text-gold-deep hover:text-burgundy">
            {p.brewery.name}
          </Link>
          <h1 className="mt-2 font-kserif text-3xl font-light leading-snug md:text-4xl">{p.name}</h1>
          {p.nameEn && <p className="mt-2 font-serif text-lg italic text-charcoal/50">{p.nameEn}</p>}
          {p.summary && <p className="mt-6 text-[15px] leading-relaxed text-charcoal/70">{p.summary}</p>}

          <div className="mt-8 grid grid-cols-3 border-y border-line py-5 text-center">
            <Stat label="도수" value={`${p.abv}%`} />
            <Stat label="용량" value={`${p.volumeMl}ml`} />
            <Stat label="지역" value={p.region ?? p.brewery.region} />
          </div>

          <div className="mt-8">
            <Price price={p.price} mode={p.priceMode} eligibility={p.eligibility} size="lg" />
          </div>

          <div className="mt-8 border border-line bg-white/60 p-5 text-sm leading-relaxed">
            {p.purchasable ? (
              <p>구매 가능 상품입니다.</p>
            ) : p.eligibility === "INELIGIBLE" ? (
              <p className="text-charcoal/70">이 상품은 관련 법령상 온라인 판매 대상이 아니어서 정보만 소개합니다.</p>
            ) : (
              <>
                <p className="font-medium">현재 온라인 판매 준비 중입니다.</p>
                <p className="mt-2 text-charcoal/60">
                  판매자 자격과 법적 요건 확인이 완료되면 SOOL RESERVE에서 구매하실 수 있습니다. 선물·대량 구매 상담은{" "}
                  <Link href="/corporate" className="underline underline-offset-4">
                    기업 VIP 상담
                  </Link>
                  을 이용해 주세요.
                </p>
              </>
            )}
          </div>
          {p.isDemo && <p className="mt-4 text-xs text-charcoal/50">DEMO · 화면 구성을 위한 가상 상품입니다. 가격·맛 평가·제조 정보는 실제와 무관합니다.</p>}
          {p.description && <p className="mt-8 text-[15px] leading-loose text-charcoal/75">{p.description}</p>}
        </div>
      </section>

      {/* B. 맛 그래프 */}
      <Section eyebrow="Taste Profile" title="맛의 지도">
        {tasteCount >= 3 ? (
          <div className="grid items-center gap-10 md:grid-cols-2">
            <TasteRadar data={taste} />
            <div>
              <ul className="divide-y divide-line border-y border-line">
                {taste.map((t) => (
                  <li key={t.axis} className="flex items-center justify-between py-3.5 text-sm">
                    <span>{t.axis}</span>
                    {t.value === null ? (
                      <span className="text-xs text-charcoal/40">해당 없음</span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <span className="flex gap-1" aria-hidden>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className={`h-1.5 w-5 ${i <= t.value! ? "bg-burgundy" : "bg-charcoal/10"}`} />
                          ))}
                        </span>
                        <span className="w-8 text-right font-serif">{t.value}/5</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-charcoal/50">
                출처: {TASTE_SOURCE_LABEL[p.tasteSource]}
                {p.tasteEvaluatedAt && ` · 평가일 ${dateKo(p.tasteEvaluatedAt)}`}
                {p.isDemo && " · 데모 값"}
              </p>
              {p.tasteNotes && <p className="mt-4 text-sm leading-relaxed text-charcoal/70">{p.tasteNotes}</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-charcoal/55">아직 검증된 맛 평가 정보가 등록되지 않았습니다. 확인된 정보만 표시합니다.</p>
        )}
      </Section>

      {/* A. 기본 정보 */}
      <Section eyebrow="Details" title="상품 정보">
        <dl className="grid gap-x-12 md:grid-cols-2">
          {[
            ["상품명", `${p.name}${p.nameEn ? ` (${p.nameEn})` : ""}`],
            ["제조업체", p.brewery.name],
            ["제조 지역", p.region ?? p.brewery.region],
            ["주종", LIQUOR_TYPE_LABEL[p.liquorType]],
            ["알코올 도수", `${p.abv}%`],
            ["용량", `${p.volumeMl}ml`],
            ["원재료 및 함량", p.ingredients],
            ["원산지", p.origin],
            ["제조 방식", p.productionMethod],
            ["숙성 방식 · 기간", [p.agingMethod, p.agingPeriod].filter(Boolean).join(" · ")],
            ["유통기한 · 품질유지기한", p.shelfLife],
            ["보관 방법", p.storageGuide],
            ["법적 분류", LEGAL_CLASS_LABEL[p.legalClass]],
            ["통신판매 적격", ELIGIBILITY_LABEL[p.eligibility] + (p.isDemo ? " (데모)" : "")],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-6 border-b border-line py-4 text-sm">
                <dt className="w-32 shrink-0 text-charcoal/50">{k}</dt>
                <dd className="leading-relaxed">{v}</dd>
              </div>
            ))}
        </dl>
      </Section>

      {/* C. 양조장 스토리 */}
      <section className="mt-24 bg-charcoal py-20 text-ivory md:mt-32 md:py-28">
        <div className="container-site grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="font-serif text-xs uppercase tracking-luxe text-gold">The Brewery</p>
            <h2 className="mt-4 font-kserif text-3xl font-light">{b.name}</h2>
            {b.tagline && <p className="mt-3 font-serif text-lg italic text-ivory/50">{b.tagline}</p>}
            <p className="mt-8 text-[15px] leading-loose text-ivory/70">{b.history}</p>
            <Link href={`/breweries/${b.slug}`} className="mt-8 inline-block text-sm text-gold hover:text-ivory">
              양조장 이야기 전체 보기 →
            </Link>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7">
            <dl className="divide-y divide-ivory/10 border-y border-ivory/10">
              {[
                ["장인 이야기", b.artisan],
                ["원료 생산 지역", b.ingredientOrigin],
                ["물과 누룩", b.waterAndNuruk],
                ["제조 방법", b.method],
                ["숙성", b.aging],
                ["제조 철학", b.philosophy],
                ["수상 내역", b.awardsVerified ? b.awards : null],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string} className="grid gap-2 py-5 md:grid-cols-3">
                    <dt className="text-xs tracking-wider text-gold/80">{k}</dt>
                    <dd className="text-sm leading-relaxed text-ivory/80 md:col-span-2">{v}</dd>
                  </div>
                ))}
            </dl>
            {b.videoUrl && (
              <a href={b.videoUrl} className="mt-6 inline-block text-sm text-gold" target="_blank" rel="noreferrer">
                제조 과정 영상 보기 →
              </a>
            )}
          </Reveal>
        </div>
      </section>

      {/* D. 음용 가이드 */}
      <Section eyebrow="Serving Guide" title="이렇게 즐기세요">
        <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {[
            ["권장 음용 온도", p.servingTemp],
            ["추천 술잔", p.glassware],
            ["냉장 후 음용", p.chillBeforeServing === null ? null : p.chillBeforeServing ? "권장" : "상온 권장"],
            ["개봉 후 보관", p.afterOpening],
          ].map(([k, v]) => (
            <div key={k as string} className="bg-ivory p-6">
              <p className="text-xs text-charcoal/50">{k}</p>
              <p className="mt-3 font-kserif text-[15px] leading-relaxed">{v ?? <span className="text-charcoal/35">확인 중</span>}</p>
            </div>
          ))}
        </div>
        {p.aromaNotes && <p className="mt-6 text-sm leading-relaxed text-charcoal/65">향과 특징 — {p.aromaNotes}</p>}
      </Section>

      {/* E. 음식 페어링 */}
      {pairings.length > 0 && (
        <Section eyebrow="Food Pairing" title="함께하면 좋은 음식">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pairings.map((x) => (
              <div key={x.name} className="border border-line bg-white/50 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-beige">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#4C202B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={PAIRING_ICON[x.category] ?? PAIRING_ICON["한식"]} />
                    </svg>
                  </span>
                  <span className="text-xs tracking-wider text-gold-deep">{x.category}</span>
                </div>
                <h3 className="mt-5 font-kserif text-lg">{x.name}</h3>
                {x.description && <p className="mt-2 text-sm leading-relaxed text-charcoal/65">{x.description}</p>}
                {x.recipe && (
                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer text-xs text-burgundy">간단 레시피</summary>
                    <p className="mt-2 leading-relaxed text-charcoal/65">{x.recipe}</p>
                  </details>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* F. 선물 정보 + 배송·보관 */}
      <Section eyebrow="Gift & Delivery" title="선물과 배송">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h3 className="font-kserif text-lg">선물 정보</h3>
            {hasGift ? (
              <dl className="mt-4 text-sm">
                {[
                  ["추천 대상", p.giftRecommendFor],
                  ["선물 상자 구성", p.giftBoxContents],
                  ["포장 옵션", p.giftWrapOptions],
                  ["쇼핑백", p.shoppingBag ? "제공" : "미제공"],
                  ["메시지 카드", p.messageCard ? "지원" : "미지원"],
                  ["선물 배송", p.giftDelivery ? "가능" : "판매 승인 및 수령인 연령 확인 체계 마련 후 제공"],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k as string} className="flex gap-6 border-b border-line py-3">
                      <dt className="w-28 shrink-0 text-charcoal/50">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-charcoal/55">선물 구성 정보가 아직 등록되지 않았습니다.</p>
            )}
          </div>
          <div>
            <h3 className="font-kserif text-lg">배송 · 보관</h3>
            <dl className="mt-4 text-sm">
              {[
                ["배송 유형", p.storageType === "REFRIGERATED" ? "냉장 배송" : "일반(상온) 배송"],
                ["권장 보관 온도", p.storageTemp],
                ["보냉 포장", p.coldChainRequired ? p.coldPackaging ?? "보냉 포장" : null],
                ["출고 요일", p.shipDays.length ? p.shipDays.join(" · ") : null],
                ["공휴일 전 출고", p.noShipBeforeHoliday ? "출고 제한" : null],
                ["배송 지역", p.shipRegions],
                ["파손 방지 포장", p.protectivePackaging],
                ["파손 처리", p.damagePolicy],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string} className="flex gap-6 border-b border-line py-3">
                    <dt className="w-28 shrink-0 text-charcoal/50">{k}</dt>
                    <dd className="leading-relaxed">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* 판매자 · 법적 고지 */}
      <section className="container-site mt-20">
        <div className="space-y-2 border-t border-line pt-6 text-[11px] leading-relaxed text-charcoal/50">
          <p>
            판매자(제조사): {p.brewery.name}
            {p.isDemo ? " — 데모 데이터로 실제 사업자 정보가 아닙니다." : ""}
          </p>
          {notices.INTERMEDIARY && <p>{notices.INTERMEDIARY.body}</p>}
          {notices.HEALTH_WARNING && <p>{notices.HEALTH_WARNING.body}</p>}
          {p.price !== null && p.priceMode === "REFERENCE" && <p>표시 가격 {won(p.price)}은 참고 소비자가이며 실제 판매가와 다를 수 있습니다.</p>}
        </div>
      </section>

      {related.length > 0 && (
        <Section eyebrow="From the Same Brewery" title={`${p.brewery.name}의 다른 술`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {related.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-wider text-charcoal/45">{label}</p>
      <p className="mt-1.5 font-serif text-lg">{value}</p>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="container-site mt-24 md:mt-32">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h-section mb-10 mt-3">{title}</h2>
        {children}
      </Reveal>
    </section>
  );
}
