import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "관리자 로그인", robots: { index: false, follow: false } };

export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1EDE5] p-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-xl tracking-[0.32em]">SOOL RESERVE</p>
        <p className="mt-1 text-center text-xs tracking-widest text-charcoal/50">ADMIN CONSOLE</p>
        <div className="adm-card mt-8">
          <LoginForm area="admin" />
        </div>
        <p className="mt-6 text-center text-xs text-charcoal/45">
          양조장 담당자는{" "}
          <a href="/partner/login" className="underline">
            파트너 센터
          </a>
          로 로그인하세요.
        </p>
      </div>
    </div>
  );
}
