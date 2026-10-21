import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { updateInquiry } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { INQUIRY_STATUS_LABEL, INQUIRY_TYPE_LABEL } from "@/lib/labels";

export default async function Inquiries({ searchParams }: { searchParams: { type?: string } }) {
  const type = searchParams.type && searchParams.type in INQUIRY_TYPE_LABEL ? (searchParams.type as keyof typeof INQUIRY_TYPE_LABEL) : undefined;
  const list = await prisma.inquiry.findMany({ where: type ? { type } : {}, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <PageTitle title="문의 관리" desc="입점 신청 · 기업 VIP 상담 · 고객 문의 · 정보 구독. 개인정보는 처리 목적 달성 후 보관 기간에 따라 파기하세요." />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/inquiries" className={`adm-btn-ghost py-1 ${!type ? "border-charcoal" : ""}`}>
          전체
        </Link>
        {Object.entries(INQUIRY_TYPE_LABEL).map(([k, v]) => (
          <Link key={k} href={`?type=${k}`} className={`adm-btn-ghost py-1 ${type === k ? "border-charcoal" : ""}`}>
            {v}
          </Link>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((q) => (
          <div key={q.id} className="adm-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Pill tone="brand">{INQUIRY_TYPE_LABEL[q.type]}</Pill>
                <strong>{q.company ? `${q.company} · ` : ""}{q.name}</strong>
                <span className="text-charcoal/50">
                  {q.email} {q.phone}
                </span>
              </div>
              <span className="text-xs text-charcoal/45">{q.createdAt.toLocaleString("ko-KR")}</span>
            </div>
            {q.message && <p className="mt-2 whitespace-pre-line text-sm">{q.message}</p>}
            {q.payload && Object.keys(q.payload as object).length > 0 && (
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs md:grid-cols-3">
                {Object.entries(q.payload as Record<string, string>).map(([k, v]) => (
                  <div key={k}>
                    <dt className="inline text-charcoal/45">{k}: </dt>
                    <dd className="inline whitespace-pre-line">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="mt-2 text-[11px] text-charcoal/45">
              개인정보 동의 {q.consentPrivacy ? "O" : "X"} · 광고 수신 동의 {q.consentMarketing ? "O" : "X"}
            </p>
            <form action={updateInquiry} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={q.id} />
              <select name="status" defaultValue={q.status} className="adm-input w-28 py-1">
                {Object.entries(INQUIRY_STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <input name="memo" defaultValue={q.memo ?? ""} placeholder="처리 메모" className="adm-input flex-1 py-1" />
              <button className="adm-btn-ghost py-1">저장</button>
            </form>
          </div>
        ))}
        {list.length === 0 && <p className="adm-card text-sm text-charcoal/50">접수된 문의가 없습니다.</p>}
      </div>
    </>
  );
}
