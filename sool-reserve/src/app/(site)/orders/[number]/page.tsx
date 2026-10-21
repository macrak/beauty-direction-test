import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { commerceSession, ORDER_STATUS_LABEL } from "@/lib/orders";
import { won } from "@/lib/format";

export const metadata: Metadata = { title: "주문 완료", robots: { index: false } };

export default async function OrderDone({ params }: { params: { number: string } }) {
  const s = await commerceSession();
  if (!s.allowed) notFound();
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.number },
    include: { sellerOrders: { include: { items: true, brewery: true } }, payments: true },
  });
  if (!order || (s.user && !s.isStaff && order.customerRef !== `staff:${s.user.id}`)) notFound();
  return (
    <div className="container-site max-w-3xl pb-10 pt-16 md:pt-24">
      <div className="text-center">
        <p className="eyebrow">Thank You</p>
        <h1 className="h-display mt-4">주문이 접수되었습니다.</h1>
        <p className="mt-5 text-sm text-charcoal/60">
          주문번호 <span className="font-serif text-base text-charcoal">{order.orderNumber}</span>
          {order.isTest && <span className="ml-2 border border-burgundy/40 px-1.5 py-0.5 text-[10px] text-burgundy">테스트 주문</span>}
        </p>
      </div>
      <div className="mt-14 space-y-8">
        {order.sellerOrders.map((so) => (
          <section key={so.id} className="border-t border-charcoal pt-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm">
                <span className="text-charcoal/50">판매자</span> <span className="ml-1 font-medium">{so.sellerType === "OPERATOR" ? `${s.settings.brandName} 직매입` : so.brewery?.name}</span>
              </h2>
              <span className="text-xs text-burgundy">{ORDER_STATUS_LABEL[so.status]}</span>
            </div>
            <ul className="mt-3 divide-y divide-line text-sm">
              {so.items.map((i) => (
                <li key={i.id} className="flex justify-between py-3">
                  <span>
                    {i.productName} <span className="text-charcoal/45">× {i.quantity}</span>
                  </span>
                  <span className="tabular-nums">{won(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between py-3 text-xs text-charcoal/55">
                <span>배송비</span>
                <span className="tabular-nums">{so.shippingFee ? won(so.shippingFee) : "무료"}</span>
              </li>
            </ul>
          </section>
        ))}
      </div>
      <dl className="mt-8 grid gap-3 border-y border-line py-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-charcoal/50">받는 분</dt>
          <dd className="mt-1">
            {order.recipientName} · {order.recipientPhone}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal/50">주소</dt>
          <dd className="mt-1">
            {order.address} {order.addressDetail}
          </dd>
        </div>
        {order.giftWrap && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-charcoal/50">선물 포장 · 메시지 카드</dt>
            <dd className="mt-1">{order.giftMessage || "메시지 없음"}</dd>
          </div>
        )}
      </dl>
      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-sm">총 결제 금액</span>
        <span className="font-serif text-3xl tabular-nums">{won(order.totalAmount)}</span>
      </div>
      <p className="mt-2 text-right text-xs text-charcoal/50">{order.payments[0]?.provider === "mock" ? "테스트 결제 (실제 승인 없음)" : "결제 완료"}</p>
      <div className="mt-14 flex flex-wrap justify-center gap-3">
        <Link href="/collection" className="btn-ghost">
          계속 둘러보기
        </Link>
        {s.isStaff && (
          <Link href={`/admin/orders/${order.id}`} className="btn-primary">
            관리자에서 주문 보기
          </Link>
        )}
      </div>
    </div>
  );
}
