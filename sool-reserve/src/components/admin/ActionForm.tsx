"use client";
import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/form";

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn" disabled={pending}>
      {pending ? "저장 중…" : label}
    </button>
  );
}

// 서버 액션 폼 — 오류/성공 메시지를 상단·하단에 표시
export default function ActionForm({
  action,
  children,
  submitLabel = "저장",
  className = "",
  stickyFooter = false,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  stickyFooter?: boolean;
}) {
  const [state, formAction] = useFormState(action, { ok: false, message: "" });
  const msg = state.message ? (
    <p className={`rounded px-3 py-2 text-sm ${state.ok ? "bg-[#E3EFE5] text-[#22603A]" : "bg-[#F6E1E1] text-[#9B1C1C]"}`}>{state.message}</p>
  ) : null;
  return (
    <form action={formAction} className={className}>
      {children}
      <div className={`mt-6 flex flex-wrap items-center gap-3 ${stickyFooter ? "sticky bottom-0 -mx-4 border-t border-line bg-[#F1EDE5]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8" : ""}`}>
        <SubmitBtn label={submitLabel} />
        {msg}
      </div>
    </form>
  );
}
