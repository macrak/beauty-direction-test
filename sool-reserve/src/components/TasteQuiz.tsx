"use client";
import Link from "next/link";
import { useState } from "react";
import ProductImage from "./ProductImage";
import Price from "./Price";
import { DemoBadge } from "./Badges";
import { LIQUOR_TYPE_LABEL, PAIRING_CATEGORIES } from "@/lib/labels";

interface Result {
  slug: string;
  name: string;
  brewery: string;
  liquorType: string;
  imageUrl: string | null;
  imageAlt: string | null;
  abv: number;
  volumeMl: number;
  summary: string | null;
  price: number | null;
  priceMode: "LIVE" | "REFERENCE" | "HIDDEN";
  isDemo: boolean;
  reasons: string[];
}

const TASTES = [
  ["sweet", "달콤한"],
  ["dry", "드라이한"],
  ["acidic", "산미가 있는"],
  ["aromatic", "향이 풍부한"],
  ["full", "묵직한 바디"],
  ["sparkling", "탄산이 있는"],
  ["smooth", "부드러운"],
] as const;

export default function TasteQuiz({ showBudget, tiers }: { showBudget: boolean; tiers: number[] }) {
  const [step, setStep] = useState(0);
  const [tastes, setTastes] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [food, setFood] = useState<string | undefined>();
  const [purpose, setPurpose] = useState<"self" | "gift" | undefined>();
  const [budget, setBudget] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const budgets: { label: string; v: [number | undefined, number | undefined] }[] = [
    { label: "상관없음", v: [undefined, undefined] },
    ...tiers.map((t, i) => ({ label: i < tiers.length - 1 ? `${t / 10000}~${tiers[i + 1] / 10000}만 원` : `${t / 10000}만 원 이상`, v: [t, i < tiers.length - 1 ? tiers[i + 1] - 1 : undefined] as [number, number | undefined] })),
  ];

  const steps = [
    {
      q: "어떤 맛을 좋아하시나요?",
      hint: "여러 개 선택할 수 있습니다.",
      body: (
        <Options>
          {TASTES.map(([k, l]) => (
            <Opt key={k} active={tastes.includes(k)} onClick={() => toggle(tastes, setTastes, k)}>
              {l}
            </Opt>
          ))}
        </Options>
      ),
    },
    {
      q: "어떤 주종을 선호하시나요?",
      hint: "선택하지 않으면 모든 주종에서 찾습니다.",
      body: (
        <Options>
          {Object.entries(LIQUOR_TYPE_LABEL).map(([k, l]) => (
            <Opt key={k} active={types.includes(k)} onClick={() => toggle(types, setTypes, k)}>
              {l}
            </Opt>
          ))}
        </Options>
      ),
    },
    {
      q: "어떤 음식과 함께 드실 예정인가요?",
      body: (
        <Options>
          {PAIRING_CATEGORIES.map((c) => (
            <Opt key={c} active={food === c} onClick={() => setFood(food === c ? undefined : c)}>
              {c}
            </Opt>
          ))}
        </Options>
      ),
    },
    {
      q: "직접 드시나요, 선물하시나요?",
      body: (
        <Options>
          <Opt active={purpose === "self"} onClick={() => setPurpose("self")}>
            직접 즐길 술
          </Opt>
          <Opt active={purpose === "gift"} onClick={() => setPurpose("gift")}>
            선물할 술
          </Opt>
        </Options>
      ),
    },
    ...(showBudget
      ? [
          {
            q: "선호하는 가격대는 얼마인가요?",
            hint: "참고 소비자가 기준",
            body: (
              <Options>
                {budgets.map((b) => (
                  <Opt key={b.label} active={budget[0] === b.v[0] && budget[1] === b.v[1]} onClick={() => setBudget(b.v)}>
                    {b.label}
                  </Opt>
                ))}
              </Options>
            ),
          },
        ]
      : []),
  ];

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tastes, types, food, purpose, budgetMin: budget[0], budgetMax: budget[1] }),
      });
      const data = (await res.json()) as { results: Result[] };
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  if (results) {
    return (
      <section className="mt-16">
        <div className="flex items-end justify-between border-b border-line pb-6">
          <h2 className="h-section">추천 결과</h2>
          <button type="button" onClick={() => { setResults(null); setStep(0); }} className="link-underline text-sm">
            다시 하기
          </button>
        </div>
        {results.length === 0 ? (
          <p className="py-20 text-center text-sm text-charcoal/55">조건에 맞는 술을 찾지 못했습니다. 선택을 조금 넓혀 보세요.</p>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <Link key={r.slug} href={`/products/${r.slug}`} className="group block">
                <div className="relative">
                  <ProductImage product={{ name: r.name, liquorType: r.liquorType, imageUrl: r.imageUrl, imageAlt: r.imageAlt }} className="aspect-[4/5]" sizes="sm" />
                  <span className="absolute right-3 top-3 font-serif text-3xl text-charcoal/25">0{i + 1}</span>
                  {r.isDemo && <DemoBadge className="absolute left-3 top-3" />}
                </div>
                <p className="mt-4 text-[11px] tracking-wider text-charcoal/50">{r.brewery}</p>
                <h3 className="mt-1 font-kserif text-lg">{r.name}</h3>
                <p className="mt-1 text-xs text-charcoal/50">
                  {r.abv}% · {r.volumeMl}ml
                </p>
                <ul className="mt-3 space-y-1 text-xs text-burgundy">
                  {r.reasons.slice(0, 3).map((x) => (
                    <li key={x}>· {x}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Price price={r.price} mode={r.priceMode} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    );
  }

  const cur = steps[step];
  const last = step === steps.length - 1;
  return (
    <section className="mx-auto mt-14 max-w-3xl">
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((_, i) => (
          <span key={i} className={`h-0.5 flex-1 transition ${i <= step ? "bg-burgundy" : "bg-charcoal/10"}`} />
        ))}
      </div>
      <p className="mt-10 font-serif text-sm text-charcoal/45">
        Question {step + 1} / {steps.length}
      </p>
      <h2 className="mt-3 font-kserif text-2xl md:text-3xl">{cur.q}</h2>
      {"hint" in cur && cur.hint && <p className="mt-2 text-sm text-charcoal/50">{cur.hint}</p>}
      <div className="mt-10">{cur.body}</div>
      <div className="mt-12 flex justify-between">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className="btn-ghost" disabled={step === 0}>
          이전
        </button>
        {last ? (
          <button type="button" onClick={submit} className="btn-primary" disabled={loading}>
            {loading ? "찾는 중…" : "추천 받기"}
          </button>
        ) : (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-primary">
            다음
          </button>
        )}
      </div>
    </section>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

function Opt({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-5 font-kserif text-[15px] transition ${active ? "border-burgundy bg-burgundy text-ivory" : "border-charcoal/15 bg-white/40 hover:border-charcoal/50"}`}
    >
      {children}
    </button>
  );
}
