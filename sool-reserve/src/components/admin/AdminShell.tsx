import Link from "next/link";
import { logout } from "@/lib/session-actions";
import { ROLE_LABEL } from "@/lib/labels";

export interface NavItem {
  href: string;
  label: string;
  group?: string;
}

export default function AdminShell({
  title,
  nav,
  user,
  area,
  banner,
  children,
}: {
  title: string;
  nav: NavItem[];
  user: { name: string; email: string; role: keyof typeof ROLE_LABEL; brewery?: { name: string } | null };
  area: "admin" | "partner";
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const groups = Array.from(new Set(nav.map((n) => n.group ?? "")));
  return (
    <div className="min-h-screen bg-[#F1EDE5] text-charcoal lg:flex">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Link href={area === "admin" ? "/admin" : "/partner"}>
            <p className="font-serif text-base tracking-[0.28em]">SOOL RESERVE</p>
            <p className="mt-0.5 text-[10px] tracking-widest text-charcoal/50">{title}</p>
          </Link>
          <Link href="/" target="_blank" className="text-xs text-charcoal/50 hover:text-charcoal lg:mt-3 lg:inline-block">
            사이트 보기 ↗
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-4 lg:pb-6">
          {groups.map((g) => (
            <div key={g} className="flex gap-1 lg:block lg:space-y-0.5">
              {g && <p className="hidden px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-widest text-charcoal/40 lg:block">{g}</p>}
              {nav
                .filter((n) => (n.group ?? "") === g)
                .map((n) => (
                  <Link key={n.href} href={n.href} className="block whitespace-nowrap rounded px-2 py-1.5 text-[13px] text-charcoal/75 hover:bg-[#F1EDE5] hover:text-charcoal">
                    {n.label}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div className="hidden border-t border-line px-5 py-4 text-xs lg:block">
          <p className="font-medium">{user.name}</p>
          <p className="text-charcoal/50">{user.brewery?.name ?? ROLE_LABEL[user.role]}</p>
          <form action={logout} className="mt-3">
            <input type="hidden" name="area" value={area} />
            <button className="text-charcoal/50 underline hover:text-charcoal">로그아웃</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {banner}
        <main className="mx-auto max-w-[1280px] p-4 md:p-8">{children}</main>
        <form action={logout} className="px-4 pb-8 lg:hidden">
          <input type="hidden" name="area" value={area} />
          <button className="text-xs text-charcoal/50 underline">로그아웃 ({user.email})</button>
        </form>
      </div>
    </div>
  );
}

export function PageTitle({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {desc && <p className="mt-1 text-sm text-charcoal/55">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "brand" }) {
  const cls = {
    neutral: "bg-[#EEE9E0] text-charcoal/70",
    good: "bg-[#E3EFE5] text-[#22603A]",
    warn: "bg-[#FBF0D9] text-[#8A5A00]",
    bad: "bg-[#F6E1E1] text-[#9B1C1C]",
    brand: "bg-burgundy/10 text-burgundy",
  }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}
