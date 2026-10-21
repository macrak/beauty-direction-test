"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function SiteHeader({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-500 ${scrolled || open ? "border-b border-line bg-ivory/95 backdrop-blur" : "bg-transparent"}`}>
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
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="메뉴 열기"
        >
          <span className={`h-px w-6 bg-charcoal transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-6 bg-charcoal transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <nav className="container-site border-t border-line pb-8 pt-4 lg:hidden" aria-label="모바일 메뉴">
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
            <Link href="/partnership">입점 문의</Link>
            <Link href="/support">고객센터</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
