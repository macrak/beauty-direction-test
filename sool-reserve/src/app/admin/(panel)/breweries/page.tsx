import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { ONBOARDING_FLOW, ONBOARDING_LABEL } from "@/lib/labels";

export default async function BreweriesAdmin() {
  const list = await prisma.brewery.findMany({
    include: { compliance: true, _count: { select: { products: true } } },
    orderBy: [{ onboardingStatus: "asc" }, { name: "asc" }],
  });
  return (
    <>
      <PageTitle
        title="양조장 입점 관리"
        desc="입점 단계·서류 검토·판매 활성 상태를 관리합니다. 입점 문의는 '문의 관리'에서 확인 후 여기서 등록하세요."
        action={
          <Link href="/admin/breweries/new" className="adm-btn">
            + 양조장 등록
          </Link>
        }
      />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[900px]">
          <thead>
            <tr>
              <th>양조장</th>
              <th>입점 단계</th>
              <th>서류</th>
              <th>판매 활성</th>
              <th className="text-right">기본 수수료</th>
              <th className="text-right">상품</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => {
              const idx = ONBOARDING_FLOW.indexOf(b.onboardingStatus as (typeof ONBOARDING_FLOW)[number]);
              return (
                <tr key={b.id}>
                  <td>
                    <Link href={`/admin/breweries/${b.id}`} className="font-medium hover:underline">
                      {b.name}
                    </Link>
                    <div className="text-xs text-charcoal/50">
                      {b.region} {b.isDemo && <Pill>DEMO</Pill>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5" aria-hidden>
                        {ONBOARDING_FLOW.map((s, i) => (
                          <span key={s} className={`h-1.5 w-4 rounded-sm ${b.onboardingStatus === "REJECTED" ? "bg-[#E8B4B4]" : i <= idx ? "bg-burgundy" : "bg-line"}`} />
                        ))}
                      </div>
                      <span className="text-xs">{ONBOARDING_LABEL[b.onboardingStatus]}</span>
                    </div>
                  </td>
                  <td>
                    <Pill tone={b.compliance?.status === "APPROVED" ? "good" : b.compliance?.status === "REJECTED" ? "bad" : "warn"}>
                      {b.compliance?.status === "APPROVED" ? "승인" : b.compliance?.status === "REJECTED" ? "반려" : "검토 대기"}
                    </Pill>
                  </td>
                  <td>{b.salesEnabled ? <Pill tone="good">활성</Pill> : <Pill>비활성</Pill>}</td>
                  <td className="text-right tabular-nums">{b.defaultCommissionRate !== null ? `${b.defaultCommissionRate}%` : "기본값"}</td>
                  <td className="text-right tabular-nums">{b._count.products}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
