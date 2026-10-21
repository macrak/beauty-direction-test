import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCover from "@/components/ArticleCover";
import { DemoBadge } from "@/components/Badges";
import Reveal from "@/components/Reveal";
import { ARTICLE_CATEGORY, getPublishedArticles, type ArticleCategoryKey } from "@/lib/magazine";

export const metadata: Metadata = {
  title: "매거진",
  description: "대한민국 명주 이야기, 장인 인터뷰, 선물 가이드, 페어링, 보관·음용 가이드, 양조장 탐방.",
  alternates: { canonical: "/magazine" },
};

export default async function MagazinePage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category && searchParams.category in ARTICLE_CATEGORY ? (searchParams.category as ArticleCategoryKey) : undefined;
  const list = await getPublishedArticles(category ? { category } : {});
  const [lead, ...rest] = list;
  return (
    <div className="container-site pt-12 md:pt-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Journal</p>
        <h1 className="h-display mt-4">술의 격, 매거진</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-charcoal/60">술을 빚는 사람과 땅, 그리고 술을 곁에 두는 법에 관한 기록.</p>
      </header>

      <nav className="mt-10 flex flex-wrap gap-2 border-b border-line pb-6" aria-label="매거진 카테고리">
        <Link href="/magazine" className={`chip ${!category ? "chip-active" : ""}`}>
          전체
        </Link>
        {(Object.keys(ARTICLE_CATEGORY) as ArticleCategoryKey[]).map((k) => (
          <Link key={k} href={`/magazine?category=${k}`} className={`chip ${category === k ? "chip-active" : ""}`}>
            {ARTICLE_CATEGORY[k].label}
          </Link>
        ))}
      </nav>

      {!lead ? (
        <p className="py-24 text-center text-sm text-charcoal/50">준비 중인 이야기입니다.</p>
      ) : (
        <>
          <Reveal>
            <Link href={`/magazine/${lead.slug}`} className="group mt-12 grid items-center gap-8 md:grid-cols-12 md:gap-14">
              <div className="relative overflow-hidden md:col-span-7">
                <ArticleCover a={lead} className="transition duration-700 group-hover:scale-[1.02]" />
                {lead.isDemo && <DemoBadge className="absolute left-4 top-4" />}
              </div>
              <div className="md:col-span-5">
                <p className="eyebrow">
                  {ARTICLE_CATEGORY[lead.category].en}
                  {lead.readMinutes ? ` · ${lead.readMinutes} min read` : ""}
                </p>
                <h2 className="mt-4 font-kserif text-3xl font-light leading-snug transition group-hover:text-burgundy md:text-4xl">{lead.title}</h2>
                {lead.subtitle && <p className="mt-3 font-serif text-lg italic text-charcoal/50">{lead.subtitle}</p>}
                {lead.excerpt && <p className="mt-6 text-[15px] leading-loose text-charcoal/65">{lead.excerpt}</p>}
                <span className="link-underline mt-8 inline-block text-sm">읽기 →</span>
              </div>
            </Link>
          </Reveal>
          {rest.length > 0 && (
            <div className="mt-20 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Reveal key={a.id}>
                  <ArticleCard a={a} />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
