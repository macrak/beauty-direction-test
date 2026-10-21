import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publicWhere } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const s = await getSettings();
  const [products, breweries, articles] = await Promise.all([
    prisma.product.findMany({ where: publicWhere(s), select: { slug: true, updatedAt: true } }),
    prisma.brewery.findMany({ where: { onboardingStatus: "LISTED", ...(s.showDemoData ? {} : { isDemo: false }) }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, ...(s.showDemoData ? {} : { isDemo: false }) },
      select: { slug: true, updatedAt: true },
    }),
  ]);
  const statics = ["", "/collection", "/masters", "/limited", "/gift", "/breweries", "/taste", "/corporate", "/story", "/partnership", "/support", "/magazine"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}` })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt })),
    ...breweries.map((b) => ({ url: `${base}/breweries/${b.slug}`, lastModified: b.updatedAt })),
    ...articles.map((a) => ({ url: `${base}/magazine/${a.slug}`, lastModified: a.updatedAt })),
  ];
}
