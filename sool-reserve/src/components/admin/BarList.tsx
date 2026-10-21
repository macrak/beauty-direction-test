"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// 단일 시리즈 가로 막대 — 순위/분포용. 값 라벨은 텍스트 색, 막대는 버건디 단색
export default function BarList({
  data,
  unit = "won",
  height,
}: {
  data: { label: string; value: number }[];
  unit?: "won" | "count";
  height?: number;
}) {
  const fmt = (v: number) => (unit === "won" ? (Math.abs(v) >= 10000 ? `${Math.round(v / 10000).toLocaleString()}만` : v.toLocaleString()) : v.toLocaleString());
  const h = height ?? Math.max(160, data.length * 34 + 30);
  return (
    <div style={{ height: h }} className="w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="#202020" strokeOpacity={0.06} />
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11, fill: "#20202099" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={118} tick={{ fontSize: 12, fill: "#202020" }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "#4C202B", fillOpacity: 0.05 }}
            contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #E2DACB" }}
            formatter={(v: number) => [unit === "won" ? `${v.toLocaleString()}원` : `${v.toLocaleString()}`, "값"]}
          />
          <Bar isAnimationActive={false} dataKey="value" fill="#4C202B" radius={[0, 4, 4, 0]} maxBarSize={18} label={{ position: "right", fontSize: 11, fill: "#202020", formatter: fmt }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
