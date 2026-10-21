import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicProducts } from "@/lib/catalog";
import { recommend } from "@/lib/recommend";

const schema = z.object({
  tastes: z.array(z.enum(["sweet", "dry", "acidic", "aromatic", "full", "sparkling", "smooth"])).max(7),
  types: z.array(z.enum(["DISTILLED_SOJU", "YAKJU", "CHEONGJU", "TAKJU", "FRUIT_WINE", "OTHER"])).max(6),
  food: z.string().max(20).optional(),
  purpose: z.enum(["self", "gift"]).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const products = (await getPublicProducts()).filter((p) => p.eligibility !== "INELIGIBLE");
  const results = recommend(products, parsed.data).map((r) => ({
    slug: r.product.slug,
    name: r.product.name,
    brewery: r.product.brewery.name,
    liquorType: r.product.liquorType,
    imageUrl: r.product.imageUrl,
    imageAlt: r.product.imageAlt,
    abv: r.product.abv,
    volumeMl: r.product.volumeMl,
    summary: r.product.summary,
    price: r.product.price,
    priceMode: r.product.priceMode,
    isDemo: r.product.isDemo,
    reasons: r.reasons,
  }));
  return NextResponse.json({ results });
}
