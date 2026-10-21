import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductCard";
import { getPublicProducts, getSlotProducts } from "@/lib/catalog";
import { GIFT_PURPOSES } from "@/lib/labels";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "프리미엄 기프트", description: "부모님, VIP, 기업, 명절 선물을 위한 프리미엄 전통주 큐레이션." };

export default async function GiftPage({ searchParams }: { searchParams: { purpose?: string } }) {
  const settings = await getSettings();
  const purpose = GIFT_PURPOSES.find((g) => g.key === searchParams.purpose)?.key;
  const list = purpose
    ? await getPublicProducts({ giftPurposes: { has: purpose } }, settings)
    : await getSlotProducts("GIFT", settings).then(async (s) => (s.length ? s : getPublicProducts({ NOT: { giftPurposes: { isEmpty: true } } }, settings)));
  return (
    <>
      <section className="bg-charcoal pb-20 pt-16 text-ivory md:pb-28 md:pt-24">
        <div className="container-site">
          <p className="font-serif text-xs uppercase tracking-luxe text-gold">Premium Gift</p>
          <h1 className="h-display mt-4 max-w-3xl">마음을 전하는 가장 품격 있는 방법.</h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/60">
            전용 선물 상자, 한지·보자기 포장, 메시지 카드까지. 받는 분과 자리에 맞춰 고른 전통주 선물 컬렉션입니다.
          </p>
          <div className="mt-12 flex flex-wrap gap-2">
            <Link href="/gift" className={`border px-4 py-2 text-sm transition ${!purpose ? "border-gold bg-gold text-charcoal" : "border-ivory/25 hover:border-ivory"}`}>
              추천 선물
            </Link>
            {GIFT_PURPOSES.map((g) => (
              <Link
                key={g.key}
                href={`/gift?purpose=${encodeURIComponent(g.key)}`}
                className={`border px-4 py-2 text-sm transition ${purpose === g.key ? "border-gold bg-gold text-charcoal" : "border-ivory/25 hover:border-ivory"}`}
              >
                {g.key}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site pt-16 md:pt-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="h-section">{purpose ?? "SOOL RESERVE 추천 선물"}</h2>
          <span className="text-xs text-charcoal/50">{list.length}종</span>
        </div>
        {list.length ? <ProductGrid products={list} /> : <p className="py-20 text-center text-sm text-charcoal/50">해당 목적의 선물이 준비 중입니다.</p>}
      </section>

      <section className="container-site mt-24 grid gap-px border border-line bg-line md:mt-32 md:grid-cols-4">
        {[
          ["프리미엄 선물 상자", "상품별 전용 상자 또는 오동나무 상자"],
          ["한지 · 보자기 포장", "전통 소재로 마감한 선물 포장"],
          ["메시지 카드", "손글씨 느낌의 인쇄 카드 동봉"],
          ["희망 배송일", "판매 기능 활성화 후 제공 예정"],
        ].map(([t, d]) => (
          <div key={t} className="bg-ivory p-8">
            <h3 className="font-kserif text-lg">{t}</h3>
            <p className="mt-2 text-sm text-charcoal/60">{d}</p>
          </div>
        ))}
      </section>
      <p className="container-site mt-6 text-xs leading-relaxed text-charcoal/50">
        선물 배송은 판매자 자격, 수령인 연령 확인, 배송 관련 법적 조건이 확인된 이후 제공됩니다. 대량·기업 선물은{" "}
        <Link href="/corporate" className="underline underline-offset-4">
          기업 VIP 상담
        </Link>
        을 이용해 주세요.
      </p>
    </>
  );
}
