import { prisma } from "./db";

export type SalesMode = "SHOWCASE" | "PRIVATE_TEST" | "LIVE";

export interface SiteSettings {
  brandName: string;
  brandNameKo: string;
  slogan: string;
  subCopy: string;
  heroImageUrl: string | null;
  heroImageAlt: string;
  salesMode: SalesMode;
  showReferencePrice: boolean;
  showDemoData: boolean;
  defaultCommissionRate: number;
  minListingPrice: number;
  priceTiers: number[];
  curationWeights: Record<string, number>;
  pgContractConfirmed: boolean;
  settlementStructureConfirmed: boolean;
  operatorLicenseConfirmed: boolean;
  giftWrapFee: number;
  business: {
    companyName: string;
    representative: string;
    businessNumber: string;
    mailOrderNumber: string;
    address: string;
    email: string;
    phone: string;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "SOOL RESERVE",
  brandNameKo: "술의 격",
  slogan: "술에도 격이 있습니다.",
  subCopy: "시간과 장인정신이 빚어낸 대한민국의 가장 귀한 술.",
  heroImageUrl: null,
  heroImageAlt: "",
  salesMode: "SHOWCASE",
  showReferencePrice: true,
  showDemoData: true,
  defaultCommissionRate: 15,
  minListingPrice: 100000,
  priceTiers: [100000, 200000, 300000, 500000],
  curationWeights: {
    scoreEligibility: 1.5,
    scoreReputation: 1,
    scoreStory: 1,
    scoreQuality: 1.5,
    scoreRarity: 1,
    scoreDesign: 0.8,
    scoreGift: 1.2,
    scoreProfit: 1.2,
    scoreSupply: 1,
    scoreLogistics: 0.8,
  },
  pgContractConfirmed: false,
  settlementStructureConfirmed: false,
  operatorLicenseConfirmed: false,
  giftWrapFee: 5000,
  business: {
    companyName: "(운영사 등록 전)",
    representative: "-",
    businessNumber: "-",
    mailOrderNumber: "-",
    address: "-",
    email: "hello@soolreserve.example",
    phone: "-",
  },
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<SiteSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    business: { ...DEFAULT_SETTINGS.business, ...(stored.business ?? {}) },
    curationWeights: { ...DEFAULT_SETTINGS.curationWeights, ...(stored.curationWeights ?? {}) },
  };
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  for (const [key, value] of Object.entries(patch)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value as never },
      update: { value: value as never },
    });
  }
}
