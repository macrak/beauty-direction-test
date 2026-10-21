"use server";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requirePartner, requireStaff } from "./auth";
import { audit } from "./audit";
import { bool, FormError, int, oneOf, reqStr, str, type ActionState } from "./form";
import { advanceSellerOrder, cancelOrder, OrderError } from "./orders";

function fail(e: unknown): ActionState {
  if (e instanceof FormError || e instanceof OrderError) return { ok: false, message: e.message };
  const err = e as { code?: string; digest?: string };
  if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e;
  console.error(e);
  return { ok: false, message: "처리 중 오류가 발생했습니다." };
}

// ─── 주문 · 배송 ────────────────────────────────────────

export async function advanceOrderAction(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  try {
    const id = reqStr(fd, "sellerOrderId", "주문");
    const next = oneOf(fd, "next", ["PREPARING", "SHIPPED", "DELIVERED"] as const, "PREPARING");
    await advanceSellerOrder(id, next, { carrier: str(fd, "carrier") ?? undefined, trackingNumber: str(fd, "trackingNumber") ?? undefined });
    await audit(user, "ORDER_" + next, "SellerOrder", id);
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/orders", "layout");
  return { ok: true, message: "배송 상태를 변경했습니다." };
}

export async function cancelOrderAction(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  try {
    const id = reqStr(fd, "orderId", "주문");
    const reason = reqStr(fd, "reason", "취소 사유", 200);
    const o = await cancelOrder(id, reason);
    await audit(user, "ORDER_CANCEL", "Order", id, { status: o.status, reason });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/orders", "layout");
  return { ok: true, message: "주문을 취소하고 재고를 복구했습니다. 결제 건은 환불 처리되었습니다." };
}

export async function reportDamageAction(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  try {
    const id = reqStr(fd, "sellerOrderId", "주문");
    const note = reqStr(fd, "damageNote", "파손 내용", 300);
    await prisma.sellerOrder.update({ where: { id }, data: { damageReported: true, damageNote: note } });
    await audit(user, "ORDER_DAMAGE", "SellerOrder", id, { note });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/orders", "layout");
  return { ok: true, message: "파손 신고를 기록했습니다." };
}

// 양조장 파트너: 자사 판매자 주문만 배송 처리
export async function partnerAdvanceAction(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePartner();
  try {
    const id = reqStr(fd, "sellerOrderId", "주문");
    const so = await prisma.sellerOrder.findFirst({ where: { id, breweryId: user.breweryId } });
    if (!so) throw new FormError("처리 권한이 없는 주문입니다.");
    const next = oneOf(fd, "next", ["PREPARING", "SHIPPED"] as const, "PREPARING");
    await advanceSellerOrder(id, next, { carrier: str(fd, "carrier") ?? undefined, trackingNumber: str(fd, "trackingNumber") ?? undefined });
    await audit(user, "PARTNER_ORDER_" + next, "SellerOrder", id);
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/partner/orders");
  return { ok: true, message: "배송 상태를 변경했습니다." };
}

// ─── 공급처 ───────────────────────────────────────────

export async function saveSupplier(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  let id = str(fd, "id");
  try {
    const data = {
      name: reqStr(fd, "name", "공급처명", 80),
      businessNumber: str(fd, "businessNumber", 20),
      licenseType: str(fd, "licenseType", 40),
      licenseNumber: str(fd, "licenseNumber", 60),
      licenseVerified: bool(fd, "licenseVerified"),
      contactName: str(fd, "contactName", 40),
      phone: str(fd, "phone", 30),
      email: str(fd, "email", 120),
      address: str(fd, "address", 200),
      paymentTerms: str(fd, "paymentTerms", 200),
      leadTimeDays: int(fd, "leadTimeDays", { min: 0, max: 365, label: "입고 소요일" }),
      note: str(fd, "note", 2000),
      active: bool(fd, "active"),
    };
    if (id) await prisma.supplier.update({ where: { id }, data });
    else id = (await prisma.supplier.create({ data })).id;
    await audit(user, "SAVE", "Supplier", id, { name: data.name, licenseVerified: data.licenseVerified });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/suppliers", "layout");
  return { ok: true, message: "저장되었습니다.", redirectTo: `/admin/suppliers/${id}?saved=1` };
}

// ─── 발주 ─────────────────────────────────────────────

function poNumber() {
  const d = new Date();
  return `PO${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function createPurchaseOrder(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  let id: string;
  try {
    const supplierId = reqStr(fd, "supplierId", "공급처");
    const products = await prisma.product.findMany({ where: { supplierId } });
    const items = products
      .map((p) => ({ p, qty: int(fd, `qty_${p.id}`, { min: 0, max: 100000, label: `${p.name} 수량` }) ?? 0, cost: int(fd, `cost_${p.id}`, { min: 0, label: `${p.name} 단가` }) ?? p.wholesaleCost ?? 0 }))
      .filter((x) => x.qty > 0);
    if (!items.length) throw new FormError("발주 수량을 1개 이상 입력해 주세요.");
    if (items.some((x) => x.cost <= 0)) throw new FormError("매입 단가를 입력해 주세요.");
    const po = await prisma.purchaseOrder.create({
      data: {
        number: poNumber(),
        supplierId,
        note: str(fd, "note", 1000),
        createdBy: user.email,
        totalCost: items.reduce((a, x) => a + x.qty * x.cost, 0),
        items: { create: items.map((x) => ({ productId: x.p.id, quantity: x.qty, unitCost: x.cost })) },
      },
    });
    id = po.id;
    await audit(user, "CREATE", "PurchaseOrder", id, { number: po.number, total: po.totalCost });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/purchase-orders", "layout");
  return { ok: true, message: "발주서를 만들었습니다.", redirectTo: `/admin/purchase-orders/${id}` };
}

// 발주 상태: DRAFT → ORDERED → RECEIVED(재고 입고 · 매입가 갱신) / 취소
export async function updatePurchaseOrder(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "FINANCE"]);
  try {
    const id = reqStr(fd, "id", "발주");
    const to = oneOf(fd, "to", ["ORDERED", "RECEIVED", "CANCELLED"] as const, "ORDERED");
    const po = await prisma.purchaseOrder.findUniqueOrThrow({ where: { id }, include: { items: true } });
    const allowed: string[] = { DRAFT: ["ORDERED", "CANCELLED"], ORDERED: ["RECEIVED", "CANCELLED"], RECEIVED: [], CANCELLED: [] }[po.status];
    if (!allowed.includes(to)) throw new FormError("현재 상태에서는 변경할 수 없습니다.");
    if (to === "RECEIVED") {
      await prisma.$transaction([
        ...po.items.map((i) => prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity }, wholesaleCost: i.unitCost } })),
        prisma.purchaseOrder.update({ where: { id }, data: { status: "RECEIVED", receivedAt: new Date() } }),
      ]);
    } else {
      await prisma.purchaseOrder.update({ where: { id }, data: { status: to, ...(to === "ORDERED" ? { orderedAt: new Date() } : {}) } });
    }
    await audit(user, "PO_" + to, "PurchaseOrder", id, { number: po.number });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "발주 상태를 변경했습니다." };
}
