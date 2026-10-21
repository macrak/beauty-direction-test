// 실제 상품 사진이 없을 때 사용하는 주종별 병 일러스트 (실존 상품을 연상시키지 않는 추상 형태)
type Shape = "DISTILLED_SOJU" | "YAKJU" | "CHEONGJU" | "TAKJU" | "FRUIT_WINE" | "OTHER";

const LIQUID: Record<Shape, string> = {
  DISTILLED_SOJU: "#E9E4D8",
  YAKJU: "#D8B776",
  CHEONGJU: "#EDE6CF",
  TAKJU: "#F2EEE4",
  FRUIT_WINE: "#B4566A",
  OTHER: "#8E3B3B",
};

const GLASS: Record<Shape, string> = {
  DISTILLED_SOJU: "#F4F1EA",
  YAKJU: "#3B2A1E",
  CHEONGJU: "#2F3A33",
  TAKJU: "#FBFAF6",
  FRUIT_WINE: "#2C1D22",
  OTHER: "#2A2423",
};

// 주종별 병 실루엣 (viewBox 0 0 200 400)
const PATH: Record<Shape, string> = {
  DISTILLED_SOJU:
    "M88 30h24v70c0 10 26 22 26 52v206c0 8-6 14-14 14H76c-8 0-14-6-14-14V152c0-30 26-42 26-52z",
  YAKJU: "M90 34h20v58c0 14 34 26 34 66v198c0 8-6 14-14 14H70c-8 0-14-6-14-14V158c0-40 34-52 34-66z",
  CHEONGJU: "M91 30h18v76c0 8 30 18 30 48v204c0 8-6 14-14 14H75c-8 0-14-6-14-14V154c0-30 30-40 30-48z",
  TAKJU: "M86 50h28v40c0 14 40 24 40 60v208c0 8-6 14-14 14H60c-8 0-14-6-14-14V150c0-36 40-46 40-60z",
  FRUIT_WINE: "M89 28h22v84c0 18 34 30 34 62v184c0 8-6 14-14 14H69c-8 0-14-6-14-14V174c0-32 34-44 34-62z",
  OTHER: "M84 40h32v44c0 10 50 30 50 80v190c0 8-6 14-14 14H48c-8 0-14-6-14-14V164c0-50 50-70 50-80z",
};

export default function BottleArt({
  type,
  label,
  className = "",
}: {
  type: Shape;
  label?: string;
  className?: string;
}) {
  const id = `g-${type}`;
  const clear = type === "DISTILLED_SOJU" || type === "TAKJU";
  return (
    <svg viewBox="0 0 200 400" className={className} role="img" aria-label={label ? `${label} 병 일러스트` : "전통주 병 일러스트"}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor={GLASS[type]} stopOpacity={clear ? 0.55 : 0.95} />
          <stop offset="0.45" stopColor={GLASS[type]} stopOpacity={clear ? 0.25 : 0.75} />
          <stop offset="1" stopColor={GLASS[type]} stopOpacity={clear ? 0.6 : 1} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={PATH[type]} />
        </clipPath>
      </defs>
      <ellipse cx="100" cy="378" rx="62" ry="7" fill="#202020" opacity="0.12" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="200" height="400" fill={`url(#${id}-glass)`} />
        <rect x="0" y="175" width="200" height="225" fill={LIQUID[type]} opacity={clear ? 0.55 : 0.35} />
        <rect x="70" y="40" width="10" height="330" fill={`url(#${id}-shine)`} opacity="0.7" />
      </g>
      <path d={PATH[type]} fill="none" stroke="#202020" strokeOpacity="0.25" strokeWidth="1" />
      {/* 마개 */}
      <rect x={type === "TAKJU" ? 84 : 87} y={type === "TAKJU" ? 36 : 18} width={type === "TAKJU" ? 32 : 26} height="22" rx="2" fill="#4C202B" />
      <rect x={type === "TAKJU" ? 84 : 87} y={type === "TAKJU" ? 54 : 36} width={type === "TAKJU" ? 32 : 26} height="3" fill="#B69A68" />
      {/* 라벨 */}
      <rect x="66" y="222" width="68" height="96" fill="#F7F4EE" opacity="0.94" />
      <rect x="70" y="226" width="60" height="88" fill="none" stroke="#B69A68" strokeWidth="0.8" />
      <text x="100" y="262" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="9" letterSpacing="2" fill="#202020">
        SOOL
      </text>
      <line x1="88" x2="112" y1="272" y2="272" stroke="#B69A68" strokeWidth="0.8" />
      <text x="100" y="290" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="7" letterSpacing="1.6" fill="#4C202B">
        RESERVE
      </text>
    </svg>
  );
}
