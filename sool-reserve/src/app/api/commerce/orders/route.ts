import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { commerceSession, OrderError, placeOrder, type CheckoutInput } from "@/lib/orders";
import { ProviderUnavailable } from "@/lib/providers";

export async function POST(req: Request) {
  const s = await commerceSession();
  if (!s.allowed) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as CheckoutInput | null;
  if (!body || !Array.isArray(body.items)) return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  try {
    const r = await placeOrder({ ...body, items: body.items.slice(0, 50) });
    await audit(s.user, "PLACE_ORDER", "Order", r.orderNumber, { total: r.total, test: s.settings.salesMode !== "LIVE" });
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof OrderError || e instanceof ProviderUnavailable) return NextResponse.json({ message: e.message }, { status: 409 });
    console.error(e);
    return NextResponse.json({ message: "주문 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
