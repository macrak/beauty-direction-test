"use client";
import { useEffect, useState } from "react";

// 고지 목적의 안내 모달 — 실제 구매 자격 검증(본인확인 기반 성인 인증)을 대체하지 않는다.
const KEY = "sr_age_notice_v1";

export default function AgeNotice() {
  const [show, setShow] = useState(false);
  const [under, setUnder] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="w-full max-w-md bg-ivory px-8 py-10 text-center shadow-2xl">
        <p className="font-serif text-sm tracking-[0.32em]">SOOL RESERVE</p>
        <div className="mx-auto my-6 h-px w-10 bg-gold" />
        {under ? (
          <>
            <h2 id="age-title" className="font-kserif text-xl">이용할 수 없습니다</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">본 사이트는 주류 정보를 다루고 있어 만 19세 이상만 이용할 수 있습니다.</p>
          </>
        ) : (
          <>
            <h2 id="age-title" className="font-kserif text-xl">만 19세 이상이신가요?</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              본 사이트는 전통주 정보를 소개합니다. 19세 미만 청소년의 주류 구매는 법으로 금지되어 있으며,
              향후 실제 구매 시에는 본인 확인 기반 성인 인증을 별도로 진행합니다.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button type="button" onClick={accept} className="btn-primary">
                네, 만 19세 이상입니다
              </button>
              <button type="button" onClick={() => setUnder(true)} className="btn-ghost">
                아니오
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
