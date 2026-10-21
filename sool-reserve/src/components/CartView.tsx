"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BottleArt from "./BottleArt";
import { readCart, writeCart, type CartItem } from "./cart";
import { won } from "@/lib/format";
import type { Quote } from "@/lib/orders";

export function useQuote() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [q, setQ] = useState<Quote | null>(null);
  const [giftWrapFee, setGiftWrapFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async (next?: CartItem[]) => {
    const list = next ?? readCart();
    setItems(list);
    setLoading(true);
    try {
      const r = await fetch("/api/commerce/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: list }) });
      const d = await r.json();
      setQ(d.quote ?? null);
      setGiftWrapFee(d.giftWrapFee ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { items, q, giftWrapFee, loading, refresh };
}

export function Thumb({ imageUrl, liquorType, name }: { imageUrl: string | null; liquorType: string; name: string }) {
  return (
    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden bg-beige md:h-28 md:w-24">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <BottleArt type={liquorType as never} className="h-[80%] w-auto" />
      )}
    </div>
  );
}

export default function CartView({ testMode }: { testMode: boolean }) {
  const { items, q, loading, refresh } = useQuote();

  const setQty = (productId: string, quantity: number) => {
    const next = (items ?? []).map((x) => (x.productId === productId ? { ...x, quantity } : x)).filter((x) => x.quantity > 0);
    writeCart(next);
    refresh(next);
  };

  if (items && items.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="font-kserif text-2xl font-light">장바구니가 비어 있습니다.</p>
        <p className="mt-3 text-sm text-charcoal/55">마음에 드는 한 병을 찾아보세요.</p>
        <Link href="/collection" className="btn-primary mt-10">
          컬렉션 살펴보기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-8">
        {!q && loading && <p className="py-20 text-center text-sm text-charcoal/50">불러오는 중…</p>}
        {q &&
          [...new Set(q.lines.map((l) => l.sellerKey))].map((key) => {
            const lines = q.lines.filter((l) => l.sellerKey === key);
            const g = q.groups.find((x) => x.sellerKey === key);
            return (
              <section key={key} className="mb-10">
                <div className="flex items-baseline justify-between border-b border-charcoal pb-3">
                  <h2 className="text-sm">
                    <span className="text-charcoal/50">판매자</span> <span className="ml-1 font-medium">{lines[0].sellerLabel}</span>
                  </h2>
                  {g && <span className="text-xs text-charcoal/50">배송비 {g.shippingFee ? won(g.shippingFee) : "무료"}</span>}
                </div>
                <ul className="divide-y divide-line">
                  {lines.map((l) => (
                    <li key={l.productId} className="flex gap-4 py-5 md:gap-6">
                      <Link href={`/products/${l.slug}`}>
                        <Thumb imageUrl={l.imageUrl} liquorType={l.liquorType} name={l.name} />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div className="min-w-0">
                          <p className="text-[11px] tracking-wider text-charcoal/50">{l.breweryName}</p>
                          <Link href={`/products/${l.slug}`} className="mt-1 block font-kserif text-base hover:text-burgundy">
                            {l.name}
                          </Link>
                          <p className="mt-1 text-xs text-charcoal/50">{won(l.unitPrice)}</p>
                          {l.error && <p className="mt-2 text-xs text-burgundy">{l.error}</p>}
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="flex items-center border border-charcoal/20" role="group" aria-label={`${l.name} 수량`}>
                            <button type="button" className="px-3 py-1.5 disabled:opacity-30" onClick={() => setQty(l.productId, l.quantity - 1)} disabled={l.quantity <= 1} aria-label="수량 줄이기">
                              −
                            </button>
                            <span className="w-7 text-center text-sm tabular-nums">{l.quantity}</span>
                            <button type="button" className="px-3 py-1.5 disabled:opacity-30" onClick={() => setQty(l.productId, l.quantity + 1)} disabled={l.quantity >= Math.min(24, l.stock)} aria-label="수량 늘리기">
                              +
                            </button>
                          </div>
                          <span className="w-24 text-right font-serif text-lg tabular-nums">{won(l.lineTotal)}</span>
                          <button type="button" onClick={() => setQty(l.productId, 0)} className="text-xs text-charcoal/45 underline-offset-4 hover:text-charcoal hover:underline">
                            삭제
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        <p className="text-xs leading-relaxed text-charcoal/50">
          판매자가 다른 상품은 각 판매자가 따로 출고하며, 배송비도 판매자별로 부과됩니다. 냉장 상품은 지정 요일에만 출고됩니다.
        </p>
      </div>
      <aside className="lg:col-span-4">
        <div className="sticky top-28 border border-line bg-white/70 p-6 md:p-8">
          <h2 className="font-kserif text-lg">주문 요약</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/60">상품 금액</dt>
              <dd className="tabular-nums">{won(q?.subtotal ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal/60">배송비</dt>
              <dd className="tabular-nums">{q?.shippingFee ? won(q.shippingFee) : "무료"}</dd>
            </div>
          </dl>
          <div className="mt-6 flex items-baseline justify-between border-t border-charcoal pt-5">
            <span className="text-sm">결제 예정 금액</span>
            <span className="font-serif text-2xl tabular-nums">{won(q?.total ?? 0)}</span>
          </div>
          {q?.hasErrors && <p className="mt-4 text-xs text-burgundy">주문할 수 없는 상품을 정리한 뒤 진행해 주세요.</p>}
          <Link href="/checkout" aria-disabled={!q || q.hasErrors || !q.lines.length} className={`btn-primary mt-6 w-full ${!q || q.hasErrors || !q.lines.length ? "pointer-events-none opacity-40" : ""}`}>
            주문하기
          </Link>
          {testMode && <p className="mt-4 text-center text-[11px] text-burgundy">비공개 테스트 모드 · 실제 결제되지 않습니다</p>}
        </div>
      </aside>
    </div>
  );
}
