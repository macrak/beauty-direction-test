import BreweryVisual from "./BreweryVisual";

const FALLBACK: Record<string, string> = {
  STORY: "hanok",
  INTERVIEW: "still",
  GIFT_GUIDE: "courtyard",
  PAIRING: "field",
  GUIDE: "lake",
  TRAVEL: "mountain",
};

export default function ArticleCover({
  a,
  className = "",
  ratio = "wide",
}: {
  a: { title: string; category: string; coverImageUrl: string | null; coverImageAlt: string | null; coverTheme: string | null };
  className?: string;
  ratio?: "wide" | "tall";
}) {
  const aspect = ratio === "tall" ? "aspect-[4/5]" : "aspect-[10/7]";
  if (a.coverImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={a.coverImageUrl} alt={a.coverImageAlt ?? a.title} className={`${aspect} w-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div className={`${aspect} overflow-hidden ${className}`}>
      <BreweryVisual theme={a.coverTheme ?? FALLBACK[a.category]} ratio={ratio} className="h-full w-full" />
    </div>
  );
}
