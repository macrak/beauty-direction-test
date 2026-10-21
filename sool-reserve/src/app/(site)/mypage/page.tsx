import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "마이페이지", robots: { index: false } };

export default function MyPage() {
  return <ComingSoon eyebrow="My Reserve" title="마이페이지" desc="회원가입, 성인 인증, 관심상품, 주문 내역은 판매 기능 승인 이후 제공됩니다." />;
}
