"use client";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export interface TastePoint {
  axis: string;
  value: number | null;
}

// 값이 null인 축은 '해당 없음'으로 0에 두고 축 라벨에 표시 — 임의 점수 생성 금지
export default function TasteRadar({ data }: { data: TastePoint[] }) {
  const chart = data.map((d) => ({ axis: d.value === null ? `${d.axis} (해당 없음)` : d.axis, value: d.value ?? 0, raw: d.value }));
  return (
    <div className="h-[300px] w-full md:h-[340px]">
      <ResponsiveContainer>
        <RadarChart data={chart} outerRadius="72%">
          <PolarGrid stroke="#202020" strokeOpacity={0.12} />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "#202020", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#4C202B" strokeWidth={2} fill="#4C202B" fillOpacity={0.14} dot={{ r: 4, fill: "#4C202B", strokeWidth: 0 }} isAnimationActive />
          <Tooltip
            cursor={false}
            contentStyle={{ background: "#F7F4EE", border: "1px solid #E2DACB", borderRadius: 2, fontSize: 12 }}
            formatter={(_v, _n, item) => {
              const raw = (item.payload as { raw: number | null }).raw;
              return [raw === null ? "해당 없음" : `${raw} / 5`, "점수"];
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
