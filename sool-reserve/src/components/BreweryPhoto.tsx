import BreweryVisual from "./BreweryVisual";

// 양조장 대표 사진 — 실사진이 있으면 사진+출처, 없으면 테마 일러스트
export default function BreweryPhoto({
  brewery,
  seed = 0,
  className = "",
  ratio = "wide",
}: {
  brewery: { name: string; imageUrl: string | null; imageCredit?: string | null; visualTheme: string | null };
  seed?: number;
  className?: string;
  ratio?: "wide" | "tall";
}) {
  const aspect = ratio === "tall" ? "aspect-[4/5]" : "aspect-[10/7]";
  if (brewery.imageUrl) {
    return (
      <figure className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brewery.imageUrl} alt={`${brewery.name} 양조장`} className={`${aspect} w-full object-cover`} loading="lazy" />
        {brewery.imageCredit && <figcaption className="mt-2 text-[10px] text-charcoal/40">사진 {brewery.imageCredit}</figcaption>}
      </figure>
    );
  }
  return (
    <div className={`${aspect} overflow-hidden ${className}`}>
      <BreweryVisual theme={brewery.visualTheme} seed={seed} ratio={ratio} className="h-full w-full" />
    </div>
  );
}
