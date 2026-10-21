import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = { title: "기업 VIP 선물", description: "기업 고객을 위한 프리미엄 전통주 선물 상담." };

export default function CorporatePage() {
  return (
    <>
      <section className="bg-burgundy pb-20 pt-16 text-ivory md:pb-28 md:pt-24">
        <div className="container-site grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-serif text-xs uppercase tracking-luxe text-gold">Corporate & VIP</p>
            <h1 className="h-display mt-4">브랜드의 태도를 담은 선물.</h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/65">
              예산과 수량, 받는 분에 맞춰 SOOL RESERVE 큐레이터가 구성을 제안해 드립니다. 명절 대량 주문과 맞춤 패키지도 상담 가능합니다.
            </p>
          </div>
          <ol className="grid gap-px self-end bg-ivory/15 sm:grid-cols-2">
            {[
              ["01", "상담 신청", "회사·예산·수량·희망일"],
              ["02", "구성 제안", "예산별 추천 상품과 패키지"],
              ["03", "샘플 · 확정", "포장·카드 문구 확정"],
              ["04", "판매자 연결", "적격 판매자가 거래·배송 담당"],
            ].map(([n, t, d]) => (
              <li key={n} className="bg-burgundy p-6">
                <span className="font-serif text-gold">{n}</span>
                <p className="mt-2 font-kserif text-lg">{t}</p>
                <p className="mt-1 text-xs text-ivory/55">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container-site mt-20 grid gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="h-section">상담 신청</h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/60">
            접수된 내용은 상담 목적으로만 사용됩니다. 실제 주류 거래는 통신판매 자격을 갖춘 판매자(양조장)가 담당하며, SOOL RESERVE는 상담과 큐레이션을 제공합니다.
          </p>
        </div>
        <div className="md:col-span-8">
          <InquiryForm
            type="CORPORATE"
            submitLabel="상담 신청하기"
            privacyNote="수집 항목: 이름, 회사명, 연락처, 이메일 / 목적: 기업 선물 상담 / 보관: 상담 종료 후 1년"
            fields={[
              { name: "company", label: "회사명", required: true },
              { name: "name", label: "담당자명", required: true },
              { name: "phone", label: "연락처", type: "tel", required: true },
              { name: "email", label: "이메일", type: "email" },
              { name: "budgetPerUnit", label: "1인당 예산", type: "select", options: ["10만 원대", "20만 원대", "30만 원대", "50만 원 이상", "미정"], required: true },
              { name: "quantity", label: "예상 수량", type: "number", placeholder: "예: 50" },
              { name: "desiredDate", label: "배송 희망일", type: "date" },
              { name: "occasion", label: "목적", type: "select", options: ["명절 선물", "VIP 감사 선물", "임직원 선물", "행사·기념품", "기타"] },
              { name: "message", label: "요청 사항", type: "textarea", placeholder: "맞춤 패키지, 로고 각인, 카드 문구 등" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
