// 양조장 사진이 없을 때의 추상 비주얼 (지붕선·옹기·누룩 모티프)
export default function BreweryVisual({ seed }: { seed: number }) {
  const palettes = [
    ["#4C202B", "#B69A68"],
    ["#202020", "#B69A68"],
    ["#5a4a3a", "#ECE5D8"],
  ];
  const [a, b] = palettes[seed % palettes.length];
  return (
    <svg viewBox="0 0 600 420" className="h-auto w-full bg-beige" role="img" aria-label="양조장 분위기 일러스트">
      <rect width="600" height="420" fill="#ECE5D8" />
      <circle cx="460" cy="120" r="56" fill={b} opacity="0.35" />
      <path d="M40 200 Q300 120 560 200 L560 214 Q300 138 40 214 Z" fill={a} />
      <rect x="110" y="214" width="380" height="8" fill={a} opacity="0.8" />
      {[150, 230, 310, 390].map((x) => (
        <rect key={x} x={x} y="222" width="6" height="110" fill={a} opacity="0.7" />
      ))}
      {[180, 300, 420].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="360" rx={38 + i * 4} ry="10" fill="#202020" opacity="0.08" />
          <path d={`M${x - 34} 300 Q${x - 44} 340 ${x - 26} 358 L${x + 26} 358 Q${x + 44} 340 ${x + 34} 300 Q${x} 288 ${x - 34} 300 Z`} fill="#5a3a2a" opacity={0.75 - i * 0.12} />
          <ellipse cx={x} cy="300" rx="34" ry="6" fill="#3a2418" />
        </g>
      ))}
      <rect x="0" y="372" width="600" height="48" fill="#202020" opacity="0.06" />
    </svg>
  );
}
