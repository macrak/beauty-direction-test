import type { Metadata } from "next";
import CollectionView from "@/components/CollectionView";

export const metadata: Metadata = { title: "리미티드 에디션", description: "한정 생산된 희소한 프리미엄 전통주." };

export default function LimitedPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <CollectionView
      searchParams={searchParams}
      base="/limited"
      special="limited"
      eyebrow="Limited Edition"
      title="쉽게 만날 수 없는 특별한 한 병."
      desc="한정 생산 여부와 생산 수량이 검증된 제품만 소개합니다."
    />
  );
}
