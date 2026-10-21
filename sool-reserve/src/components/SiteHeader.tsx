"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartLink from "./CartLink";

const NAV = [
  { href: "/collection", label: "컬렉션" },
  { href: "/masters", label: "명인주" },
  { href: "/limited", label: "리미티드" },
  { href: "/gift", label: "프리미엄 기프트" },
  { href: "/breweries", label: "양조장" },
  { href: "/taste", label: "취향 추천" },
  { href: "/corporate", label: "기업 VIP" },
  { href: "/story", label: "브랜드 스토리" },
];

export default function SiteHeader({ brandName, cartEnabled = false }: { brandName: string; cartEnabled?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // 모바일 메뉴는 <details>로 구현 — JS 없이도 열리고, 페이지 이동 시 닫힘
  useEffect(() => menu.current?.removeAttribute("open"), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-500 bg-ivory/90 backdrop-blur ${scrolled ? "border-b border-line" : "border-b border-transparent"}`}>
      <div className="container-site flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex flex-col leading-none" aria-label={`${brandName} 홈`}>
          <span className="font-serif text-lg tracking-[0.32em] md:text-xl">{brandName}</span>
          <span className="mt-1 font-kserif text-[10px] tracking-[0.5em] text-gold-deep">술의 격</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="주요 메뉴">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`link-underline text-[13px] tracking-wide ${pathname.startsWith(n.href) ? "text-burgundy" : "text-charcoal/80 hover:text-charcoal"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        {cartEnabled && (
          <div className="ml-auto mr-1 lg:ml-6 lg:mr-0">
            <CartLink />
          </div>
        )}
        <details ref={menu} className="group lg:hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none flex-col items-center justify-center gap-1.5" aria-label="메뉴">
            <span className="h-px w-6 bg-charcoal transition group-open:translate-y-[3.5px] group-open:rotate-45" />
            <span className="h-px w-6 bg-charcoal transition group-open:-translate-y-[3.5px] group-open:-rotate-45" />
          </summary>
          <nav className="absolute inset-x-0 top-full border-y border-line bg-ivory px-5 pb-8 pt-4" aria-label="모바일 메뉴">
            <ul className="space-y-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-3 font-kserif text-lg">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-5 text-xs text-charcoal/60">
              <Link href="/magazine">매거진</Link>
              <Link href="/partnership">입점 문의</Link>
              <Link href="/support">고객센터</Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
