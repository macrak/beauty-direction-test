"use client";
import { useFormState, useFormStatus } from "react-dom";
import { submitInquiry, type FormState } from "@/app/(site)/actions";

export interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select" | "url";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  full?: boolean;
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full md:w-auto" disabled={pending}>
      {pending ? "접수 중…" : label}
    </button>
  );
}

export default function InquiryForm({
  type,
  fields,
  submitLabel = "문의 접수",
  privacyNote,
  marketingOption = false,
}: {
  type: "PARTNERSHIP" | "CORPORATE" | "CUSTOMER" | "NEWSLETTER";
  fields: Field[];
  submitLabel?: string;
  privacyNote: string;
  marketingOption?: boolean;
}) {
  const [state, action] = useFormState<FormState, FormData>(submitInquiry, { ok: false, message: "" });
  if (state.ok) {
    return (
      <div className="border border-line bg-white/60 p-10 text-center">
        <p className="font-kserif text-xl">감사합니다.</p>
        <p className="mt-3 text-sm text-charcoal/65">{state.message}</p>
      </div>
    );
  }
  const input = "w-full border-b border-charcoal/25 bg-transparent py-3 text-[15px] outline-none transition focus:border-charcoal placeholder:text-charcoal/30";
  return (
    <form action={action} className="space-y-8" noValidate>
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className={f.full || f.type === "textarea" ? "md:col-span-2" : ""}>
            <span className="text-xs tracking-wide text-charcoal/55">
              {f.label}
              {f.required && <span className="text-burgundy"> *</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea name={f.name} rows={5} required={f.required} placeholder={f.placeholder} className={`${input} resize-y`} />
            ) : f.type === "select" ? (
              <select name={f.name} required={f.required} className={input} defaultValue="">
                <option value="" disabled>
                  선택해 주세요
                </option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input name={f.name} type={f.type ?? "text"} required={f.required} placeholder={f.placeholder} className={input} />
            )}
            {state.errors?.[f.name] && <span className="mt-1 block text-xs text-burgundy">{state.errors[f.name]}</span>}
          </label>
        ))}
      </div>
      <div className="space-y-3 border-t border-line pt-6 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consentPrivacy" className="mt-1 accent-burgundy" />
          <span>
            <span className="font-medium">[필수]</span> 개인정보 수집·이용에 동의합니다.
            <span className="mt-1 block text-xs leading-relaxed text-charcoal/50">{privacyNote}</span>
          </span>
        </label>
        {state.errors?.consentPrivacy && <p className="text-xs text-burgundy">{state.errors.consentPrivacy}</p>}
        {marketingOption && (
          <label className="flex items-start gap-3">
            <input type="checkbox" name="consentMarketing" className="mt-1 accent-burgundy" />
            <span>
              <span className="font-medium">[선택]</span> 신상품·큐레이션 등 광고성 정보 수신에 동의합니다. (언제든 수신 거부 가능)
            </span>
          </label>
        )}
      </div>
      {state.message && !state.ok && <p className="text-sm text-burgundy">{state.message}</p>}
      <Submit label={submitLabel} />
    </form>
  );
}
