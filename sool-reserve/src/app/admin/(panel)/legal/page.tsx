import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { F, Sel, Section, TA } from "@/components/admin/Field";
import { addNotice, deleteNotice } from "@/lib/admin-actions";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NOTICE_TYPE_LABEL } from "@/lib/labels";
import { dateKo } from "@/lib/format";

export default async function Legal() {
  const user = await requireStaff();
  const now = new Date();
  const all = await prisma.legalNotice.findMany({ orderBy: [{ type: "asc" }, { effectiveFrom: "desc" }] });
  const currentIds = new Set(
    Object.keys(NOTICE_TYPE_LABEL).map((t) => all.find((n) => n.type === t && n.effectiveFrom <= now)?.id).filter(Boolean) as string[],
  );
  return (
    <>
      <PageTitle
        title="법적 고지 · 경고문구"
        desc="고지는 버전으로 관리되며 시행일 0시(KST)에 자동 전환됩니다. 시행된 버전은 이력 보존을 위해 삭제할 수 없습니다. 문구는 시행 중인 법령·고시 원문으로 확인 후 등록하세요."
      />
      <div className="space-y-4">
        {(Object.keys(NOTICE_TYPE_LABEL) as (keyof typeof NOTICE_TYPE_LABEL)[]).map((t) => (
          <section key={t} className="adm-card">
            <h2 className="text-sm font-semibold">{NOTICE_TYPE_LABEL[t]}</h2>
            <ul className="mt-2 divide-y divide-line">
              {all
                .filter((n) => n.type === t)
                .map((n) => (
                  <li key={n.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>v{n.version}</strong>
                      <span className="text-charcoal/55">시행 {dateKo(n.effectiveFrom)}</span>
                      {currentIds.has(n.id) ? <Pill tone="good">현재 적용</Pill> : n.effectiveFrom > now ? <Pill tone="warn">시행 예정</Pill> : <Pill>이전 버전</Pill>}
                      {n.effectiveFrom > now && user.role === "SUPER_ADMIN" && (
                        <form action={deleteNotice}>
                          <input type="hidden" name="id" value={n.id} />
                          <button className="text-xs text-[#9B1C1C] underline">삭제</button>
                        </form>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-charcoal/75">{n.body}</p>
                    {n.sourceNote && <p className="mt-1 text-xs text-[#8A5A00]">근거/메모: {n.sourceNote}</p>}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      {user.role === "SUPER_ADMIN" && (
        <div className="mt-6">
          <ActionForm action={addNotice} submitLabel="새 버전 등록">
            <Section title="새 버전 등록" desc="예: 2026-11-09 시행 음주운전 위험 문구 — 고시 원문 확인 후 시행일을 지정해 미리 등록">
              <Sel label="종류" name="type" options={Object.entries(NOTICE_TYPE_LABEL)} />
              <F label="제목" name="title" required />
              <F label="버전" name="version" required placeholder="예: 2026.11" />
              <F label="시행일" name="effectiveFrom" type="date" required />
              <TA label="본문" name="body" span={4} rows={5} />
              <F label="근거 법령·고시 / 메모" name="sourceNote" span={4} />
            </Section>
          </ActionForm>
        </div>
      )}
    </>
  );
}
