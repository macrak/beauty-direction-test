"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Thumb, useQuote } from "./CartView";
import { writeCart } from "./cart";
import { won } from "@/lib/format";

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="border-t border-charcoal pt-6">
      <h2 className="flex items-center gap-3 font-kserif text-lg">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full font-serif text-sm ${done ? "bg-burgundy text-ivory" : "border border-charcoal/30"}`}>{done ? "✓" : n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

const input = "w-full border-b border-charcoal/25 bg-transparent py-3 text-[15px] outline-none transition placeholder:text-charcoal/30 focus:border-charcoal";

export default function CheckoutView({ testMode, ageProvider }: { testMode: boolean; ageProvider: string }) {
  const router = useRouter();
  const { items, q, giftWrapFee } = useQuote();
  const [age, setAge] = useState<{ verified: boolean; expiresAt?: string } | null>(null);
  const [ageBusy, setAgeBusy] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/commerce/age").then((r) => r.json()).then(setAge).catch(() => setAge({ verified: false }));
  }, []);

  if (items && items.length === 0) {
    return <p className="py-24 text-center text-sm text-charcoal/55">장바구니가 비어 있습니다.</p>;
  }

  const verify = async () => {
    setAgeBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/commerce/age", { method: "POST" });
      const d = await r.json();
      setAge(d);
      if (!d.verified) setErr(d.message ?? "성인 인증에 실패했습니다.");
    } finally {
      setAgeBusy(false);
    }
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErr("");
    const fd = new FormData(ev.currentTarget);
    if (!age?.verified) return setErr("성인 인증을 먼저 진행해 주세요.");
    if (!fd.get("agree")) return setErr("주문 내용 확인 및 결제 진행에 동의해 주세요.");
    setBusy(true);
    try {
      const body = { items, giftWrap, ...Object.fromEntries([...fd.entries()].filter(([k]) => k !== "agree").map(([k, v]) => [k, String(v)])) };
      const r = await fetch("/api/commerce/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? "주문에 실패했습니다.");
      writeCart([]);
      router.push(`/orders/${d.orderNumber}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  const total = (q?.total ?? 0) + (giftWrap ? giftWrapFee : 0);

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-12 lg:gap-16" noValidate>
      <div className="space-y-12 lg:col-span-7">
        <Step n={1} title="성인 인증" done={age?.verified}>
          {age?.verified ? (
            <p className="text-sm text-charcoal/70">
              인증되었습니다.{" "}
              <span className="text-charcoal/45">
                ({ageProvider === "mock" ? "테스트 인증" : "본인확인"} · {age.expiresAt ? new Date(age.expiresAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : ""}까지 유효)
              </span>
            </p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-sm leading-relaxed text-charcoal/65">주류는 만 19세 이상만 구매할 수 있습니다. 결제 전 본인 확인 기반 성인 인증이 필요하며, 인증 결과는 성인 여부와 인증 시각만 저장합니다.</p>
              <button type="button" onClick={verify} disabled={ageBusy} className="btn-ghost shrink-0">
                {ageBusy ? "인증 중…" : testMode ? "테스트 인증 진행" : "본인 인증하기"}
              </button>
            </div>
          )}
        </Step>

        <Step n={2} title="배송 정보">
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            <label>
              <span className="text-xs text-charcoal/55">받는 분 *</span>
              <input name="recipientName" required autoComplete="name" className={input} />
            </label>
            <label>
              <span className="text-xs text-charcoal/55">연락처 *</span>
              <input name="recipientPhone" required type="tel" autoComplete="tel" placeholder="010-0000-0000" className={input} />
            </label>
            <label>
              <span className="text-xs text-charcoal/55">우편번호</span>
              <input name="postalCode" autoComplete="postal-code" className={input} />
            </label>
            <label>
              <span className="text-xs text-charcoal/55">희망 배송일</span>
              <input name="desiredDate" type="date" className={input} />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs text-charcoal/55">주소 *</span>
              <input name="address" required autoComplete="street-address" className={input} />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs text-charcoal/55">상세 주소</span>
              <input name="addressDetail" className={input} />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs text-charcoal/55">배송 요청 사항</span>
              <input name="deliveryNote" placeholder="예: 부재 시 경비실" className={input} />
            </label>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-charcoal/50">수령 시 받는 분의 성인 여부를 확인할 수 있습니다. 미성년자에게는 전달되지 않습니다.</p>
        </Step>

        <Step n={3} title="선물 포장" done={giftWrap}>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="mt-1 accent-burgundy" />
            <span>
              <span className="text-sm">한지·보자기 선물 포장 + 쇼핑백</span>
              <span className="ml-2 text-xs text-charcoal/50">+{won(giftWrapFee)}</span>
            </span>
          </label>
          {giftWrap && (
            <label className="mt-5 block">
              <span className="text-xs text-charcoal/55">메시지 카드 (선택, 200자)</span>
              <textarea name="giftMessage" rows={3} maxLength={200} className={`${input} resize-none`} placeholder="마음을 전할 한 줄을 적어 주세요." />
            </label>
          )}
        </Step>

        <Step n={4} title="결제">
          <div className="border border-line bg-white/60 p-5 text-sm">
            <p className="font-medium">{testMode ? "테스트 결제 (Mock)" : "신용카드 · 간편결제"}</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal/55">
              {testMode ? "비공개 테스트 모드입니다. 실제 결제·카드 승인이 일어나지 않으며 주문은 테스트 주문으로 기록됩니다." : "결제는 판매자별로 거래 기록이 분리됩니다."}
            </p>
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm">
            <input type="checkbox" name="agree" className="mt-1 accent-burgundy" />
            <span>주문 상품과 결제 금액을 확인했으며 결제 진행에 동의합니다. 만 19세 미만은 구매할 수 없습니다.</span>
          </label>
        </Step>
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-28 border border-line bg-white/70 p-6 md:p-8">
          <h2 className="font-kserif text-lg">주문 상품</h2>
          <ul className="mt-5 divide-y divide-line">
            {q?.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-4 py-4">
                <Thumb imageUrl={l.imageUrl} liquorType={l.liquorType} name={l.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-charcoal/50">{l.sellerLabel}</p>
                  <p className="truncate font-kserif">{l.name}</p>
                  <p className="text-xs text-charcoal/50">
                    {won(l.unitPrice)} × {l.quantity}
                  </p>
                  {l.error && <p className="text-xs text-burgundy">{l.error}</p>}
                </div>
                <span className="font-serif tabular-nums">{won(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2.5 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/60">상품 금액</dt>
              <dd className="tabular-nums">{won(q?.subtotal ?? 0)}</dd>
            </div>
            {q?.groups.map((g) => (
              <div key={g.sellerKey} className="flex justify-between text-xs">
                <dt className="text-charcoal/50">배송비 · {g.sellerLabel}</dt>
                <dd className="tabular-nums text-charcoal/60">{g.shippingFee ? won(g.shippingFee) : "무료"}</dd>
              </div>
            ))}
            {giftWrap && (
              <div className="flex justify-between">
                <dt className="text-charcoal/60">선물 포장</dt>
                <dd className="tabular-nums">{won(giftWrapFee)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-charcoal pt-5">
            <span className="text-sm">총 결제 금액</span>
            <span className="font-serif text-2xl tabular-nums">{won(total)}</span>
          </div>
          {err && (
            <p role="alert" className="mt-4 bg-burgundy/5 px-3 py-2 text-sm text-burgundy">
              {err}
            </p>
          )}
          <button disabled={busy || !q || q.hasErrors} className="btn-primary mt-6 w-full">
            {busy ? "결제 진행 중…" : `${won(total)} ${testMode ? "테스트 결제" : "결제하기"}`}
          </button>
        </div>
      </aside>
    </form>
  );
}
