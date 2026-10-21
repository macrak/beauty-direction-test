export function won(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function pct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "–";
  return `${n.toFixed(digits)}%`;
}

export function dateKo(d: Date | string | null | undefined): string {
  if (!d) return "–";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
