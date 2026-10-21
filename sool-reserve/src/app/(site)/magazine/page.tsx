import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "매거진" };

export default function MagazinePage() {
  return (
    <ComingSoon
      eyebrow="Magazine"
      title="술의 격, 매거진"
      desc="대한민국 명주 이야기, 장인 인터뷰, 선물 가이드, 페어링, 지역 양조장 탐방 콘텐츠를 준비하고 있습니다."
    />
  );
}
