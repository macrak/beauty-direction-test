import { won } from "@/lib/format";

// 단일 시리즈 가로 막대 — 서버 렌더링 HTML (JS 없이 표시). 값 라벨은 텍스트 색, 막대는 버건디 단색
export default function BarList({ data, unit = "won" }: { data: { label: string; value: number }[]; unit?: "won" | "count" }) {
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const fmt = (v: number) => (unit === "won" ? (Math.abs(v) >= 10000 ? `${Math.round(v / 10000).toLocaleString()}만` : won(v)) : v.toLocaleString());
  return (
    <ul className="mt-3 space-y-2">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-xs" title={`${d.label}: ${unit === "won" ? won(d.value) : d.value}`}>
          <span className="truncate text-right text-charcoal/80">{d.label}</span>
          <span className="flex items-center gap-2">
            <span
              className={`h-3.5 rounded-r ${d.value < 0 ? "bg-[#9B1C1C]" : "bg-burgundy"}`}
              style={{ width: `${Math.max(1, (Math.abs(d.value) / max) * 82)}%` }}
            />
            <span className="whitespace-nowrap tabular-nums text-charcoal/70">{fmt(d.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
