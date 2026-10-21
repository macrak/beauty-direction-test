import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";

export default async function Suppliers() {
  const list = await prisma.supplier.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true, purchaseOrders: true } } } });
  return (
    <>
      <PageTitle
        title="공급처 (도매상)"
        desc="직매입 상품을 공급받는 도매상을 관리합니다. 면허 확인이 끝난 공급처만 거래하세요."
        action={
          <Link href="/admin/suppliers/new" className="adm-btn">
            + 공급처 등록
          </Link>
        }
      />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[760px]">
          <thead>
            <tr>
              <th>공급처</th>
              <th>담당자</th>
              <th>면허</th>
              <th>결제 조건</th>
              <th className="text-right">공급 상품</th>
              <th className="text-right">발주</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/admin/suppliers/${s.id}`} className="font-medium hover:underline">
                    {s.name}
                  </Link>{" "}
                  {s.isDemo && <Pill>DEMO</Pill>} {!s.active && <Pill tone="bad">거래 중지</Pill>}
                </td>
                <td className="text-xs">
                  {s.contactName} {s.phone}
                </td>
                <td>{s.licenseVerified ? <Pill tone="good">{s.licenseType || "확인"}</Pill> : <Pill tone="warn">미확인</Pill>}</td>
                <td className="text-xs">{s.paymentTerms ?? "-"}</td>
                <td className="text-right tabular-nums">{s._count.products}</td>
                <td className="text-right tabular-nums">{s._count.purchaseOrders}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-charcoal/50">등록된 공급처가 없습니다.</p>}
      </div>
    </>
  );
}
