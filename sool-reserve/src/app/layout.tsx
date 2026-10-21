import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "SOOL RESERVE · 술의 격", template: "%s · SOOL RESERVE" },
  description: "시간과 장인정신이 빚어낸 대한민국의 가장 귀한 술. 프리미엄 전통주 큐레이션 편집숍.",
  openGraph: { siteName: "SOOL RESERVE", locale: "ko_KR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#F7F4EE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* JS가 동작할 때만 스크롤 등장 애니메이션 적용 — 비활성 환경에서도 콘텐츠가 보이도록 */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Serif+KR:wght@300;400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
