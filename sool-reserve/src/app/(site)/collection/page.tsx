import type { Metadata } from "next";
import CollectionView from "@/components/CollectionView";

export const metadata: Metadata = { title: "전체 컬렉션", description: "SOOL RESERVE가 엄선한 프리미엄 전통주 전체 컬렉션." };

export default function CollectionPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <CollectionView
      searchParams={searchParams}
      base="/collection"
      eyebrow="The Collection"
      title="전체 컬렉션"
      desc="주종과 맛, 상황과 가격으로 나에게 맞는 한 병을 찾아보세요."
    />
  );
}
