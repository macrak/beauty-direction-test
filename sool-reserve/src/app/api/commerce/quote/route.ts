import { NextResponse } from "next/server";
import { commerceSession, quote } from "@/lib/orders";

export async function POST(req: Request) {
  const s = await commerceSession();
  if (!s.allowed) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { items?: unknown } | null;
  const items = Array.isArray(body?.items) ? (body!.items as { productId: string; quantity: number }[]).slice(0, 50) : [];
  return NextResponse.json({ quote: await quote(items, s.settings, s.isStaff), giftWrapFee: s.settings.giftWrapFee, mode: s.settings.salesMode });
}
