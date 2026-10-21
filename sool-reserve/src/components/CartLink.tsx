"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_EVENT, readCart } from "./cart";

export default function CartLink() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => setN(readCart().reduce((a, x) => a + x.quantity, 0));
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return (
    <Link href="/cart" className="relative inline-flex h-10 w-10 items-center justify-center" aria-label={`장바구니 ${n}개`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {n > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] text-ivory tabular-nums">{n}</span>}
    </Link>
  );
}
