import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCover from "@/components/ArticleCover";
import ArticleCard from "@/components/ArticleCard";
import ProductCard from "@/components/ProductCard";
import { DemoBadge } from "@/components/Badges";
import { getPublicProducts } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getCurrentNotice } from "@/lib/legal";
import { ARTICLE_CATEGORY, getPublishedArticles, parseBody } from "@/lib/magazine";
import { dateKo } from "@/lib/format";

type Params = { params: { slug: string } };

async function load(slug: string) {
  const [a] = await getPublishedArticles({ slug }, 1);
  return a ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const a = await load(params.slug);
  if (!a) return {};
  return {
    title: a.metaTitle || a.title,
    description: a.metaDescription || a.excerpt || a.subtitle || undefined,
    alternates: { canonical: `/magazine/${a.slug}` },
    openGraph: { type: "article", title: a.title, publishedTime: a.publishedAt?.toISOString() },
  };
}

export default async function ArticlePage({ params }: Params) {
  const a = await load(params.slug);
  if (!a) notFound();
  const links = await prisma.articleProduct.findMany({ where: { articleId: a.id }, orderBy: { position: "asc" }, select: { productId: true } });
  const [products, warning, more] = await Promise.all([
    links.length ? getPublicProducts({ id: { in: links.map((l) => l.productId) } }) : Promise.resolve([]),
    getCurrentNotice("HEALTH_WARNING"),
    getPublishedArticles({ NOT: { id: a.id } }, 3),
  ]);
  const ordered = links.map((l) => products.find((p) => p.id === l.productId)).filter((p): p is NonNullable<typeof p> => !!p);
  const blocks = parseBody(a.body);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    datePublished: a.publishedAt?.toISOString(),
    dateModified: a.updatedAt.toISOString(),
    author: { "@type": "Organization", name: a.author ?? "SOOL RESERVE" },
    publisher: { "@type": "Organization", name: "SOOL RESERVE" },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="container-site max-w-4xl pt-12 text-center md:pt-20">
        <Link href={`/magazine?category=${a.category}`} className="eyebrow hover:text-burgundy">
          {ARTICLE_CATEGORY[a.category].en} · {ARTICLE_CATEGORY[a.category].label}
        </Link>
        <h1 className="mx-auto mt-6 max-w-3xl font-kserif text-3xl font-light leading-snug md:text-5xl md:leading-tight">{a.title}</h1>
        {a.subtitle && <p className="mt-4 font-serif text-lg italic text-charcoal/55 md:text-xl">{a.subtitle}</p>}
        <p className="mt-8 text-xs tracking-wider text-charcoal/45">
          {a.author ?? "SOOL RESERVE 편집부"} · {dateKo(a.publishedAt)}
          {a.readMinutes ? ` · ${a.readMinutes}분 읽기` : ""}
        </p>
      </header>

      <figure className="container-site mt-12 max-w-6xl">
        <div className="relative">
          <ArticleCover a={a} />
          {a.isDemo && <DemoBadge className="absolute left-4 top-4" />}
        </div>
        {a.coverImageCredit && <figcaption className="mt-2 text-right text-[10px] text-charcoal/40">사진 {a.coverImageCredit}</figcaption>}
      </figure>

      <div className="container-site mt-14 max-w-2xl md:mt-20">
        {a.excerpt && <p className="mb-12 font-kserif text-xl leading-relaxed text-charcoal/85 md:text-2xl">{a.excerpt}</p>}
        <div className="space-y-7 text-[16px] leading-[2] text-charcoal/80">
          {blocks.map((b, i) => {
            switch (b.type) {
              case "h2":
                return (
                  <h2 key={i} className="!mt-14 font-kserif text-2xl font-light text-charcoal">
                    {b.text}
                  </h2>
                );
              case "quote":
                return (
                  <blockquote key={i} className="!my-12 border-l-2 border-gold py-1 pl-6 font-kserif text-xl leading-relaxed text-burgundy md:text-2xl">
                    {b.text}
                  </blockquote>
                );
              case "ul":
                return (
                  <ul key={i} className="space-y-2 border-y border-line py-6">
                    {b.items.map((x) => (
                      <li key={x} className="flex gap-3">
                        <span className="mt-[0.9em] h-px w-3 shrink-0 bg-gold" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                );
              default:
                return <p key={i}>{b.text}</p>;
            }
          })}
        </div>
        {a.brewery && (
          <p className="mt-14 border-t border-line pt-6 text-sm">
            이 글의 양조장 —{" "}
            <Link href={`/breweries/${a.brewery.slug}`} className="link-underline text-burgundy">
              {a.brewery.name}
            </Link>
          </p>
        )}
        {a.isDemo && <p className="mt-6 text-xs text-charcoal/45">DEMO · 화면 구성을 위한 예시 콘텐츠입니다. 등장하는 양조장·인물·상품은 가상입니다.</p>}
        {warning && <p className="mt-6 bg-beige/70 px-4 py-3 text-[11px] leading-relaxed text-charcoal/60">{warning.body}</p>}
      </div>

      {ordered.length > 0 && (
        <section className="container-site mt-24">
          <p className="eyebrow">In This Story</p>
          <h2 className="h-section mb-10 mt-3">이야기 속의 술</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {ordered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="container-site mt-24 border-t border-line pt-16">
          <p className="eyebrow">More Stories</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {more.map((x) => (
              <ArticleCard key={x.id} a={x} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
