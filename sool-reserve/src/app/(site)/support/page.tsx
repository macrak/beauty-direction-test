import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { getCurrentNotices } from "@/lib/legal";

export const metadata: Metadata = { title: "고객센터", description: "배송, 반품, 문의 안내." };

export default async function SupportPage() {
  const n = await getCurrentNotices(["SHIPPING_POLICY", "RETURN_POLICY"]);
  const faqs = [
    ["지금 바로 주문할 수 있나요?", "현재 SOOL RESERVE는 전통주 소개·큐레이션 서비스로 운영 중입니다. 판매자 자격과 법적 요건 확인이 끝나면 주문 기능을 열 예정입니다."],
    ["표시된 가격은 무엇인가요?", "판매자가 제공한 참고 소비자가입니다. 실제 판매가는 판매 개시 시점에 달라질 수 있습니다."],
    ["맛 그래프는 누가 평가하나요?", "제조사 제공 정보 또는 SOOL RESERVE 자체 테이스팅이며, 상품 상세에 출처를 표시합니다. 평가가 없는 상품은 그래프를 표시하지 않습니다."],
    ["기업 선물 대량 구매가 가능한가요?", "기업 VIP 상담을 통해 구성 제안을 받으실 수 있으며, 실제 거래는 적격 판매자가 담당합니다."],
  ];
  return (
    <div className="container-site pt-12 md:pt-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Customer Care</p>
        <h1 className="h-display mt-4">고객센터</h1>
      </header>
      <section className="mt-14 grid gap-12 md:grid-cols-2">
        {[n.SHIPPING_POLICY, n.RETURN_POLICY].map(
          (x) =>
            x && (
              <div key={x.id} className="border-t border-charcoal pt-6">
                <h2 className="font-kserif text-xl">{x.title}</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-loose text-charcoal/70">{x.body}</p>
              </div>
            ),
        )}
      </section>
      <section className="mt-20">
        <h2 className="h-section">자주 묻는 질문</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-kserif text-[17px]">
                {q}
                <span className="text-charcoal/40 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/65">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-20 max-w-3xl">
        <h2 className="h-section">1:1 문의</h2>
        <div className="mt-8">
          <InquiryForm
            type="CUSTOMER"
            privacyNote="수집 항목: 이름, 이메일, 연락처 / 목적: 문의 응대 / 보관: 처리 완료 후 1년"
            fields={[
              { name: "name", label: "이름", required: true },
              { name: "email", label: "이메일", type: "email", required: true },
              { name: "category", label: "문의 유형", type: "select", options: ["상품 문의", "선물 문의", "배송 문의", "기타"] },
              { name: "phone", label: "연락처", type: "tel" },
              { name: "message", label: "문의 내용", type: "textarea", required: true },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
