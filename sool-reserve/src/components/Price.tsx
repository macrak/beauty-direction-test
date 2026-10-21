import { won } from "@/lib/format";

export default function Price({
  price,
  mode,
  eligibility,
  size = "sm",
}: {
  price: number | null;
  mode: "LIVE" | "REFERENCE" | "HIDDEN";
  eligibility?: string;
  size?: "sm" | "lg";
}) {
  if (eligibility === "INELIGIBLE") return <p className="text-xs text-charcoal/50">온라인 판매 대상 아님</p>;
  if (mode === "HIDDEN" || price === null) return null;
  return (
    <p className={size === "lg" ? "flex items-baseline gap-2" : "flex items-baseline gap-1.5"}>
      {mode === "REFERENCE" && <span className="text-[10px] tracking-wider text-charcoal/50">참고 소비자가</span>}
      <span className={size === "lg" ? "font-serif text-2xl" : "font-serif text-[15px]"}>{won(price)}</span>
    </p>
  );
}
