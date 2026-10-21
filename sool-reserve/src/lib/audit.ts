import { prisma } from "./db";

export async function audit(
  user: { id: string; email: string } | null,
  action: string,
  entity: string,
  entityId: string | null,
  changes?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: { userId: user?.id, userEmail: user?.email, action, entity, entityId, changes: changes as never },
  });
}

// 변경 전/후 값이 다른 필드만 추출
export function diff(before: Record<string, unknown>, after: Record<string, unknown>, keys: string[]) {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of keys) {
    const a = before[k];
    const b = after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = { from: a ?? null, to: b ?? null };
  }
  return out;
}
