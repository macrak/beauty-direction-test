import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { ONBOARDING_FLOW, ONBOARDING_LABEL } from "@/lib/labels";

export const metadata: Metadata = { title: "입점 문의", description: "SOOL RESERVE 양조장 입점 신청." };

export default function PartnershipPage() {
  return (
    <div className="container-site pt-12 md:pt-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Partnership</p>
        <h1 className="h-display mt-4">함께 술의 격을 만들어 갈 양조장을 찾습니다.</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-charcoal/60">
          제출하신 정보는 입점 검토에만 사용됩니다. 제조면허, 통신판매 자격 등 서류는 담당자 연락 후 별도 보안 채널로 받습니다.
        </p>
      </header>
      <ol className="mt-12 flex flex-wrap gap-y-3 text-xs">
        {ONBOARDING_FLOW.map((s, i) => (
          <li key={s} className="flex items-center">
            <span className="border border-line bg-white/60 px-3 py-2">
              <span className="mr-1.5 font-serif text-gold-deep">{i + 1}</span>
              {ONBOARDING_LABEL[s]}
            </span>
            {i < ONBOARDING_FLOW.length - 1 && <span className="mx-2 text-charcoal/30">→</span>}
          </li>
        ))}
      </ol>
      <div className="mt-16 max-w-4xl">
        <InquiryForm
          type="PARTNERSHIP"
          submitLabel="입점 신청하기"
          privacyNote="수집 항목: 담당자명, 연락처, 이메일 / 목적: 입점 검토 및 연락 / 보관: 검토 종료 후 1년"
          fields={[
            { name: "company", label: "양조장 이름", required: true },
            { name: "businessNumber", label: "사업자등록번호", placeholder: "000-00-00000" },
            { name: "address", label: "사업장 소재지", full: true },
            { name: "name", label: "담당자", required: true },
            { name: "phone", label: "연락처", type: "tel", required: true },
            { name: "email", label: "이메일", type: "email", required: true },
            { name: "website", label: "홈페이지", type: "url", placeholder: "https://" },
            { name: "legalClass", label: "전통주 법적 분류", type: "select", options: ["민속주", "지역특산주", "해당 없음", "잘 모르겠음"] },
            { name: "mailOrderStatus", label: "통신판매 자격", type: "select", options: ["보유", "준비 중", "미보유", "잘 모르겠음"] },
            { name: "products", label: "대표 상품 (상품명 · 도수 · 용량 · 희망 판매가)", type: "textarea" },
            { name: "supplyTerms", label: "공급 조건", type: "textarea", placeholder: "월 공급 가능 수량, 정산 희망 조건 등" },
            { name: "shippingPolicy", label: "배송 및 반품 정책", type: "textarea", placeholder: "냉장 여부, 출고 요일, 택배사, 반품 기준" },
            { name: "message", label: "브랜드 소개", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}
