import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { Pill } from "./AdminShell";

const TONE: Record<string, "neutral" | "good" | "warn" | "bad" | "brand"> = {
  PENDING: "warn",
  PAID: "brand",
  PREPARING: "warn",
  SHIPPED: "brand",
  DELIVERED: "good",
  CANCELLED: "bad",
  REFUNDED: "bad",
};

export function StatusPill({ s }: { s: keyof typeof ORDER_STATUS_LABEL }) {
  return <Pill tone={TONE[s]}>{ORDER_STATUS_LABEL[s]}</Pill>;
}

const FLOW = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;
export function Stepper({ s }: { s: string }) {
  const idx = FLOW.indexOf(s as (typeof FLOW)[number]);
  if (idx < 0) return <span className="text-xs text-[#9B1C1C]">{ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}</span>;
  return (
    <ol className="flex items-center gap-1 text-[11px]">
      {FLOW.map((f, i) => (
        <li key={f} className="flex items-center gap-1">
          <span className={`rounded px-1.5 py-0.5 ${i <= idx ? "bg-burgundy text-white" : "bg-[#EEE9E0] text-charcoal/50"}`}>{ORDER_STATUS_LABEL[f]}</span>
          {i < FLOW.length - 1 && <span className="text-charcoal/30">›</span>}
        </li>
      ))}
    </ol>
  );
}
