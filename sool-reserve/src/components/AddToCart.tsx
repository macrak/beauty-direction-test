"use client";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "./cart";

export default function AddToCart({ productId, stock, testMode }: { productId: string; stock: number; testMode: boolean }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.min(stock, 24);
  return (
    <div className="mt-8 space-y-3">
      {testMode && (
        <p className="inline-flex items-center gap-2 border border-burgundy/30 bg-burgundy/5 px-2.5 py-1 text-[11px] tracking-wider text-burgundy">
          <span className="h-1.5 w-1.5 rounded-full bg-burgundy" />
          비공개 테스트 · 관리자에게만 보이며 실제 결제되지 않습니다
        </p>
      )}
      <div className="flex items-stretch gap-3">
        <div className="flex items-center border border-charcoal/25" role="group" aria-label="수량">
          <button type="button" className="h-full px-4 text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="수량 줄이기">
            −
          </button>
          <span className="w-8 text-center font-serif text-lg tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button type="button" className="h-full px-4 text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="수량 늘리기">
            +
          </button>
        </div>
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={() => {
            addToCart(productId, qty);
            setAdded(true);
          }}
        >
          장바구니 담기
        </button>
      </div>
      <p className="text-xs text-charcoal/50">재고 {stock}병 · 1회 최대 24병</p>
      {added && (
        <p className="flex items-center justify-between border-t border-line pt-3 text-sm">
          장바구니에 담았습니다.
          <Link href="/cart" className="link-underline text-burgundy">
            장바구니 보기 →
          </Link>
        </p>
      )}
    </div>
  );
}
