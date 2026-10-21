import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { productsWithEconomics } from "@/lib/adminData";
import { addToSlot } from "@/lib/admin-actions";
import { ELIGIBILITY_LABEL, SLOT_LABEL } from "@/lib/labels";
import { won } from "@/lib/format";

type SP = Record<string, string | undefined>;

export default async function Selection({ searchParams: sp }: { searchParams: SP }) {
  const { rows, settings } = await productsWithEconomics();
  const n = (k: string, d?: number) => (sp[k] !== undefined && sp[k] !== "" && Number.isFinite(Number(sp[k])) ? Number(sp[k]) : d);
  const applied = Object.keys(sp).length > 0;
  const f = {
    minPrice: n("minPrice", applied ? undefined : settings.minListingPrice),
    minContribution: n("minContribution", applied ? undefined : 20000),
    maxContribution: n("maxContribution"),
    minGift: n("minGift", applied ? undefined : 4),
    minCuration: n("minCuration"),
    verifiedBrewery: applied ? sp.verifiedBrewery === "on" : true,
    inStock: applied ? sp.inStock === "on" : true,
    eligible: applied ? sp.eligible === "on" : false,
  };
  const result = rows.filter(
    (r) =>
      (f.minPrice === undefined || r.price >= f.minPrice) &&
      (f.minContribution === undefined || r.econ.contribution >= f.minContribution) &&
      (f.maxContribution === undefined || r.econ.contribution <= f.maxContribution) &&
      (f.minGift === undefined || (r.scoreGift !== null && r.scoreGift >= f.minGift)) &&
      (f.minCuration === undefined || (r.curation !== null && r.curation >= f.minCuration)) &&
      (!f.verifiedBrewery || r.brewery.onboardingStatus === "LISTED" || r.brewery.onboardingStatus === "APPROVED") &&
      (!f.inStock || r.stock > 0) &&
      (!f.eligible || r.eligibility === "VERIFIED"),
  );
  const unscored = rows.filter((r) => r.curation === null);

  return (
    <>
      <PageTitle title="상품 선별" desc="평가 점수와 수익 기준을 조합해 조건을 만족하는 상품만 추출합니다. 결과에서 바로 추천 슬롯에 추가할 수 있습니다." />
      <form className="adm-card grid gap-4 md:grid-cols-4">
        <Num label="판매가 ≥ (원)" name="minPrice" v={f.minPrice} step={10000} />
        <Num label="개당 공헌이익 ≥ (원)" name="minContribution" v={f.minContribution} step={1000} />
        <Num label="선물 적합성 ≥ (1~5)" name="minGift" v={f.minGift} step={1} />
        <Num label="종합 선별 점수 ≥ (1~5)" name="minCuration" v={f.minCuration} step={0.1} />
        <div className="flex flex-wrap items-center gap-5 text-sm md:col-span-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="verifiedBrewery" defaultChecked={f.verifiedBrewery} className="accent-burgundy" /> 검증된 입점 업체(승인·노출)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="inStock" defaultChecked={f.inStock} className="accent-burgundy" /> 판매 가능 재고 확보
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="eligible" defaultChecked={f.eligible} className="accent-burgundy" /> 통신판매 적격(VERIFIED)
          </label>
        </div>
        <div className="flex gap-2">
          <button className="adm-btn">조건 적용</button>
          <Link href="/admin/selection" className="adm-btn-ghost">
            기본값
          </Link>
        </div>
        <p className="text-[11px] text-charcoal/45 md:col-span-4">
          종합 선별 점수 = 10개 기준의 가중 평균(가중치는 시스템 설정). 평가 항목이 5개 미만이면 '미평가'로 분류되며 점수 조건에서 제외됩니다.
        </p>
      </form>

      <form action={addToSlot} className="mt-4">
        <div className="adm-card overflow-x-auto p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <p className="text-sm">
              <strong>{result.length}</strong>개 상품이 조건을 만족합니다 (전체 {rows.length}개)
            </p>
            <div className="flex items-center gap-2">
              <select name="slot" className="adm-input w-48 py-1.5">
                {Object.entries(SLOT_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button className="adm-btn py-1.5">선택 상품 슬롯에 추가</button>
            </div>
          </div>
          <table className="adm-table min-w-[1000px]">
            <thead>
              <tr>
                <th></th>
                <th>상품</th>
                <th className="text-right">판매가</th>
                <th className="text-right">플랫폼 수익</th>
                <th className="text-right">개당 공헌이익</th>
                <th className="text-right">선물 적합성</th>
                <th className="text-right">종합 점수</th>
                <th>적격</th>
                <th className="text-right">재고</th>
              </tr>
            </thead>
            <tbody>
              {result
                .sort((a, b) => b.econ.contribution - a.econ.contribution)
                .map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input type="checkbox" name="productId" value={r.id} className="accent-burgundy" aria-label={`${r.name} 선택`} />
                    </td>
                    <td>
                      <Link href={`/admin/products/${r.id}`} className="hover:underline">
                        {r.name}
                      </Link>
                      <div className="text-xs text-charcoal/50">{r.brewery.name}</div>
                    </td>
                    <td className="text-right tabular-nums">{won(r.price)}</td>
                    <td className="text-right tabular-nums">{won(r.econ.commission)}</td>
                    <td className={`text-right font-medium tabular-nums ${r.econ.contribution < 0 ? "text-[#9B1C1C]" : ""}`}>{won(r.econ.contribution)}</td>
                    <td className="text-right tabular-nums">{r.scoreGift ?? <span className="text-charcoal/40">미평가</span>}</td>
                    <td className="text-right tabular-nums">{r.curation ?? <span className="text-charcoal/40">미평가</span>}</td>
                    <td>
                      <Pill tone={r.eligibility === "VERIFIED" ? "good" : r.eligibility === "INELIGIBLE" ? "bad" : "warn"}>{ELIGIBILITY_LABEL[r.eligibility]}</Pill>
                    </td>
                    <td className="text-right tabular-nums">{r.stock}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </form>
      {unscored.length > 0 && (
        <div className="adm-card mt-4">
          <h2 className="text-sm font-semibold">미평가 상품 ({unscored.length})</h2>
          <p className="mt-1 text-xs text-charcoal/50">근거 자료를 확인해 상품 수정 화면에서 평가 점수를 입력하세요.</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {unscored.map((r) => (
              <Link key={r.id} href={`/admin/products/${r.id}`} className="underline">
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Num({ label, name, v, step }: { label: string; name: string; v?: number; step: number }) {
  return (
    <label className="block">
      <span className="adm-label">{label}</span>
      <input name={name} type="number" step={step} defaultValue={v} className="adm-input" />
    </label>
  );
}
