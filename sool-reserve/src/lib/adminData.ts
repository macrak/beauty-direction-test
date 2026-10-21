import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { productEconomics } from "./economics";
import { curationScore } from "./curation";
import { getSettings } from "./settings";

// 관리자용 상품 + 수익 계산 결과 (계산은 economics.ts 단일 함수)
export async function productsWithEconomics(where: Prisma.ProductWhereInput = {}) {
  const settings = await getSettings();
  const rows = await prisma.product.findMany({
    where,
    include: { brewery: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return {
    settings,
    rows: rows.map((p) => {
      const econ = productEconomics(p, settings.defaultCommissionRate);
      return {
        ...p,
        econ,
        curation: curationScore(p, settings.curationWeights),
        monthly: {
          gmv: p.price * p.expectedMonthlyUnits,
          commission: econ.commission * p.expectedMonthlyUnits,
          contribution: econ.contribution * p.expectedMonthlyUnits,
        },
      };
    }),
  };
}

export type ProductRow = Awaited<ReturnType<typeof productsWithEconomics>>["rows"][number];
