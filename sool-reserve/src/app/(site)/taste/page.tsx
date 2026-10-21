import type { Metadata } from "next";
import TasteQuiz from "@/components/TasteQuiz";
import { getSettings } from "@/lib/settings";
import { priceDisplay } from "@/lib/commerce";

export const metadata: Metadata = { title: "취향별 추천", description: "다섯 가지 질문으로 찾는 나의 전통주." };

export default async function TastePage() {
  const s = await getSettings();
  return (
    <div className="container-site pt-12 md:pt-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Taste Discovery</p>
        <h1 className="h-display mt-4">당신의 취향에 맞는 명주.</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-charcoal/60">
          다섯 가지 질문에 답해 주세요. 실제 등록된 맛 프로필과 상품 정보만으로 추천합니다.
        </p>
      </header>
      <TasteQuiz showBudget={priceDisplay(s.salesMode, s.showReferencePrice) !== "HIDDEN"} tiers={s.priceTiers} />
    </div>
  );
}
