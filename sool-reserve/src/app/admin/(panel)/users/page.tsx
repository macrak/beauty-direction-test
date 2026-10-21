import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { F, Sel, Section } from "@/components/admin/Field";
import { createUser, resetPassword, toggleUser } from "@/lib/admin-actions";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/labels";

export default async function Users() {
  const me = await requireStaff();
  const isSuper = me.role === "SUPER_ADMIN";
  const [users, breweries] = await Promise.all([
    isSuper ? prisma.user.findMany({ include: { brewery: true }, orderBy: { createdAt: "asc" } }) : [],
    prisma.brewery.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <PageTitle title="계정 · 권한" desc="최고관리자 · 큐레이터(상품/콘텐츠) · 재무(수익/수수료) · 양조장 관리자(자사 데이터만)" />
      {isSuper && (
        <>
          <div className="adm-card overflow-x-auto p-0">
            <table className="adm-table min-w-[720px]">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>소속</th>
                  <th>최근 로그인</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <Pill tone="brand">{ROLE_LABEL[u.role]}</Pill>
                    </td>
                    <td className="text-xs">{u.brewery?.name ?? "-"}</td>
                    <td className="text-xs">{u.lastLoginAt?.toLocaleString("ko-KR") ?? "-"}</td>
                    <td>
                      {u.id !== me.id && (
                        <form action={toggleUser}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="text-xs underline">{u.active ? "비활성화" : "활성화"}</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <ActionForm action={createUser} submitLabel="계정 생성">
              <Section title="새 계정">
                <F label="이름" name="name" required />
                <F label="이메일" name="email" type="email" required />
                <F label="초기 비밀번호 (10자 이상)" name="password" type="password" required />
                <Sel label="역할" name="role" options={Object.entries(ROLE_LABEL)} defaultValue="CURATOR" />
                <Sel label="소속 양조장 (양조장 관리자만)" name="breweryId" options={breweries.map((b) => [b.id, b.name])} empty="-" span={2} />
              </Section>
            </ActionForm>
          </div>
        </>
      )}
      <div className="mt-4">
        <ActionForm action={resetPassword} submitLabel="비밀번호 변경">
          <Section title="내 비밀번호 변경">
            <F label="새 비밀번호 (10자 이상)" name="password" type="password" required />
          </Section>
        </ActionForm>
      </div>
    </>
  );
}
