import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = { title: "브랜드 스토리", description: "SOOL RESERVE의 철학과 선별 기준." };

const CRITERIA = [
  ["전통주 온라인 판매 적격 여부", "법적 분류와 통신판매 가능 여부를 먼저 확인합니다."],
  ["양조장 인지도와 신뢰도", "오랜 기간 일관된 품질을 지켜 온 곳인지 봅니다."],
  ["브랜드 스토리와 장인정신", "누가, 왜, 어떻게 빚는지에 대한 이야기."],
  ["술의 품질과 완성도", "원료와 공정, 그리고 잔 안의 결과."],
  ["희소성과 한정 생산", "검증된 생산 수량만 표기합니다."],
  ["병과 패키지 디자인", "선물로 건넸을 때의 첫인상."],
  ["선물로서의 가치", "받는 분이 기억할 만한 한 병인지."],
  ["지속 가능한 거래 구조", "양조장과 플랫폼이 함께 성장할 수 있는지."],
  ["안정적인 공급", "약속한 술을 약속한 때에."],
  ["배송과 보관", "생주의 냉장 유통까지 책임질 수 있는지."],
];

export default function StoryPage() {
  return (
    <>
      <section className="hero-light">
        <div className="container-site py-24 text-center md:py-36">
          <p className="eyebrow">Our Philosophy</p>
          <h1 className="mx-auto mt-6 max-w-3xl font-kserif text-3xl font-light leading-relaxed md:text-5xl md:leading-snug">
            좋은 술을 넘어,
            <br />
            가치 있는 술을 선택합니다.
          </h1>
          <div className="mx-auto my-10 h-px w-12 bg-gold" />
          <p className="mx-auto max-w-2xl text-[15px] leading-loose text-charcoal/65">
            대한민국에는 오랜 역사와 뛰어난 기술을 지닌 양조장이 많습니다. 그러나 그 술들을 한자리에서 비교하고, 철학을 이해하고,
            귀한 선물로 고를 수 있는 곳은 드뭅니다. SOOL RESERVE는 그 자리를 만들기 위해 시작했습니다.
          </p>
        </div>
      </section>
      <section className="container-site mt-20 grid gap-12 md:mt-28 md:grid-cols-3">
        {[
          ["Curation", "많이 파는 대신, 오래 남을 술을 고릅니다.", "가격이 높다는 이유만으로 입점하지 않습니다. 열 가지 기준을 통과한 술만 소개합니다."],
          ["Story", "술 뒤에 있는 사람과 땅을 전합니다.", "물과 쌀, 누룩, 숙성. 한 병이 만들어지기까지의 시간을 기록합니다."],
          ["Trust", "확인된 정보만 말합니다.", "맛 평가의 출처, 한정 수량, 수상 내역은 검증된 경우에만 표시합니다."],
        ].map(([en, t, d]) => (
          <Reveal key={en}>
            <p className="font-serif text-sm italic text-gold-deep">{en}</p>
            <h2 className="mt-3 font-kserif text-xl leading-snug">{t}</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/60">{d}</p>
          </Reveal>
        ))}
      </section>
      <section className="container-site mt-24 md:mt-32">
        <p className="eyebrow">Selection Criteria</p>
        <h2 className="h-section mt-3">열 가지 선별 기준</h2>
        <ol className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
          {CRITERIA.map(([t, d], i) => (
            <li key={t} className="flex gap-6 bg-ivory p-6 md:p-8">
              <span className="font-serif text-2xl text-gold">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-kserif text-[17px]">{t}</h3>
                <p className="mt-1.5 text-sm text-charcoal/60">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="container-site mt-24 grid gap-12 md:mt-32 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow">Monthly Reserve</p>
          <h2 className="h-section mt-3">이달의 프리미엄 전통주</h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/60">
            매월 큐레이터가 고른 전통주 이야기와 신상품 소식을 보내드립니다. 정보 구독 서비스이며 주류 정기배송이 아닙니다.
          </p>
        </div>
        <div className="md:col-span-8">
          <InquiryForm
            type="NEWSLETTER"
            submitLabel="정보 구독하기"
            marketingOption
            privacyNote="수집 항목: 이름, 이메일 / 목적: 큐레이션 콘텐츠 발송 / 보관: 구독 해지 시까지"
            fields={[
              { name: "name", label: "이름", required: true },
              { name: "email", label: "이메일", type: "email", required: true },
            ]}
          />
        </div>
      </section>
      <p className="container-site mt-16 text-center">
        <Link href="/collection" className="btn-primary">
          컬렉션 살펴보기
        </Link>
      </p>
    </>
  );
}
