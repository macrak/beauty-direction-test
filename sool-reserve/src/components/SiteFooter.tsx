import Link from "next/link";
import { getCurrentNotices } from "@/lib/legal";
import type { SiteSettings } from "@/lib/settings";

export default async function SiteFooter({ settings }: { settings: SiteSettings }) {
  const n = await getCurrentNotices(["HEALTH_WARNING", "YOUTH_NOTICE", "INTERMEDIARY"]);
  const b = settings.business;
  return (
    <footer className="mt-24 bg-charcoal text-ivory/80 md:mt-32">
      {n.HEALTH_WARNING && (
        <div className="border-b border-ivory/10 bg-burgundy/90">
          <p className="container-site py-3 text-center text-[11px] leading-relaxed text-ivory/90 md:text-xs">{n.HEALTH_WARNING.body}</p>
        </div>
      )}
      <div className="container-site grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-xl tracking-[0.32em] text-ivory">{settings.brandName}</p>
          <p className="mt-2 font-kserif text-xs tracking-[0.4em] text-gold">{settings.brandNameKo}</p>
          <p className="mt-6 text-xs leading-relaxed text-ivory/50">{settings.subCopy}</p>
        </div>
        <FooterCol
          title="Collection"
          links={[
            ["/collection", "전체 컬렉션"],
            ["/masters", "명인주 컬렉션"],
            ["/limited", "리미티드 에디션"],
            ["/gift", "프리미엄 기프트"],
            ["/taste", "취향별 추천"],
          ]}
        />
        <FooterCol
          title="About"
          links={[
            ["/story", "브랜드 스토리"],
            ["/breweries", "양조장"],
            ["/magazine", "매거진"],
            ["/corporate", "기업 VIP 선물"],
            ["/partnership", "입점 문의"],
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            ["/support", "고객센터"],
            ["/legal/terms", "이용약관"],
            ["/legal/privacy", "개인정보 처리방침"],
            ["/legal/shipping", "배송 정책"],
            ["/legal/returns", "교환·반품"],
          ]}
        />
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-site space-y-3 py-8 text-[11px] leading-relaxed text-ivory/45">
          <p>
            상호 {b.companyName} · 대표 {b.representative} · 사업자등록번호 {b.businessNumber} · 통신판매업 신고 {b.mailOrderNumber}
          </p>
          <p>
            주소 {b.address} · 이메일 {b.email} · 전화 {b.phone}
          </p>
          {n.INTERMEDIARY && <p>{n.INTERMEDIARY.body}</p>}
          {n.YOUTH_NOTICE && <p>{n.YOUTH_NOTICE.body}</p>}
          <p>
            현재 SOOL RESERVE는 전통주 소개·큐레이션 서비스로 운영 중이며, 온라인 주문·결제 기능은 제공하지 않습니다.
            {settings.showDemoData && " DEMO 표시가 있는 양조장과 상품은 화면 구성을 위한 가상 데이터입니다."}
          </p>
          <p className="pt-2">© {new Date().getFullYear()} {settings.brandName}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="font-serif text-xs uppercase tracking-luxe text-gold">{title}</p>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-ivory/70 transition hover:text-ivory">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
