import Link from "next/link";
import type { PublicProduct } from "@/lib/catalog";
import { LIQUOR_TYPE_LABEL } from "@/lib/labels";
import ProductImage from "./ProductImage";
import { DemoBadge, ProductBadges } from "./Badges";
import Price from "./Price";

export default function ProductCard({ p }: { p: PublicProduct }) {
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative">
        <ProductImage product={p} sizes="sm" className="aspect-[4/5] transition duration-700 group-hover:bg-[#E6DDCC]" />
        {p.isDemo && <DemoBadge className="absolute left-3 top-3" />}
      </div>
      <div className="mt-4 space-y-1.5">
        <ProductBadges p={p} />
        <p className="text-[11px] tracking-wider text-charcoal/50">
          {p.brewery.name} · {LIQUOR_TYPE_LABEL[p.liquorType]}
        </p>
        <h3 className="font-kserif text-[15px] leading-snug md:text-base">{p.name}</h3>
        {p.summary && <p className="line-clamp-2 text-xs leading-relaxed text-charcoal/60">{p.summary}</p>}
        <p className="text-[11px] text-charcoal/50">
          {p.abv}% · {p.volumeMl}ml
        </p>
        <Price price={p.price} mode={p.priceMode} eligibility={p.eligibility} />
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: PublicProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
