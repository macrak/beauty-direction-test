// FormData 파싱 헬퍼 — 빈 문자열은 null, 숫자는 범위 검증
export function str(fd: FormData, k: string, max = 5000): string | null {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export function reqStr(fd: FormData, k: string, label: string, max = 500): string {
  const v = str(fd, k, max);
  if (!v) throw new FormError(`${label}을(를) 입력해 주세요.`);
  return v;
}

export function int(fd: FormData, k: string, opts: { min?: number; max?: number; label?: string } = {}): number | null {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new FormError(`${opts.label ?? k}: 정수를 입력해 주세요.`);
  if (opts.min !== undefined && n < opts.min) throw new FormError(`${opts.label ?? k}: ${opts.min} 이상이어야 합니다.`);
  if (opts.max !== undefined && n > opts.max) throw new FormError(`${opts.label ?? k}: ${opts.max} 이하여야 합니다.`);
  return n;
}

export function num(fd: FormData, k: string, opts: { min?: number; max?: number; label?: string } = {}): number | null {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(n)) throw new FormError(`${opts.label ?? k}: 숫자를 입력해 주세요.`);
  if (opts.min !== undefined && n < opts.min) throw new FormError(`${opts.label ?? k}: ${opts.min} 이상이어야 합니다.`);
  if (opts.max !== undefined && n > opts.max) throw new FormError(`${opts.label ?? k}: ${opts.max} 이하여야 합니다.`);
  return n;
}

export function bool(fd: FormData, k: string): boolean {
  return fd.get(k) === "on" || fd.get(k) === "true";
}

export function triBool(fd: FormData, k: string): boolean | null {
  const v = fd.get(k);
  return v === "true" ? true : v === "false" ? false : null;
}

export function list(fd: FormData, k: string): string[] {
  return fd
    .getAll(k)
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function oneOf<T extends string>(fd: FormData, k: string, values: readonly T[], fallback: T): T {
  const v = fd.get(k);
  return values.includes(v as T) ? (v as T) : fallback;
}

export class FormError extends Error {}

export interface ActionState {
  ok: boolean;
  message: string;
  redirectTo?: string; // 저장 후 이동 (클라이언트에서 전체 새로고침으로 최신 데이터 표시)
}
