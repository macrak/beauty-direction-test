import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { AD_CHECKS, ARTICLE_CATEGORY, missingAdChecks } from "@/lib/magazine";
import { dateKo } from "@/lib/format";

export default async function MagazineAdmin() {
  const list = await prisma.article.findMany({ orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], include: { _count: { select: { products: true } } } });
  const now = new Date();
  return (
    <>
      <PageTitle
        title="매거진 · 콘텐츠"
        desc="명주 이야기·장인 인터뷰·선물 가이드·페어링·보관 가이드·양조장 탐방. 게시 전 주류 광고 기준 점검 필수."
        action={
          <Link href="/admin/magazine/new" className="adm-btn">
            + 새 글
          </Link>
        }
      />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[820px]">
          <thead>
            <tr>
              <th>제목</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>게시일</th>
              <th>광고 기준 점검</th>
              <th className="text-right">연결 상품</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const missing = missingAdChecks(a).length;
              return (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/magazine/${a.id}`} className="font-medium hover:underline">
                      {a.title}
                    </Link>{" "}
                    {a.isDemo && <Pill>DEMO</Pill>}
                  </td>
                  <td className="text-xs">{ARTICLE_CATEGORY[a.category].label}</td>
                  <td>
                    {a.status === "PUBLISHED" ? (
                      a.publishedAt && a.publishedAt > now ? <Pill tone="warn">예약</Pill> : <Pill tone="good">게시</Pill>
                    ) : (
                      <Pill>{a.status === "DRAFT" ? "작성 중" : "숨김"}</Pill>
                    )}
                  </td>
                  <td className="text-xs">{a.publishedAt ? dateKo(a.publishedAt) : "-"}</td>
                  <td>{missing ? <Pill tone="warn">{AD_CHECKS.length - missing}/{AD_CHECKS.length}</Pill> : <Pill tone="good">완료</Pill>}</td>
                  <td className="text-right tabular-nums">{a._count.products}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center text-sm text-charcoal/50">작성된 글이 없습니다.</p>}
      </div>
    </>
  );
}
