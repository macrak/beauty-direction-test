import type { Metadata } from "next";
import CollectionView from "@/components/CollectionView";

export const metadata: Metadata = { title: "명인주 컬렉션", description: "장인과 명인이 빚은 특별한 전통주." };

export default function MastersPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <CollectionView
      searchParams={searchParams}
      base="/masters"
      special="master"
      eyebrow="Master's Collection"
      title="명인주 컬렉션"
      desc="평생을 한 가지 술에 바친 장인과 명인의 술. 명인·장인 여부가 확인된 상품만 소개합니다."
    />
  );
}
