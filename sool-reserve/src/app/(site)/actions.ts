"use server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export interface FormState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

const TYPES = ["PARTNERSHIP", "CORPORATE", "CUSTOMER", "NEWSLETTER"] as const;

const base = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(60),
  email: z.string().trim().email("올바른 이메일을 입력해 주세요.").max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "연락처 형식을 확인해 주세요.")
    .optional()
    .or(z.literal("")),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().max(4000).optional(),
  consentPrivacy: z.literal("on", { errorMap: () => ({ message: "개인정보 수집·이용에 동의해 주세요." }) }),
  consentMarketing: z.string().optional(),
});

const RESERVED = new Set(["name", "email", "phone", "company", "message", "consentPrivacy", "consentMarketing", "type"]);

export async function submitInquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  const type = String(fd.get("type"));
  if (!TYPES.includes(type as (typeof TYPES)[number])) return { ok: false, message: "잘못된 요청입니다." };
  const raw = Object.fromEntries(Array.from(fd.entries()).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const parsed = base.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
    return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  }
  const d = parsed.data;
  if (!d.email && !d.phone) return { ok: false, message: "이메일 또는 연락처 중 하나는 필요합니다.", errors: { email: "이메일 또는 연락처를 입력해 주세요." } };
  const payload = Object.fromEntries(Object.entries(raw).filter(([k, v]) => !RESERVED.has(k) && !k.startsWith("$") && v).map(([k, v]) => [k, v.slice(0, 1000)]));
  await prisma.inquiry.create({
    data: {
      type: type as (typeof TYPES)[number],
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      company: d.company || null,
      message: d.message || null,
      payload,
      consentPrivacy: true,
      consentMarketing: d.consentMarketing === "on",
    },
  });
  return { ok: true, message: "접수되었습니다. 담당자가 확인 후 연락드리겠습니다." };
}
