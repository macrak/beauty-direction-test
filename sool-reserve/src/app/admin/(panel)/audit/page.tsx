import { PageTitle } from "@/components/admin/AdminShell";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Audit() {
  await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <>
      <PageTitle title="변경 이력" desc="가격·수수료·적격성·운영 모드 등 주요 변경을 기록합니다 (최근 300건)." />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[900px]">
          <thead>
            <tr>
              <th>시각</th>
              <th>사용자</th>
              <th>작업</th>
              <th>대상</th>
              <th>변경 내용</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap text-xs">{l.createdAt.toLocaleString("ko-KR")}</td>
                <td className="text-xs">{l.userEmail}</td>
                <td className="text-xs">{l.action}</td>
                <td className="text-xs">
                  {l.entity} <span className="text-charcoal/40">{l.entityId?.slice(0, 10)}</span>
                </td>
                <td className="max-w-[480px] truncate text-xs text-charcoal/70" title={JSON.stringify(l.changes)}>
                  {l.changes ? JSON.stringify(l.changes) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
