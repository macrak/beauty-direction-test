// 주문 처리: 견적(서버 재검증) → 성인인증 확인 → 판매자별 분할 저장 → 재고 차감 → 결제
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { canOrder, commerceRouteAllowed } from "./commerce";
import { getCurrentUser, STAFF_ROLES } from "./auth";
import { productEconomics } from "./economics";
import { getPaymentProvider } from "./providers";
import { getSettings, type SiteSettings } from "./settings";

export const AGE_COOKIE = "sr_age";
export const MAX_QTY_PER_ITEM = 24;

export class OrderError extends Error {}

export async function commerceSession() {
  const settings = await getSettings();
  const user = await getCurrentUser();
  const isStaff = !!user && STAFF_ROLES.includes(user.role);
  return { settings, user, isStaff, allowed: commerceRouteAllowed(settings.salesMode, isStaff) };
}

export interface CartLineInput {
  productId: string;
  quantity: number;
}

export interface QuoteLine {
  productId: string;
  slug: string;
  name: string;
  breweryName: string;
  liquorType: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  lineTotal: number;
  sellerKey: string; // "brewery:<id>" | "operator"
  sellerLabel: string;
  shippingFee: number;
  giftWrapAvailable: boolean;
  error: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  groups: { sellerKey: string; sellerLabel: string; subtotal: number; shippingFee: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  hasErrors: boolean;
}

export async function quote(items: CartLineInput[], settings: SiteSettings, isStaff: boolean): Promise<Quote> {
  const qty = new Map<string, number>();
  for (const i of items) {
    if (!i || typeof i.productId !== "string") continue;
    const n = Math.floor(Number(i.quantity));
    if (n > 0) qty.set(i.productId, Math.min(MAX_QTY_PER_ITEM, (qty.get(i.productId) ?? 0) + n));
  }
  const products = await prisma.product.findMany({ where: { id: { in: [...qty.keys()] } }, include: { brewery: true } });
  const lines: QuoteLine[] = [];
  for (const [id, quantity] of qty) {
    const p = products.find((x) => x.id === id);
    if (!p) continue;
    const orderable = canOrder({ mode: settings.salesMode, isStaff, product: p, brewery: p.brewery, operatorLicenseConfirmed: settings.operatorLicenseConfirmed });
    const wholesale = p.tradeModel === "WHOLESALE";
    let error: string | null = null;
    if (!orderable) error = p.eligibility === "INELIGIBLE" ? "온라인 판매 대상이 아닌 상품입니다." : p.stock <= 0 ? "품절된 상품입니다." : "현재 주문할 수 없는 상품입니다.";
    else if (quantity > p.stock) error = `재고가 ${p.stock}병 남았습니다.`;
    lines.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      breweryName: p.brewery.name,
      liquorType: p.liquorType,
      imageUrl: p.imageUrl,
      unitPrice: p.price,
      quantity,
      stock: p.stock,
      lineTotal: p.price * quantity,
      sellerKey: wholesale ? "operator" : `brewery:${p.breweryId}`,
      sellerLabel: wholesale ? `${settings.brandName} 직매입` : p.brewery.name,
      shippingFee: p.shippingFee,
      giftWrapAvailable: p.giftPurposes.length > 0 || !!p.giftWrapOptions,
      error,
    });
  }
  // 배송비: 판매자 묶음별 상품 배송비 중 최댓값 1회
  const groupMap = new Map<string, { sellerKey: string; sellerLabel: string; subtotal: number; shippingFee: number }>();
  for (const l of lines.filter((x) => !x.error)) {
    const g = groupMap.get(l.sellerKey) ?? { sellerKey: l.sellerKey, sellerLabel: l.sellerLabel, subtotal: 0, shippingFee: 0 };
    g.subtotal += l.lineTotal;
    g.shippingFee = Math.max(g.shippingFee, l.shippingFee);
    groupMap.set(l.sellerKey, g);
  }
  const groups = [...groupMap.values()];
  const subtotal = groups.reduce((a, g) => a + g.subtotal, 0);
  const shippingFee = groups.reduce((a, g) => a + g.shippingFee, 0);
  return { lines, groups, subtotal, shippingFee, total: subtotal + shippingFee, hasErrors: lines.some((l) => l.error) };
}

