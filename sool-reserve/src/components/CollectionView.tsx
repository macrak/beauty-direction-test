import Link from "next/link";
import { ProductGrid } from "./ProductCard";
import { filterProducts, getPublicProducts, TASTE_FILTERS, type CollectionQuery } from "@/lib/catalog";
import { LIQUOR_TYPE_LABEL, OCCASIONS } from "@/lib/labels";
import { getSettings } from "@/lib/settings";

type SP = Record<string, string | string[] | undefined>;

function parse(sp: SP): CollectionQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined));
  const num = (k: string) => {
    const v = Number(one(k));
    return one(k) && Number.isFinite(v) && v >= 0 ? v : undefined;
  };
  const taste = one("taste");
  return {
    q: one("q") || undefined,
    type: one("type") || undefined,
    taste: taste ? taste.split(",").filter(Boolean) : [],
    occasion: one("occasion") || undefined,
    min: num("min"),
    max: num("max"),
    sort: one("sort") || undefined,
  };
}

function href(base: string, q: CollectionQuery, patch: Partial<CollectionQuery>) {
  const m = { ...q, ...patch };
  const p = new URLSearchParams();
  if (m.q) p.set("q", m.q);
  if (m.type) p.set("type", m.type);
  if (m.taste?.length) p.set("taste", m.taste.join(","));
  if (m.occasion) p.set("occasion", m.occasion);
  if (m.min !== undefined) p.set("min", String(m.min));
  if (m.max !== undefined) p.set("max", String(m.max));
  if (m.sort) p.set("sort", m.sort);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function CollectionView({
  searchParams,
  base,
  special,
  eyebrow,
  title,
  desc,
}: {
  searchParams: SP;
  base: string;
  special?: "master" | "limited";
  eyebrow: string;
  title: string;
  desc: string;
}) {
  const settings = await getSettings();
  const q = parse(searchParams);
  const all = await getPublicProducts({}, settings);
  const list = filterProducts(all, { ...q, special });
  const pricesVisible = all.some((p) => p.price !== null);
  const toggleTaste = (k: string) => (q.taste?.includes(k) ? q.taste.filter((t) => t !== k) : [...(q.taste ?? []), k]);

  return (
    <div className="container-site pb-10 pt-12 md:pt-20">
      <header className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h-display mt-4">{title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-charcoal/60">{desc}</p>
      </header>

      <div className="mt-12 space-y-6 border-y border-line py-8">
        <form action={base} className="flex flex-col gap-3 md:flex-row md:items-end">
          {q.taste?.length ? <input type="hidden" name="taste" value={q.taste.join(",")} /> : null}
          {q.type && <input type="hidden" name="type" value={q.type} />}
          <label className="flex-1">
            <span className="sr-only">검색</span>
            <input name="q" defaultValue={q.q} placeholder="상품명, 양조장, 지역, 원료로 검색" className="w-full border-b border-charcoal/30 bg-transparent py-2.5 text-sm outline-none placeholder:text-charcoal/35 focus:border-charcoal" />
          </label>
          <select name="occasion" defaultValue={q.occasion ?? ""} className="border-b border-charcoal/30 bg-transparent py-2.5 text-sm outline-none" aria-label="상황">
            <option value="">모든 상황</option>
            {OCCASIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          {pricesVisible && (
            <div className="flex items-center gap-2 text-sm">
              <input name="min" type="number" min={0} step={10000} defaultValue={q.min} placeholder="최소 가격" className="w-28 border-b border-charcoal/30 bg-transparent py-2.5 outline-none" aria-label="최소 가격" />
              <span className="text-charcoal/40">~</span>
              <input name="max" type="number" min={0} step={10000} defaultValue={q.max} placeholder="최대 가격" className="w-28 border-b border-charcoal/30 bg-transparent py-2.5 outline-none" aria-label="최대 가격" />
            </div>
          )}
          <select name="sort" defaultValue={q.sort ?? ""} className="border-b border-charcoal/30 bg-transparent py-2.5 text-sm outline-none" aria-label="정렬">
            <option value="">추천순</option>
            <option value="new">신상품순</option>
            {pricesVisible && <option value="price-desc">가격 높은순</option>}
            {pricesVisible && <option value="price-asc">가격 낮은순</option>}
            <option value="abv-desc">도수 높은순</option>
          </select>
          <button className="btn-primary !py-2.5">적용</button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 w-12 text-xs text-charcoal/45">주종</span>
          <Link href={href(base, q, { type: undefined })} className={`chip ${!q.type ? "chip-active" : ""}`}>
            전체
          </Link>
          {Object.entries(LIQUOR_TYPE_LABEL).map(([k, v]) => (
            <Link key={k} href={href(base, q, { type: k })} className={`chip ${q.type === k ? "chip-active" : ""}`}>
              {v}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 w-12 text-xs text-charcoal/45">맛</span>
          {TASTE_FILTERS.map((t) => (
            <Link key={t.key} href={href(base, q, { taste: toggleTaste(t.key) })} className={`chip ${q.taste?.includes(t.key) ? "chip-active" : ""}`}>
              {t.label}
            </Link>
          ))}
        </div>
        {pricesVisible && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 w-12 text-xs text-charcoal/45">가격</span>
            {settings.priceTiers.map((t) => (
              <Link key={t} href={href(base, q, { min: t, max: undefined })} className={`chip ${q.min === t && q.max === undefined ? "chip-active" : ""}`}>
                {t / 10000}만 원 이상
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="my-8 flex items-center justify-between text-xs text-charcoal/50">
        <span>{list.length}개의 술</span>
        {(q.q || q.type || q.taste?.length || q.occasion || q.min !== undefined || q.max !== undefined) && (
          <Link href={base} className="link-underline">
            필터 초기화
          </Link>
        )}
      </div>

      {list.length ? (
        <ProductGrid products={list} />
      ) : (
        <p className="py-24 text-center text-sm text-charcoal/50">조건에 맞는 술이 없습니다. 필터를 조정해 보세요.</p>
      )}
      <p className="mt-16 text-[11px] leading-relaxed text-charcoal/40">
        맛 필터는 등록된 맛 프로필(1~5점)을 기준으로 합니다. 맛 정보가 등록되지 않은 상품은 맛 필터 결과에 포함되지 않습니다.
      </p>
    </div>
  );
}
