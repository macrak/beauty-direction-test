import Link from "next/link";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { won } from "@/lib/format";

// 정산 기준: 해당 월에 배송 완료된 판매자 주문. 중개형은 양조장 지급액, 매입형은 운영사 매출총이익.
export default async function Settlements({ searchParams }: { searchParams: { m?: string } }) {
  const now = new Date();
  const m = /^\d{4}-\d{2}$/.test(searchParams.m ?? "") ? searchParams.m! : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [y, mo] = m.split("-").map(Number);
  const start = new Date(Date.UTC(y, mo - 1, 1) - 9 * 3600 * 1000);
  const end = new Date(Date.UTC(y, mo, 1) - 9 * 3600 * 1000);
  const prev = new Date(y, mo - 2, 1);
  const next = new Date(y, mo, 1);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const [rows, settings, refunds] = await Promise.all([
    prisma.sellerOrder.findMany({ where: { status: "DELIVERED", deliveredAt: { gte: start, lt: end } }, include: { brewery: true, order: true } }),
    getSettings(),
    prisma.order.findMany({ where: { status: { in: ["CANCELLED", "REFUNDED"] }, cancelledAt: { gte: start, lt: end } } }),
  ]);
  const breweries = new Map<string, { name: string; count: number; gross: number; commission: number; damage: number }>();
  const op = { count: 0, sales: 0, cost: 0, shipping: 0, damage: 0 };
  for (const r of rows) {
    if (r.sellerType === "OPERATOR") {
      op.count++;
      op.sales += r.subtotal;
      op.cost += r.costTotal;
      op.shipping += r.shippingFee;
      if (r.damageReported) op.damage++;
    } else {
      const k = r.breweryId!;
      const b = breweries.get(k) ?? { name: r.brewery?.name ?? k, count: 0, gross: 0, commission: 0, damage: 0 };
      b.count++;
      b.gross += r.subtotal + r.shippingFee;
      b.commission += r.commission;
      if (r.damageReported) b.damage++;
      breweries.set(k, b);
    }
  }
  const bList = [...breweries.values()].sort((a, b) => b.gross - a.gross);
  const totalCommission = bList.reduce((a, b) => a + b.commission, 0);
  const opMargin = op.sales - op.cost;
  return (
    <>
      <PageTitle
        title="정산"
        desc="배송 완료 기준 월별 정산 리포트입니다. 실제 지급·세금계산서 발행은 계약 조건과 세무 기준에 따라 처리하세요."
        action={
          <div className="flex items-center gap-2">
            <Link href={`?m=${fmt(prev)}`} className="adm-btn-ghost px-3">
              ←
            </Link>
            <span className="min-w-[90px] text-center text-sm font-semibold tabular-nums">{m}</span>
            <Link href={`?m=${fmt(next)}`} className="adm-btn-ghost px-3">
              →
            </Link>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["중개 수수료 수익", won(totalCommission)],
          ["직매입 매출총이익", won(opMargin)],
          ["양조장 지급 예정액", won(bList.reduce((a, b) => a + b.gross - b.commission, 0))],
          ["취소·환불", `${refunds.length}건 · ${won(refunds.reduce((a, o) => a + o.totalAmount, 0))}`],
        ].map(([l, v]) => (
          <div key={l} className="adm-card">
            <p className="text-xs text-charcoal/55">{l}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <section className="adm-card mt-4 overflow-x-auto p-0">
        <h2 className="border-b border-line p-4 text-sm font-semibold">양조장별 정산 (중개형)</h2>
        <table className="adm-table min-w-[720px]">
          <thead>
            <tr>
              <th>양조장</th>
              <th className="text-right">배송 완료</th>
              <th className="text-right">거래액(배송비 포함)</th>
              <th className="text-right">플랫폼 수수료</th>
              <th className="text-right">지급 예정액</th>
              <th>파손</th>
            </tr>
          </thead>
          <tbody>
            {bList.map((b) => (
              <tr key={b.name}>
                <td>{b.name}</td>
                <td className="text-right tabular-nums">{b.count}건</td>
                <td className="text-right tabular-nums">{won(b.gross)}</td>
                <td className="text-right tabular-nums">{won(b.commission)}</td>
                <td className="text-right font-semibold tabular-nums">{won(b.gross - b.commission)}</td>
                <td>{b.damage ? <Pill tone="bad">{b.damage}건</Pill> : "-"}</td>
              </tr>
            ))}
            {bList.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-charcoal/50">
                  이 기간에 배송 완료된 중개 주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="adm-card mt-4">
        <h2 className="text-sm font-semibold">직매입 손익 ({settings.brandName})</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
          {[
            ["배송 완료", `${op.count}건`],
            ["상품 매출", won(op.sales)],
            ["매입 원가", won(op.cost)],
            ["매출총이익", won(opMargin)],
            ["배송비 수입", won(op.shipping)],
          ].map(([l, v]) => (
            <div key={l}>
              <dt className="text-xs text-charcoal/50">{l}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-charcoal/50">금액은 VAT 포함 기준입니다. 결제 수수료·포장비 등 변동비는 수익성 분석의 상품별 설정값을 참고하세요.</p>
      </section>
    </>
  );
}
