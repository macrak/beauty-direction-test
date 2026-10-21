import type { Prisma } from "@prisma/client";
import { bool, FormError, int, list, num, oneOf, reqStr, str, triBool } from "./form";
import { SCORE_FIELDS, TASTE_AXES } from "./labels";
import { slugify } from "./format";

// 권한별로 수정 가능한 필드 그룹
export interface ProductScopes {
  content: boolean; // 기본 정보·맛·음용·페어링·선물·배송·재고·가격
  curation: boolean; // 명인/한정 검증, 평가 점수, 큐레이션 태그, 노출 상태, 적격성
  economics: boolean; // 수수료·비용·매입 모델
}

const LIQUOR = ["DISTILLED_SOJU", "YAKJU", "CHEONGJU", "TAKJU", "FRUIT_WINE", "OTHER"] as const;

export function parseProductForm(fd: FormData, scopes: ProductScopes): Prisma.ProductUncheckedUpdateInput {
  const data: Prisma.ProductUncheckedUpdateInput = {};

  if (scopes.content) {
    const name = reqStr(fd, "name", "상품명", 120);
    const slugInput = str(fd, "slug", 120);
    const slug = slugify(slugInput || str(fd, "nameEn", 120) || name);
    if (!slug) throw new FormError("URL(slug)을 입력해 주세요.");
    const abv = num(fd, "abv", { min: 0, max: 100, label: "도수" });
    const volumeMl = int(fd, "volumeMl", { min: 1, max: 20000, label: "용량" });
    const price = int(fd, "price", { min: 0, max: 100_000_000, label: "판매가" });
    if (abv === null || volumeMl === null || price === null) throw new FormError("도수, 용량, 판매가는 필수입니다.");
    const ingredients = reqStr(fd, "ingredients", "원재료 및 함량", 1000);

    const taste: Record<string, number | null> = {};
    for (const a of TASTE_AXES) taste[a.key] = int(fd, a.key, { min: 1, max: 5, label: a.label });
    const tasteSource = oneOf(fd, "tasteSource", ["MANUFACTURER", "IN_HOUSE", "NONE"] as const, "NONE");
    const hasTaste = Object.values(taste).some((v) => v !== null);
    if (hasTaste && tasteSource === "NONE") throw new FormError("맛 점수를 입력했다면 출처(제조사 제공/자체 테이스팅)를 선택해 주세요.");

    const pairings = [0, 1, 2, 3, 4, 5]
      .map((i) => ({
        category: str(fd, `pairing_${i}_category`, 20) ?? "",
        name: str(fd, `pairing_${i}_name`, 80) ?? "",
        description: str(fd, `pairing_${i}_description`, 300) ?? undefined,
        recipe: str(fd, `pairing_${i}_recipe`, 1000) ?? undefined,
      }))
      .filter((p) => p.name && p.category);

    const evaluatedAt = str(fd, "tasteEvaluatedAt");
    Object.assign(data, {
      name,
      slug,
      nameEn: str(fd, "nameEn", 120),
      region: str(fd, "region", 60),
      liquorType: oneOf(fd, "liquorType", LIQUOR, "OTHER"),
      summary: str(fd, "summary", 200),
      description: str(fd, "description"),
      abv,
      volumeMl,
      ingredients,
      origin: str(fd, "origin", 300),
      productionMethod: str(fd, "productionMethod", 500),
      agingMethod: str(fd, "agingMethod", 200),
      agingPeriod: str(fd, "agingPeriod", 60),
      shelfLife: str(fd, "shelfLife", 200),
      storageGuide: str(fd, "storageGuide", 300),
      imageAlt: str(fd, "imageAlt", 200),
      imageCredit: str(fd, "imageCredit", 200),
      price,
      stock: int(fd, "stock", { min: 0, max: 1_000_000, label: "재고" }) ?? 0,
      ...taste,
      tasteSource: hasTaste ? tasteSource : "NONE",
      tasteEvaluator: str(fd, "tasteEvaluator", 60),
      tasteEvaluatedAt: evaluatedAt ? new Date(evaluatedAt) : null,
      tasteNotes: str(fd, "tasteNotes", 1000),
      servingTemp: str(fd, "servingTemp", 60),
      glassware: str(fd, "glassware", 60),
      chillBeforeServing: triBool(fd, "chillBeforeServing"),
      afterOpening: str(fd, "afterOpening", 300),
      aromaNotes: str(fd, "aromaNotes", 500),
      pairings,
      pairingCategories: Array.from(new Set(pairings.map((p) => p.category))),
      giftRecommendFor: str(fd, "giftRecommendFor", 200),
      giftBoxContents: str(fd, "giftBoxContents", 300),
      giftWrapOptions: str(fd, "giftWrapOptions", 300),
      shoppingBag: bool(fd, "shoppingBag"),
      messageCard: bool(fd, "messageCard"),
      storageType: oneOf(fd, "storageType", ["AMBIENT", "REFRIGERATED"] as const, "AMBIENT"),
      storageTemp: str(fd, "storageTemp", 60),
      coldChainRequired: bool(fd, "coldChainRequired"),
      coldPackaging: str(fd, "coldPackaging", 200),
      shipDays: list(fd, "shipDays"),
      noShipBeforeHoliday: bool(fd, "noShipBeforeHoliday"),
      shipRegions: str(fd, "shipRegions", 200),
      protectivePackaging: str(fd, "protectivePackaging", 200),
      carrier: str(fd, "carrier", 60),
      shippingFee: int(fd, "shippingFee", { min: 0, max: 1_000_000, label: "배송비" }) ?? 0,
      damagePolicy: str(fd, "damagePolicy", 500),
      metaTitle: str(fd, "metaTitle", 120),
      metaDescription: str(fd, "metaDescription", 300),
    });
  }

  if (scopes.curation) {
    const scores: Record<string, number | null> = {};
    for (const f of SCORE_FIELDS) scores[f.key] = int(fd, f.key, { min: 1, max: 5, label: f.label });
    const isLimited = bool(fd, "isLimited");
    Object.assign(data, {
      status: oneOf(fd, "status", ["DRAFT", "REVIEW", "PUBLISHED", "HIDDEN"] as const, "DRAFT"),
      legalClass: oneOf(fd, "legalClass", ["FOLK", "REGIONAL", "NONE", "UNKNOWN"] as const, "UNKNOWN"),
      eligibility: oneOf(fd, "eligibility", ["UNCHECKED", "IN_REVIEW", "VERIFIED", "INELIGIBLE"] as const, "UNCHECKED"),
      eligibilityNote: str(fd, "eligibilityNote", 1000),
      isMaster: bool(fd, "isMaster"),
      masterVerified: bool(fd, "masterVerified"),
      isLimited,
      limitedVerified: bool(fd, "limitedVerified"),
      productionCount: isLimited ? int(fd, "productionCount", { min: 1, label: "생산 수량" }) : null,
      flavorTags: list(fd, "flavorTags"),
      occasions: list(fd, "occasions"),
      giftPurposes: list(fd, "giftPurposes"),
      giftDelivery: bool(fd, "giftDelivery"),
      sortOrder: int(fd, "sortOrder", { min: -9999, max: 9999, label: "정렬 순서" }) ?? 0,
      ...scores,
      scoreNote: str(fd, "scoreNote", 1000),
    });
    // 법적 분류가 '해당 없음'이면 적격 확인 불가
    if (data.legalClass === "NONE" && data.eligibility === "VERIFIED") {
      throw new FormError("법적 분류가 '해당 없음(일반 주류)'인 상품은 통신판매 적격으로 설정할 수 없습니다.");
    }
  }

  if (scopes.economics) {
    Object.assign(data, {
      tradeModel: oneOf(fd, "tradeModel", ["COMMISSION", "WHOLESALE"] as const, "COMMISSION"),
      vatBasis: oneOf(fd, "vatBasis", ["INCLUSIVE", "EXCLUSIVE"] as const, "INCLUSIVE"),
      commissionRate: num(fd, "commissionRate", { min: 0, max: 100, label: "수수료율" }),
      pgRate: num(fd, "pgRate", { min: 0, max: 20, label: "결제 수수료율" }) ?? 0,
      pgBearer: oneOf(fd, "pgBearer", ["PLATFORM", "SELLER"] as const, "PLATFORM"),
      platformShippingCost: int(fd, "platformShippingCost", { min: 0, label: "플랫폼 부담 배송비" }) ?? 0,
      platformPromoCost: int(fd, "platformPromoCost", { min: 0, label: "플랫폼 부담 프로모션" }) ?? 0,
      otherVariableCost: int(fd, "otherVariableCost", { min: 0, label: "기타 변동비" }) ?? 0,
      wholesaleCost: int(fd, "wholesaleCost", { min: 0, label: "매입가" }),
      expectedMonthlyUnits: int(fd, "expectedMonthlyUnits", { min: 0, label: "예상 월 판매량" }) ?? 0,
    });
  }
  return data;
}

export const AUDITED_PRODUCT_FIELDS = [
  "price",
  "stock",
  "status",
  "eligibility",
  "legalClass",
  "tradeModel",
  "vatBasis",
  "commissionRate",
  "pgRate",
  "pgBearer",
  "platformShippingCost",
  "platformPromoCost",
  "otherVariableCost",
  "isMaster",
  "masterVerified",
  "isLimited",
  "limitedVerified",
  "productionCount",
];
