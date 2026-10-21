// 고객용 상품 조회 — 반환값은 반드시 PublicProduct(내부 수익 필드 없음)
import type { Brewery, Prisma, Product } from "@prisma/client";
import { prisma } from "./db";
import { canPurchase, priceDisplay, type PriceDisplay } from "./commerce";
import { getSettings, type SiteSettings } from "./settings";

const PUBLIC_PRODUCT_FIELDS = [
  "id", "slug", "name", "nameEn", "region", "liquorType", "legalClass", "eligibility", "summary", "description",
  "abv", "volumeMl", "ingredients", "origin", "productionMethod", "agingMethod", "agingPeriod", "shelfLife",
  "storageGuide", "imageUrl", "imageAlt", "imageCredit", "isMaster", "masterVerified", "isLimited",
  "limitedVerified", "productionCount", "flavorTags", "occasions", "giftPurposes", "pairingCategories",
  "tasteSweetness", "tasteAcidity", "tasteBody", "tasteCarbonation", "tasteAroma", "tasteSource",
  "tasteEvaluatedAt", "tasteNotes", "servingTemp", "glassware", "chillBeforeServing", "afterOpening",
  "aromaNotes", "pairings", "giftRecommendFor", "giftBoxContents", "giftWrapOptions", "shoppingBag",
  "messageCard", "giftDelivery", "storageType", "storageTemp", "coldChainRequired", "coldPackaging", "shipDays",
  "noShipBeforeHoliday", "shipRegions", "protectivePackaging", "carrier", "damagePolicy", "metaTitle",
  "metaDescription", "isDemo", "createdAt",
] as const;

type PublicProductBase = Pick<Product, (typeof PUBLIC_PRODUCT_FIELDS)[number]>;

export interface PublicBrewerySummary {
  slug: string;
  name: string;
  nameEn: string | null;
  region: string;
  isDemo: boolean;
}

export interface PublicProduct extends PublicProductBase {
  price: number | null; // 가격 표시 정책에 따라 null
  priceMode: PriceDisplay;
  purchasable: boolean;
  brewery: PublicBrewerySummary;
}

export function toPublicProduct(
  p: Product & { brewery: Brewery },
  settings: Pick<SiteSettings, "salesMode" | "showReferencePrice">,
): PublicProduct {
  const out = {} as Record<string, unknown>;
  for (const k of PUBLIC_PRODUCT_FIELDS) out[k] = p[k];
  const mode = priceDisplay(settings.salesMode, settings.showReferencePrice);
  return {
    ...(out as PublicProductBase),
    price: mode === "HIDDEN" ? null : p.price,
    priceMode: mode,
    purchasable: canPurchase({ mode: settings.salesMode, product: p, brewery: p.brewery }),
    brewery: {
      slug: p.brewery.slug,
      name: p.brewery.name,
      nameEn: p.brewery.nameEn,
      region: p.brewery.region,
      isDemo: p.brewery.isDemo,
    },
  };
}

export function publicWhere(settings: SiteSettings): Prisma.ProductWhereInput {
  return {
    status: "PUBLISHED",
    brewery: { onboardingStatus: "LISTED" },
    ...(settings.showDemoData ? {} : { isDemo: false }),
  };
}

export async function getPublicProducts(extra: Prisma.ProductWhereInput = {}, settingsArg?: SiteSettings) {
  const settings = settingsArg ?? (await getSettings());
  const rows = await prisma.product.findMany({
    where: { AND: [publicWhere(settings), extra] },
    include: { brewery: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((p) => toPublicProduct(p, settings));
}

export async function getPublicProduct(slug: string) {
  const settings = await getSettings();
  const p = await prisma.product.findFirst({
    where: { AND: [publicWhere(settings), { slug }] },
    include: { brewery: true },
  });
  return p ? { product: toPublicProduct(p, settings), brewery: p.brewery, settings } : null;
}

export async function getSlotProducts(slot: "MAIN" | "GIFT" | "PROFIT" | "LIMITED" | "SEASONAL", settingsArg?: SiteSettings) {
  const settings = settingsArg ?? (await getSettings());
  const now = new Date();
  const slots = await prisma.featuredSlot.findMany({
    where: {
      slot,
      product: publicWhere(settings),
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    include: { product: { include: { brewery: true } } },
    orderBy: { position: "asc" },
  });
  return slots.map((s) => toPublicProduct(s.product, settings));
}

// ─── 컬렉션 필터 ────────────────────────────────────────

export const TASTE_FILTERS: { key: string; label: string; test: (p: PublicProduct) => boolean }[] = [
  { key: "sweet", label: "달콤한", test: (p) => (p.tasteSweetness ?? 0) >= 4 },
  { key: "dry", label: "드라이한", test: (p) => p.tasteSweetness !== null && p.tasteSweetness <= 2 },
  { key: "acidic", label: "산미가 있는", test: (p) => (p.tasteAcidity ?? 0) >= 4 },
  { key: "aromatic", label: "향이 풍부한", test: (p) => (p.tasteAroma ?? 0) >= 4 },
  { key: "full", label: "바디감이 높은", test: (p) => (p.tasteBody ?? 0) >= 4 },
  { key: "sparkling", label: "탄산이 있는", test: (p) => (p.tasteCarbonation ?? 0) >= 3 },
  { key: "smooth", label: "부드러운", test: (p) => p.flavorTags.includes("부드러운") },
  { key: "strong", label: "고도수", test: (p) => p.abv >= 30 },
];

export interface CollectionQuery {
  q?: string;
  type?: string;
  taste?: string[];
  occasion?: string;
  min?: number;
  max?: number;
  special?: "master" | "limited";
  sort?: string;
}

export function filterProducts(list: PublicProduct[], f: CollectionQuery): PublicProduct[] {
  let out = list;
  if (f.q) {
    const q = f.q.trim().toLowerCase();
    out = out.filter((p) =>
      [p.name, p.nameEn, p.brewery.name, p.region, p.summary, p.ingredients]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q)),
    );
  }
  if (f.type) out = out.filter((p) => p.liquorType === f.type);
  if (f.special === "master") out = out.filter((p) => p.isMaster && p.masterVerified);
  if (f.special === "limited") out = out.filter((p) => p.isLimited && p.limitedVerified);
  for (const t of f.taste ?? []) {
    const rule = TASTE_FILTERS.find((x) => x.key === t);
    if (rule) out = out.filter(rule.test);
  }
  if (f.occasion) out = out.filter((p) => p.occasions.includes(f.occasion!));
  // 가격 필터는 가격이 표시되는 모드에서만 적용
  if (f.min !== undefined) out = out.filter((p) => p.price !== null && p.price >= f.min!);
  if (f.max !== undefined) out = out.filter((p) => p.price !== null && p.price <= f.max!);

  const sorted = [...out];
  switch (f.sort) {
    case "price-desc":
      sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "price-asc":
      sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "abv-desc":
      sorted.sort((a, b) => b.abv - a.abv);
      break;
    case "new":
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
  }
  return sorted;
}
