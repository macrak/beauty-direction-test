import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { Stepper } from "@/components/admin/OrderBits";
import { requirePartner } from "@/lib/auth";
import { partnerAdvanceAction } from "@/lib/commerce-actions";
import { prisma } from "@/lib/db";
import { won } from "@/lib/format";

export default async function PartnerOrders() {
  const user = await requirePartner();
  // 테넌트 격리: 자사(brewery) 판매자 주문만
  const orders = await prisma.sellerOrder.findMany({
    where: { breweryId: user.breweryId },
    include: { items: true, order: { select: { orderNumber: true, createdAt: true, recipientName: true, recipientPhone: true, address: true, addressDetail: true, deliveryNote: true, isTest: true, giftWrap: true } } },
    orderBy: { order: { createdAt: "desc" } },
    take: 100,
  });
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  return (
    <>
      <PageTitle title="주문 · 출고" desc="자사 상품 주문만 표시됩니다. 출고 시 택배사와 운송장 번호를 입력하세요." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["신규 (출고 대기)", `${orders.filter((o) => o.status === "PAID" || o.status === "PREPARING").length}건`],
          ["배송 중", `${orders.filter((o) => o.status === "SHIPPED").length}건`],
          ["배송 완료 거래액", won(delivered.reduce((a, o) => a + o.subtotal + o.shippingFee, 0))],
          ["정산 예정액", won(delivered.reduce((a, o) => a + o.subtotal + o.shippingFee - o.commission, 0))],
        ].map(([l, v]) => (
          <div key={l} className="adm-card">
            <p className="text-xs text-charcoal/55">{l}</p>
            <p className="mt-2 text-lg font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {orders.map((so) => (
          <section key={so.id} className="adm-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium tabular-nums">
                {so.order.orderNumber} {so.order.isTest && <Pill>테스트</Pill>} {so.order.giftWrap && <Pill tone="brand">선물 포장</Pill>}
              </p>
              <Stepper s={so.status} />
            </div>
            <ul className="mt-2 text-sm">
              {so.items.map((i) => (
                <li key={i.id}>
                  {i.productName} × {i.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-charcoal/60">
              {so.order.recipientName} · {so.order.recipientPhone} · {so.order.address} {so.order.addressDetail} {so.order.deliveryNote && `· ${so.order.deliveryNote}`}
            </p>
            {so.carrier && (
              <p className="mt-1 text-xs">
                운송장 {so.carrier} {so.trackingNumber}
              </p>
            )}
            {(so.status === "PAID" || so.status === "PREPARING") && (
              <div className="mt-3 max-w-md border-t border-line pt-3">
                <ActionForm action={partnerAdvanceAction} submitLabel={so.status === "PAID" ? "상품 준비 시작" : "출고 처리"}>
                  <input type="hidden" name="sellerOrderId" value={so.id} />
                  <input type="hidden" name="next" value={so.status === "PAID" ? "PREPARING" : "SHIPPED"} />
                  {so.status === "PREPARING" && (
                    <div className="grid grid-cols-2 gap-2">
                      <input name="carrier" placeholder="택배사" className="adm-input" />
                      <input name="trackingNumber" placeholder="운송장 번호" className="adm-input" />
                    </div>
                  )}
                </ActionForm>
              </div>
            )}
          </section>
        ))}
        {orders.length === 0 && <p className="adm-card text-sm text-charcoal/55">주문 내역이 없습니다. 판매 기능이 활성화되면 자사 주문만 이곳에 표시됩니다.</p>}
      </div>
    </>
  );
}
