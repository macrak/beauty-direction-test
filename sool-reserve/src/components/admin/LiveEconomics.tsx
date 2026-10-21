"use client";
import { useEffect, useRef, useState } from "react";
import { calcEconomics, resolveCommissionRate } from "@/lib/economics";
import { pct, won } from "@/lib/format";

// 폼 입력값으로 수익 계산을 실시간 미리보기 (서버와 동일한 calcEconomics 사용)
export default function LiveEconomics({
  systemRate,
  breweryRates,
  initial = {},
}: {
  systemRate: number;
  breweryRates: Record<string, number | null>;
  initial?: Record<string, string>; // 서버 렌더링 시 첫 화면 값 (폼 기본값과 동일)
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vals, setVals] = useState<Record<string, string>>(initial);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const read = () => {
      const fd = new FormData(form);
      const o: Record<string, string> = {};
      fd.forEach((v, k) => typeof v === "string" && (o[k] = v));
      setVals(o);
    };
    read();
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
    };
  }, []);

  const n = (k: string) => Number(vals[k] || 0) || 0;
  const productRate = vals.commissionRate ? Number(vals.commissionRate) : null;
  const rate = resolveCommissionRate(productRate, breweryRates[vals.breweryId ?? ""] ?? null, systemRate);
  const r = calcEconomics({
    price: n("price"),
    vatBasis: vals.vatBasis === "EXCLUSIVE" ? "EXCLUSIVE" : "INCLUSIVE",
    commissionRate: rate,
    pgRate: n("pgRate"),
    pgBearer: vals.pgBearer === "SELLER" ? "SELLER" : "PLATFORM",
    platformShippingCost: n("platformShippingCost"),
    platformPromoCost: n("platformPromoCost"),
    otherVariableCost: n("otherVariableCost"),
  });
  const rows: [string, string, boolean?][] = [
    ["적용 수수료율", `${rate}%${productRate === null ? " (기본값)" : ""}`],
    ["수수료 기준금액", won(r.basisAmount)],
    ["플랫폼 수수료 수익", won(r.commission)],
    ["플랫폼 부담 결제비", won(r.platformPgCost)],
    ["예상 플랫폼 공헌이익", won(r.contribution), true],
    ["수수료 대비 공헌이익률", pct(r.marginOnCommission)],
    ["거래액 대비 공헌이익률", pct(r.marginOnGmv)],
    ["판매자 정산 예상액", won(r.sellerPayout)],
    ["예상 월 공헌이익", won(r.contribution * n("expectedMonthlyUnits"))],
  ];
  return (
    <div ref={ref} className="rounded border border-burgundy/20 bg-burgundy/[0.03] p-4 md:col-span-4">
      <p className="text-xs font-semibold text-burgundy">수익 계산 미리보기 (1병 기준)</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
        {rows.map(([k, v, strong]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-line/70 py-1">
            <dt className="text-charcoal/55">{k}</dt>
            <dd className={`tabular-nums ${strong ? `font-semibold ${r.contribution < 0 ? "text-[#9B1C1C]" : ""}` : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
