export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center border border-charcoal/40 bg-ivory/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-charcoal/80 ${className}`}>
      DEMO
    </span>
  );
}

export function ProductBadges({
  p,
}: {
  p: { isMaster: boolean; masterVerified: boolean; isLimited: boolean; limitedVerified: boolean; eligibility: string };
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {p.isMaster && p.masterVerified && (
        <span className="border border-gold px-1.5 py-0.5 text-[10px] tracking-wider text-gold-deep">명인주</span>
      )}
      {p.isLimited && p.limitedVerified && (
        <span className="border border-burgundy/60 px-1.5 py-0.5 text-[10px] tracking-wider text-burgundy">한정판</span>
      )}
      {p.eligibility === "INELIGIBLE" && (
        <span className="border border-charcoal/30 px-1.5 py-0.5 text-[10px] tracking-wider text-charcoal/60">소개 전용</span>
      )}
    </div>
  );
}
