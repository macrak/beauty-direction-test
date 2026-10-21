import Link from "next/link";
import ArticleCover from "./ArticleCover";
import { DemoBadge } from "./Badges";
import { ARTICLE_CATEGORY } from "@/lib/magazine";

export default function ArticleCard({
  a,
  size = "md",
}: {
  a: {
    slug: string;
    title: string;
    subtitle: string | null;
    excerpt: string | null;
    category: keyof typeof ARTICLE_CATEGORY;
    coverImageUrl: string | null;
    coverImageAlt: string | null;
    coverTheme: string | null;
    readMinutes: number | null;
    isDemo: boolean;
  };
  size?: "md" | "lg";
}) {
  return (
    <Link href={`/magazine/${a.slug}`} className="group block">
      <div className="relative overflow-hidden">
        <ArticleCover a={a} className="transition duration-700 group-hover:scale-[1.02]" />
        {a.isDemo && <DemoBadge className="absolute left-3 top-3" />}
      </div>
      <p className="eyebrow mt-5">
        {ARTICLE_CATEGORY[a.category].en}
        {a.readMinutes ? ` · ${a.readMinutes} min` : ""}
      </p>
      <h3 className={`mt-2 font-kserif leading-snug transition group-hover:text-burgundy ${size === "lg" ? "text-2xl md:text-3xl" : "text-lg"}`}>{a.title}</h3>
      {(a.excerpt || a.subtitle) && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/60">{a.excerpt ?? a.subtitle}</p>}
    </Link>
  );
}
