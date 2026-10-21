import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "파트너 센터 로그인", robots: { index: false, follow: false } };

export default function PartnerLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1EDE5] p-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-xl tracking-[0.32em]">SOOL RESERVE</p>
        <p className="mt-1 text-center text-xs tracking-widest text-charcoal/50">PARTNER CENTER · 양조장 전용</p>
        <div className="adm-card mt-8">
          <LoginForm area="partner" />
        </div>
      </div>
    </div>
  );
}
