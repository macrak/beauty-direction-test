"use client";
import { useFormState, useFormStatus } from "react-dom";
import { adminLogin, partnerLogin, type LoginState } from "@/lib/session-actions";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn w-full py-3" disabled={pending}>
      {pending ? "확인 중…" : "로그인"}
    </button>
  );
}

export default function LoginForm({ area }: { area: "admin" | "partner" }) {
  const [state, action] = useFormState<LoginState, FormData>(area === "admin" ? adminLogin : partnerLogin, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="adm-label">이메일</span>
        <input name="email" type="email" required autoComplete="username" className="adm-input" />
      </label>
      <label className="block">
        <span className="adm-label">비밀번호</span>
        <input name="password" type="password" required autoComplete="current-password" className="adm-input" />
      </label>
      {state.error && <p className="text-sm text-burgundy">{state.error}</p>}
      <Btn />
    </form>
  );
}