export async function currentAgeVerification() {
  const id = cookies().get(AGE_COOKIE)?.value;
  if (!id) return null;
  const v = await prisma.ageVerification.findUnique({ where: { id } });
  return v && v.isAdult && v.expiresAt > new Date() ? v : null;
}

export interface CheckoutInput {
  items: CartLineInput[];
  recipientName: string;
  recipientPhone: string;
  postalCode?: string;
  address: string;
  addressDetail?: string;
  deliveryNote?: string;
  desiredDate?: string;
  giftWrap?: boolean;
  giftMessage?: string;
}

function orderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `SR${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function placeOrder(input: CheckoutInput) {
  const { settings, user, isStaff, allowed } = await commerceSession();
  if (!allowed) throw new OrderError("현재 주문 기능을 사용할 수 없습니다.");
  // 주문 시점 성인 인증 재검증 (서버)
  const age = await currentAgeVerification();
  if (!age) throw new OrderError("성인 인증이 필요합니다. 인증 후 다시 시도해 주세요.");
  if (!input.recipientName?.trim() || !input.address?.trim() || !/^[0-9+\-\s()]{7,20}$/.test(input.recipientPhone ?? "")) {
    throw new OrderError("받는 분 이름·연락처·주소를 확인해 주세요.");
  }
  const q = await quote(input.items, settings, isStaff);
  if (!q.lines.length) throw new OrderError("주문할 상품이 없습니다.");
  if (q.hasErrors) throw new OrderError(q.lines.find((l) => l.error)?.error ?? "주문할 수 없는 상품이 있습니다.");
  const giftWrapFee = input.giftWrap ? settings.giftWrapFee : 0;
  const total = q.total + giftWrapFee;
  const products = await prisma.product.findMany({ where: { id: { in: q.lines.map((l) => l.productId) } }, include: { brewery: true } });
  const number = orderNumber();

  const order = await prisma.$transaction(async (tx) => {
    // 재고 차감 (동시 주문 대비 조건부 갱신)
    for (const l of q.lines) {
      const r = await tx.product.updateMany({ where: { id: l.productId, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } });
      if (r.count !== 1) throw new OrderError(`${l.name} 재고가 부족합니다.`);
    }
    const sellerOrders: Prisma.SellerOrderCreateWithoutOrderInput[] = q.groups.map((g) => {
      const lines = q.lines.filter((l) => l.sellerKey === g.sellerKey);
      let commission = 0;
      let costTotal = 0;
      const items = lines.map((l) => {
        const p = products.find((x) => x.id === l.productId)!;
        const ec = productEconomics(p, settings.defaultCommissionRate);
        if (p.tradeModel === "WHOLESALE") costTotal += (p.wholesaleCost ?? 0) * l.quantity;
        else commission += ec.commission * l.quantity;
        return {
          product: { connect: { id: p.id } },
          productName: p.name,
          quantity: l.quantity,
          unitPrice: p.price,
          tradeModel: p.tradeModel,
          commissionRate: p.tradeModel === "COMMISSION" ? ec.commissionRate : null,
          unitCost: p.tradeModel === "WHOLESALE" ? p.wholesaleCost : null,
        };
      });
      const breweryId = g.sellerKey.startsWith("brewery:") ? g.sellerKey.slice(8) : null;
      return {
        sellerType: breweryId ? "BREWERY" : "OPERATOR",
        ...(breweryId ? { brewery: { connect: { id: breweryId } } } : {}),
        status: "PAID",
        subtotal: g.subtotal,
        shippingFee: g.shippingFee,
        commission,
        costTotal,
        items: { create: items },
      };
    });
    return tx.order.create({
      data: {
        orderNumber: number,
        customerRef: user ? `staff:${user.id}` : "guest",
        ageVerificationId: age.id,
        status: "PENDING",
        subtotal: q.subtotal,
        shippingFee: q.shippingFee,
        giftWrapFee,
        totalAmount: total,
        recipientName: input.recipientName.trim().slice(0, 40),
        recipientPhone: input.recipientPhone.trim().slice(0, 20),
        postalCode: input.postalCode?.trim().slice(0, 10) || null,
        address: input.address.trim().slice(0, 200),
        addressDetail: input.addressDetail?.trim().slice(0, 100) || null,
        deliveryNote: input.deliveryNote?.trim().slice(0, 200) || null,
        desiredDate: input.desiredDate ? new Date(`${input.desiredDate}T00:00:00+09:00`) : null,
        giftWrap: !!input.giftWrap,
        giftMessage: input.giftWrap ? input.giftMessage?.trim().slice(0, 200) || null : null,
        isTest: settings.salesMode !== "LIVE",
        sellerOrders: { create: sellerOrders },
      },
    });
  });

  // 결제 — 실패 시 주문 취소·재고 복구
  const provider = getPaymentProvider(settings.salesMode);
  const pay = await provider.charge(total, number);
  if (!pay.ok) {
    await cancelOrder(order.id, "결제 실패", false);
    throw new OrderError(pay.message ?? "결제에 실패했습니다.");
  }
  await prisma.$transaction([
    prisma.payment.create({ data: { orderId: order.id, provider: pay.provider, amount: total, status: "PAID", externalRef: pay.externalRef } }),
    prisma.order.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date() } }),
  ]);
  return { orderNumber: number, total };
}

// 주문 취소: 재고 복구 + 결제 환불(결제된 경우)
export async function cancelOrder(orderId: string, reason: string, refund = true) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { sellerOrders: { include: { items: true } }, payments: true } });
  if (order.status === "CANCELLED" || order.status === "REFUNDED") return order;
  if (order.sellerOrders.some((s) => s.status === "SHIPPED" || s.status === "DELIVERED")) throw new OrderError("출고된 주문은 반품 절차로 처리해 주세요.");
  const settings = await getSettings();
  const paid = order.payments.find((p) => p.status === "PAID");
  if (refund && paid) {
    const provider = getPaymentProvider(settings.salesMode === "SHOWCASE" ? "PRIVATE_TEST" : settings.salesMode);
    const r = await provider.refund(paid.externalRef ?? "", paid.amount);
    if (!r.ok) throw new OrderError(r.message ?? "환불에 실패했습니다.");
  }
  const status = paid ? "REFUNDED" : "CANCELLED";
  await prisma.$transaction([
    ...order.sellerOrders.flatMap((s) => s.items.map((i) => prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } }))),
    ...(paid ? [prisma.payment.update({ where: { id: paid.id }, data: { status: "REFUNDED", refundedAt: new Date() } })] : []),
    prisma.sellerOrder.updateMany({ where: { orderId }, data: { status } }),
    prisma.order.update({ where: { id: orderId }, data: { status, cancelledAt: new Date(), cancelReason: reason.slice(0, 200) } }),
  ]);
  return prisma.order.findUniqueOrThrow({ where: { id: orderId } });
}

// 판매자 주문 상태 변경 (배송 흐름). 전체 주문 상태는 판매자 주문들의 최소 진행 단계로 맞춘다.
const FLOW = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;
export async function advanceSellerOrder(sellerOrderId: string, next: (typeof FLOW)[number], ship?: { carrier?: string; trackingNumber?: string }) {
  const so = await prisma.sellerOrder.findUniqueOrThrow({ where: { id: sellerOrderId } });
  const cur = FLOW.indexOf(so.status as (typeof FLOW)[number]);
  const to = FLOW.indexOf(next);
  if (cur < 0) throw new OrderError("취소·환불된 주문은 변경할 수 없습니다.");
  if (to !== cur + 1) throw new OrderError("배송 단계는 순서대로만 변경할 수 있습니다.");
  if (next === "SHIPPED" && (!ship?.carrier?.trim() || !ship?.trackingNumber?.trim())) throw new OrderError("택배사와 운송장 번호를 입력해 주세요.");
  await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data: {
      status: next,
      ...(next === "SHIPPED" ? { carrier: ship!.carrier!.trim().slice(0, 40), trackingNumber: ship!.trackingNumber!.trim().slice(0, 40), shippedAt: new Date() } : {}),
      ...(next === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
  });
  const siblings = await prisma.sellerOrder.findMany({ where: { orderId: so.orderId } });
  const min = Math.min(...siblings.map((s) => FLOW.indexOf(s.status as (typeof FLOW)[number])).filter((x) => x >= 0));
  if (Number.isFinite(min)) await prisma.order.update({ where: { id: so.orderId }, data: { status: FLOW[min] } });
}

export const ORDER_STATUS_LABEL = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  PREPARING: "상품 준비 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "주문 취소",
  REFUNDED: "환불 완료",
} as const;
