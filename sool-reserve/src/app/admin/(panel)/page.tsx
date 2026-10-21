import Link from "next/link";
import BarList from "@/components/admin/BarList";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { productsWithEconomics } from "@/lib/adminData";
import { prisma } from "@/lib/db";
import { pct, won } from "@/lib/format";
import { LIQUOR_TYPE_LABEL } from "@/lib/labels";

export default async function Dashboard({ searchParams }: { searchParams: { denied?: string } }) {
  const { rows, settings } = await productsWithEconomics();
  const active = rows.filter((r) => r.status === "PUBLISHED" && r.eligibility !== "INELIGIBLE");
  const sum = (f: (r: (typeof rows)[number]) => number) => active.reduce((a, r) => a + f(r), 0);
  const gmv = sum((r) => r.monthly.gmv);
  const commission = sum((r) => r.monthly.commission);
  const contribution = sum((r) => r.monthly.contribution);

  const [newInquiries, onboarding, orders] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.brewery.count({ where: { onboardingStatus: { notIn: ["LISTED", "REJECTED"] } } }),
    prisma.sellerOrder.groupBy({ by: ["status"], _count: true }),
  ]);

  const byBrewery = new Map<string, number>();
  const byType = new Map<string, number>();
  for (const r of active) {
    byBrewery.set(r.brewery.name, (byBrewery.get(r.brewery.name) ?? 0) + r.monthly.contribution);
    byType.set(LIQUOR_TYPE_LABEL[r.liquorType], (byType.get(LIQUOR_TYPE_LABEL[r.liquorType]) ?? 0) + r.monthly.gmv);
  }
  // 가격 구간: [t_i, t_{i+1}) 범위, 마지막은 'N만 원 이상', 첫 구간 미만은 별도
  const tiers = [...settings.priceTiers].sort((a, b) => a - b);
  const man = (v: number) => `${v / 10000}만`;
  const tierLabels = [`${man(tiers[0])} 원 미만`, ...tiers.map((t, i) => (i < tiers.length - 1 ? `${man(t)}~${man(tiers[i + 1])} 원` : `${man(t)} 원 이상`))];
  const tierLabel = (price: number) => tierLabels[tiers.filter((t) => price >= t).length];
  const byTier = new Map<string, number>();
  for (const r of active) byTier.set(tierLabel(r.price), (byTier.get(tierLabel(r.price)) ?? 0) + r.monthly.gmv);

  const toList = (m: Map<string, number>) => Array.from(m, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const topProducts = [...active].sort((a, b) => b.monthly.contribution - a.monthly.contribution).slice(0, 8);
  const popular = [...active].sort((a, b) => b.expectedMonthlyUnits - a.expectedMonthlyUnits).slice(0, 5);

  const alerts = [
    { n: rows.filter((r) => r.eligibility === "UNCHECKED" || r.eligibility === "IN_REVIEW").length, label: "통신판매 적격 미확인 상품", href: "/admin/products?eligibility=pending" },
    { n: rows.filter((r) => r.econ.contribution < 0 && r.eligibility !== "INELIGIBLE").length, label: "공헌이익 적자 상품", href: "/admin/selection?minContribution=-100000000&maxContribution=-1" },
    { n: rows.filter((r) => r.tasteSource === "NONE").length, label: "맛 프로필 미등록 상품", href: "/admin/products?taste=none" },
    { n: rows.filter((r) => r.curation === null).length, label: "선별 점수 미평가 상품", href: "/admin/selection" },
    { n: rows.filter((r) => r.stock === 0 && r.status === "PUBLISHED").length, label: "재고 0 공개 상품", href: "/admin/products?stock=0" },
    { n: onboarding, label: "입점 심사 진행 중 양조장", href: "/admin/breweries" },
    { n: newInquiries, label: "신규 문의", href: "/admin/inquiries" },
  ];

  return (
    <>
      {searchParams.denied && <p className="mb-4 rounded border border-burgundy/30 bg-burgundy/5 p-3 text-sm text-burgundy">해당 메뉴에 대한 권한이 없습니다.</p>}
      <PageTitle
        title="수익 대시보드"
        desc="판매 기능 비활성 상태이므로 실거래 대신 '상품별 예상 월 판매량(관리자 입력)' 기준 추정치입니다. 소개 전용·비공개 상품 제외."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="예상 월 거래액" value={won(gmv)} />
        <Kpi label="예상 월 플랫폼 수수료 수익" value={won(commission)} />
        <Kpi label="예상 월 플랫폼 공헌이익" value={won(contribution)} tone={contribution < 0 ? "bad" : undefined} />
        <Kpi label="수수료 대비 공헌이익률" value={pct(commission ? (contribution / commission) * 100 : null)} sub={`거래액 대비 ${pct(gmv ? (contribution / gmv) * 100 : null)}`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="adm-card lg:col-span-2">
          <h2 className="text-sm font-semibold">상품별 수익 순위 (예상 월 공헌이익)</h2>
          <table className="adm-table mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>상품</th>
                <th className="text-right">판매가</th>
                <th className="text-right">개당 공헌이익</th>
                <th className="text-right">월 판매량</th>
                <th className="text-right">월 공헌이익</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-charcoal/50">{i + 1}</td>
                  <td>
                    <Link href={`/admin/products/${r.id}`} className="hover:underline">
                      {r.name}
                    </Link>
                    <span className="ml-1.5 text-xs text-charcoal/45">{r.brewery.name}</span>
                  </td>
                  <td className="text-right tabular-nums">{won(r.price)}</td>
                  <td className="text-right tabular-nums">{won(r.econ.contribution)}</td>
                  <td className="text-right tabular-nums">{r.expectedMonthlyUnits}</td>
                  <td className="text-right font-medium tabular-nums">{won(r.monthly.contribution)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-card">
          <h2 className="text-sm font-semibold">확인 필요</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {alerts.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="flex items-center justify-between py-2.5 hover:text-burgundy">
                  <span>{a.label}</span>
                  <Pill tone={a.n ? "warn" : "good"}>{a.n}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="adm-card">
          <h2 className="text-sm font-semibold">양조장별 예상 월 공헌이익</h2>
          <BarList data={toList(byBrewery)} />
        </div>
        <div className="adm-card">
          <h2 className="text-sm font-semibold">주종별 예상 월 거래액</h2>
          <BarList data={toList(byType)} />
          <h2 className="mt-6 text-sm font-semibold">가격대별 예상 월 거래액</h2>
          <BarList data={tierLabels.map((label) => ({ label, value: byTier.get(label) ?? 0 })).filter((x, i) => i > 0 || x.value > 0)} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="adm-card">
          <h2 className="text-sm font-semibold">인기 상품 (예상 판매량 기준)</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {popular.map((r, i) => (
              <li key={r.id} className="flex justify-between">
                <span>
                  {i + 1}. {r.name}
                </span>
                <span className="tabular-nums text-charcoal/60">월 {r.expectedMonthlyUnits}병</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="adm-card">
          <h2 className="text-sm font-semibold">취소 · 반품 · 파손 비용</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal/55">주문 데이터 없음 — 판매 기능(LIVE) 활성화 후 판매자별 주문 기준으로 집계됩니다.</p>
          ) : (
            <ul className="mt-3 text-sm">
              {orders.map((o) => (
                <li key={o.status}>
                  {o.status}: {o._count}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "bad" }) {
  return (
    <div className="adm-card">
      <p className="text-xs text-charcoal/55">{label}</p>
      <p className={`mt-2 text-xl font-semibold tabular-nums md:text-2xl ${tone === "bad" ? "text-[#9B1C1C]" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-charcoal/50">{sub}</p>}
    </div>
  );
}
