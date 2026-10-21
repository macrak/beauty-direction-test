// 맛 프로필 오각형 레이더 — 서버에서 SVG로 렌더링 (JS 없이 표시, 빠른 첫 화면)
// 값이 null인 축은 '해당 없음'으로 중심(0)에 두고 라벨에 표시 — 임의 점수 생성 금지
export interface TastePoint {
  axis: string;
  value: number | null;
}

const SIZE = 360;
const C = SIZE / 2;
const R = 118;

function pt(i: number, n: number, r: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
}

export default function TasteRadar({ data }: { data: TastePoint[] }) {
  const n = data.length;
  const ring = (lv: number) => data.map((_, i) => pt(i, n, (R * lv) / 5).join(",")).join(" ");
  const shape = data.map((d, i) => pt(i, n, (R * (d.value ?? 0)) / 5));
  return (
    <svg viewBox={`-60 -6 ${SIZE + 120} ${SIZE + 12}`} className="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label={`맛 프로필: ${data.map((d) => `${d.axis} ${d.value ?? "해당 없음"}`).join(", ")}`}>
      {[1, 2, 3, 4, 5].map((lv) => (
        <polygon key={lv} points={ring(lv)} fill="none" stroke="#202020" strokeOpacity={lv === 5 ? 0.18 : 0.08} />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, n, R);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#202020" strokeOpacity="0.08" />;
      })}
      <polygon points={shape.map((p) => p.join(",")).join(" ")} fill="#4C202B" fillOpacity="0.14" stroke="#4C202B" strokeWidth="2" strokeLinejoin="round" />
      {shape.map(([x, y], i) =>
        data[i].value === null ? null : (
          <circle key={i} cx={x} cy={y} r="4.5" fill="#4C202B">
            <title>{`${data[i].axis} ${data[i].value} / 5`}</title>
          </circle>
        ),
      )}
      {data.map((d, i) => {
        const [x, y] = pt(i, n, R + 28);
        const anchor = Math.abs(x - C) < 4 ? "middle" : x > C ? "start" : "end";
        return (
          <text key={d.axis} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="13" fill="#202020">
            {d.axis}
            {d.value === null && (
              <tspan fill="#20202080" fontSize="11">
                {" "}
                (해당 없음)
              </tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}
