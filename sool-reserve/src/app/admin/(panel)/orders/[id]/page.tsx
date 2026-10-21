import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { Stepper, StatusPill } from "@/components/admin/OrderBits";
import { advanceOrderAction, cancelOrderAction, reportDamageAction } from "@/lib/commerce-actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { won } from "@/lib/format";

const NEXT: Record<string, ["PREPARING" | "SHIPPED" | "DELIVERED", string] | undefined> = {
  PAID: ["PREPARING", "상품 준비 시작"],
  PREPARING: ["SHIPPED", "출고 처리"],
  SHIPPED: ["DELIVERED", "배송 완료 처리"],
};

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const [o, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.id },
      include: { sellerOrders: { include: { items: { include: { product: { select: { slug: true, supplier: { select: { name: true } } } } } }, brewery: true } }, payments: true },
    }),
    getSettings(),
  ]);
  if (!o) notFound();
  const canCancel = !["CANCELLED", "REFUNDED"].includes(o.status) && !o.sellerOrders.some((s) => s.status === "SHIPPED" || s.status === "DELIVERED");
  return (
    <>
      <PageTitle
        title={`주문 ${o.orderNumber}`}
        desc={`${o.createdAt.toLocaleString("ko-KR")} · ${o.isTest ? "테스트 주문 (Mock 결제)" : "실주문"}`}
        action={
          <Link href="/admin/orders" className="adm-btn-ghost">
            ← 목록
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {o.sellerOrders.map((so) => {
            const operator = so.sellerType === "OPERATOR";
            const margin = so.subtotal - so.costTotal;
            const next = NEXT[so.status];
            return (
              <section key={so.id} className="adm-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">
                    {operator ? `${settings.brandName} 직매입` : so.brewery?.name} {operator ? <Pill tone="brand">매입형</Pill> : <Pill>중개형</Pill>}
                  </h2>
                  <Stepper s={so.status} />
                </div>
                <table className="adm-table mt-3">
                  <thead>
                    <tr>
                      <th>상품</th>
                      <th className="text-right">단가</th>
                      <th className="text-right">수량</th>
                      <th className="text-right">금액</th>
                      <th className="text-right">{operator ? "매입 원가" : "수수료율"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {so.items.map((i) => (
                      <tr key={i.id}>
                        <td>
                          {i.productName}
                          {operator && i.product.supplier && <span className="ml-1.5 text-xs text-charcoal/45">공급 {i.product.supplier.name}</span>}
                        </td>
                        <td className="text-right tabular-nums">{won(i.unitPrice)}</td>
                        <td className="text-right tabular-nums">{i.quantity}</td>
                        <td className="text-right tabular-nums">{won(i.unitPrice * i.quantity)}</td>
                        <td className="text-right tabular-nums">{operator ? won((i.unitCost ?? 0) * i.quantity) : `${i.commissionRate ?? "-"}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4">
                  <div>
                    <dt className="text-xs text-charcoal/50">상품 금액</dt>
                    <dd className="tabular-nums">{won(so.subtotal)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-charcoal/50">배송비</dt>
                    <dd className="tabular-nums">{won(so.shippingFee)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-charcoal/50">{operator ? "매출총이익 (VAT 포함 기준)" : "플랫폼 수수료"}</dt>
                    <dd className="font-medium tabular-nums">{won(operator ? margin : so.commission)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-charcoal/50">{operator ? "매입 원가" : "판매자 정산 예정"}</dt>
                    <dd className="tabular-nums">{won(operator ? so.costTotal : so.subtotal + so.shippingFee - so.commission)}</dd>
                  </div>
                </dl>
                {so.carrier && (
                  <p className="mt-3 text-sm">
                    운송장 · {so.carrier} <span className="tabular-nums">{so.trackingNumber}</span>
                    {so.shippedAt && <span className="ml-2 text-xs text-charcoal/50">{so.shippedAt.toLocaleString("ko-KR")} 출고</span>}
                  </p>
                )}
                {so.damageReported && <p className="mt-2 rounded bg-[#F6E1E1] px-3 py-2 text-sm text-[#9B1C1C]">파손 신고 · {so.damageNote}</p>}
                <div className="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-2">
                  {next && (
                    <ActionForm action={advanceOrderAction} submitLabel={next[1]}>
                      <input type="hidden" name="sellerOrderId" value={so.id} />
                      <input type="hidden" name="next" value={next[0]} />
                      {next[0] === "SHIPPED" && (
                        <div className="grid grid-cols-2 gap-2">
                          <input name="carrier" placeholder="택배사" className="adm-input" />
                          <input name="trackingNumber" placeholder="운송장 번호" className="adm-input" />
                        </div>
                      )}
                    </ActionForm>
                  )}
                  {(so.status === "SHIPPED" || so.status === "DELIVERED") && !so.damageReported && (
                    <ActionForm action={reportDamageAction} submitLabel="파손 신고 기록">
                      <input type="hidden" name="sellerOrderId" value={so.id} />
                      <input name="damageNote" placeholder="파손 내용 (사진 접수 여부 등)" className="adm-input" />
                    </ActionForm>
                  )}
                </div>
              </section>
            );
          })}
        </div>
        <div className="space-y-4">
          <section className="adm-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">주문 정보</h2>
              <StatusPill s={o.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/55">상품 금액</dt>
                <dd className="tabular-nums">{won(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/55">배송비</dt>
                <dd className="tabular-nums">{won(o.shippingFee)}</dd>
              </div>
              {o.giftWrapFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-charcoal/55">선물 포장</dt>
                  <dd className="tabular-nums">{won(o.giftWrapFee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <dt>결제 금액</dt>
                <dd className="tabular-nums">{won(o.totalAmount)}</dd>
              </div>
            </dl>
            <dl className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
              <div>
                <dt className="text-xs text-charcoal/50">받는 분</dt>
                <dd>
                  {o.recipientName} · {o.recipientPhone}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal/50">주소</dt>
                <dd>
                  {o.postalCode && `(${o.postalCode}) `}
                  {o.address} {o.addressDetail}
                </dd>
              </div>
              {o.deliveryNote && (
                <div>
                  <dt className="text-xs text-charcoal/50">배송 요청</dt>
                  <dd>{o.deliveryNote}</dd>
                </div>
              )}
              {o.desiredDate && (
                <div>
                  <dt className="text-xs text-charcoal/50">희망 배송일</dt>
                  <dd>{o.desiredDate.toLocaleDateString("ko-KR")}</dd>
                </div>
              )}
              {o.giftWrap && (
                <div>
                  <dt className="text-xs text-charcoal/50">선물 포장 · 메시지</dt>
                  <dd>{o.giftMessage || "메시지 없음"}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-charcoal/50">성인 인증</dt>
                <dd>{o.ageVerificationId ? "인증 완료 (주문 시점 서버 재검증)" : "-"}</dd>
              </div>
            </dl>
          </section>
          <section className="adm-card">
            <h2 className="text-sm font-semibold">결제</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {o.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>
                    {p.provider === "mock" ? "테스트 결제" : p.provider} <span className="text-xs text-charcoal/45">{p.externalRef}</span>
                  </span>
                  <Pill tone={p.status === "PAID" ? "good" : "bad"}>{p.status === "PAID" ? "승인" : p.status === "REFUNDED" ? "환불" : p.status}</Pill>
                </li>
              ))}
              {o.payments.length === 0 && <li className="text-charcoal/50">결제 내역 없음</li>}
            </ul>
          </section>
          {canCancel ? (
            <section className="adm-card">
              <h2 className="text-sm font-semibold">주문 취소 · 환불</h2>
              <p className="mt-1 text-xs text-charcoal/50">출고 전 주문만 취소할 수 있습니다. 재고가 복구되고 결제는 환불됩니다.</p>
              <div className="mt-3">
                <ActionForm action={cancelOrderAction} submitLabel="주문 취소">
                  <input type="hidden" name="orderId" value={o.id} />
                  <input name="reason" placeholder="취소 사유" className="adm-input" />
                </ActionForm>
              </div>
            </section>
          ) : (
            o.cancelReason && <p className="adm-card text-sm">취소 사유 · {o.cancelReason}</p>
          )}
        </div>
      </div>
    </>
  );
}
