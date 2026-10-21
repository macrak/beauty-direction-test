import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { productsWithEconomics } from "@/lib/adminData";
import { pct, won } from "@/lib/format";

export default async function Profitability({ searchParams }: { searchParams: { sort?: string } }) {
  const { rows, settings } = await productsWithEconomics();
  const key = searchParams.sort ?? "contribution";
  const sorters: Record<string, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
    contribution: (a, b) => b.econ.contribution - a.econ.contribution,
    margin: (a, b) => (b.econ.marginOnCommission ?? -999) - (a.econ.marginOnCommission ?? -999),
    price: (a, b) => b.price - a.price,
    monthly: (a, b) => b.monthly.contribution - a.monthly.contribution,
  };
  const sorted = [...rows].sort(sorters[key] ?? sorters.contribution);
  const th = (k: string, label: string) => (
    <th className="text-right">
      <Link href={`?sort=${k}`} className={key === k ? "text-burgundy underline" : "hover:underline"}>
        {label}
      </Link>
    </th>
  );
  return (
    <>
      <PageTitle title="수익성 분석" desc={`상품별 수익 분해표. 시스템 기본 수수료율 ${settings.defaultCommissionRate}%. 모든 값은 economics.ts 단일 계산식으로 산출.`} />
      <div className="adm-card mb-4 text-xs leading-relaxed text-charcoal/65">
        <p>
          <strong>계산식</strong> · 기준금액 = 판매가(VAT 포함) 또는 판매가÷1.1(원 미만 버림) · 수수료 수익 = 기준금액 × 수수료율 · 공헌이익 = 수수료 수익 − 플랫폼 부담 결제비 − 배송비 − 프로모션 − 기타 변동비 ·
          공헌이익률 = 공헌이익 ÷ 플랫폼 수익 × 100 · <strong>직매입</strong> 플랫폼 수익 = 판매가÷1.1 − 매입가÷1.1 (매출총이익), 결제 수수료는 운영사가 전액 부담
        </p>
        <p className="mt-1">실제 매출·수익 회계처리는 거래 계약 구조와 세무 기준에 따라 별도로 판단합니다.</p>
      </div>
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[1250px]">
          <thead>
            <tr>
              <th>상품</th>
              {th("price", "판매가")}
              <th>기준</th>
              <th className="text-right">수수료율 / 매입가</th>
              <th className="text-right">플랫폼 수익</th>
              <th className="text-right">결제비(플랫폼)</th>
              <th className="text-right">배송·포장</th>
              <th className="text-right">프로모션</th>
              <th className="text-right">기타</th>
              {th("contribution", "공헌이익")}
              {th("margin", "이익률")}
              <th className="text-right">판매자 정산</th>
              {th("monthly", "월 공헌이익(예상)")}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className={r.eligibility === "INELIGIBLE" ? "opacity-50" : ""}>
                <td>
                  <Link href={`/admin/products/${r.id}`} className="hover:underline">
                    {r.name}
                  </Link>
                  <div className="text-xs text-charcoal/50">
                    {r.brewery.name} {r.tradeModel === "WHOLESALE" && <Pill tone="brand">직매입</Pill>}
                  </div>
                </td>
                <td className="text-right tabular-nums">{won(r.price)}</td>
                <td className="text-xs">{r.vatBasis === "INCLUSIVE" ? "VAT 포함" : "VAT 제외"}</td>
                <td className="text-right tabular-nums">
                  {r.econ.model === "WHOLESALE" ? <span className="text-xs text-charcoal/55">매입 {r.wholesaleCost ? won(r.wholesaleCost) : "미입력"}</span> : <>{r.econ.commissionRate}%{r.commissionRate === null && <span className="text-charcoal/40">*</span>}</>}
                </td>
                <td className="text-right tabular-nums">{won(r.econ.commission)}</td>
                <td className="text-right tabular-nums">{won(r.econ.platformPgCost)}</td>
                <td className="text-right tabular-nums">{won(r.platformShippingCost)}</td>
                <td className="text-right tabular-nums">{won(r.platformPromoCost)}</td>
                <td className="text-right tabular-nums">{won(r.otherVariableCost)}</td>
                <td className={`text-right font-semibold tabular-nums ${r.econ.contribution < 0 ? "text-[#9B1C1C]" : ""}`}>{won(r.econ.contribution)}</td>
                <td className="text-right tabular-nums">{pct(r.econ.marginOnCommission)}</td>
                <td className="text-right tabular-nums">{won(r.econ.sellerPayout)}</td>
                <td className="text-right tabular-nums">{won(r.monthly.contribution)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-charcoal/45">* 상품 수수료율 미지정 — 양조장 또는 시스템 기본값 적용</p>
    </>
  );
}
