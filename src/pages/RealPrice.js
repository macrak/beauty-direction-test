// 찐가격(Real Price) 페이지 — "외국인 견적이 아니라 한국인이 실제로 낸 가격"
//
// 원래는 Next.js + 서버 API(procedure_pricing.json 10만여 건을 서버가 읽어
// 통계를 계산) 구조였다. 이 저장소는 GitHub Pages에 배포되는 정적 CRA 앱이라
// 서버가 없으므로, 원본 데이터를 빌드 타임에 미리 집계해둔 두 개의 정적 JSON
// (public/data/real-price-*.json)을 클라이언트에서 fetch해 그대로 쓴다.
// 자세한 내용은 src/data/realPriceData.js와 scripts/generate-real-price-data.js 참고.

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORIES,
  getProcedureStats,
  getCuratedProcedureStats,
  getHospitalPricing,
  getStoredSubmissions,
  addStoredSubmission,
} from '../data/realPriceData';
import './realPrice.css';

const fmtWon = (n) => '₩' + n.toLocaleString('ko-KR');

// ================================================================
// 1. 시술별 시세 검색
// ================================================================
function ProcedureSearch() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProcedureStats(category === 'all' ? undefined : category, query || undefined)
      .then((results) => {
        if (cancelled) return;
        setItems(query ? results.slice(0, 50) : results.slice(0, 50));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, query]);

  return (
    <section className="jp-section">
      <div className="jp-searchbox">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="시술명을 검색해보세요 (예: 코성형, 임플란트)"
        />
      </div>
      <div className="jp-chips">
        <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="jp-results">
        {loading && <div className="jp-empty">불러오는 중…</div>}
        {!loading && items.length === 0 && <div className="jp-empty">검색 결과가 없습니다</div>}
        {items.map((d, i) => {
          const pct = Math.round(((d.p50 - d.p20) / Math.max(1, d.p80 - d.p20)) * 100);
          return (
            <div key={d.category + d.name}>
              <div className="jp-result-line" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <div>
                  <div className="jp-rl-name">{d.name}</div>
                  <div className="jp-rl-meta">
                    {d.hospitals.toLocaleString()}개 병원 · {d.reports.toLocaleString()}건의 실제 결제 제보
                  </div>
                </div>
                <div className="jp-rl-price">
                  {fmtWon(d.p50)}
                  <span className="unit">median</span>
                </div>
              </div>
              {openIdx === i && (
                <div className="jp-detail">
                  <div className="jp-bar">
                    <div className="jp-bar-fill" style={{ left: 0, width: `${pct}%` }} />
                  </div>
                  <div className="jp-scale">
                    <span>{fmtWon(d.p20)}</span>
                    <span>{fmtWon(d.p80)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ================================================================
// 2. 병원별 실제 지불액 조회
// ================================================================
function HospitalSearch({ submissions }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(null);
  const [matchedName, setMatchedName] = useState(null);

  useEffect(() => {
    if (!query) {
      setItems(null);
      return;
    }
    let cancelled = false;
    getHospitalPricing(query).then((data) => {
      if (cancelled) return;
      setMatchedName(data?.name ?? null);
      setItems(data?.items ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const subMatches = query ? submissions.filter((s) => s.hospital.includes(query)) : [];

  return (
    <section className="jp-section">
      <h2>병원 이름으로 실제 지불 금액 찾기</h2>
      <p className="jp-sub">병원 이름을 입력하면, 그 병원에서 실제로 결제한 시술별 금액을 그대로 보여드립니다.</p>
      <div className="jp-searchbox">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="병원 이름을 입력해보세요" />
      </div>
      {query && (items?.length || subMatches.length) ? (
        <div className="jp-hosp-card">
          <div className="jp-hc-name">{matchedName || query}</div>
          <div className="jp-hc-tag">✓ 실제 지불 추정됨</div>
          {items?.map((it, i) => (
            <div className="jp-hc-row" key={i}>
              <span>{it.proc}</span>
              <span className="mono">
                {fmtWon(it.price)}
                <span className="n">{it.n.toLocaleString()}건 기준</span>
              </span>
            </div>
          ))}
          {subMatches.map((s, i) => (
            <div className="jp-hc-row" key={'s' + i}>
              <span>{s.procedure}</span>
              <span className="mono">
                {fmtWon(s.price)}
                <span className="n">방금 제보됨</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        query && <div className="jp-empty">등록된 병원명을 입력해주세요</div>
      )}
    </section>
  );
}

// ================================================================
// 3. 맞춤 견적 계산기 (성형/피부과/치과)
// ================================================================
function QuoteCalculator() {
  const [category, setCategory] = useState('성형외과');
  const [catalog, setCatalog] = useState({ 성형외과: [], 피부과: [], 치과: [] });
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    getCuratedProcedureStats(category).then((items) => {
      if (!cancelled) setCatalog((prev) => ({ ...prev, [category]: items }));
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const items = catalog[category];

  const totals = useMemo(() => {
    const picked = items.filter((i) => selected.has(i.name));
    return {
      p20: picked.reduce((s, i) => s + i.p20, 0),
      p50: picked.reduce((s, i) => s + i.p50, 0),
      p80: picked.reduce((s, i) => s + i.p80, 0),
      count: picked.length,
    };
  }, [items, selected]);

  function toggle(name) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function requestConsult() {
    // TODO: 기존 상담신청 폼과 연동. 지금은 선택 시술 + 예상 견적을 쿼리로 남기고
    // 홈으로 돌려보내는 자리표시자 동작만 한다.
    const params = new URLSearchParams({
      category,
      procedures: Array.from(selected).join(','),
      estimateMin: String(totals.p20),
      estimateMax: String(totals.p80),
    });
    window.location.href = `${process.env.PUBLIC_URL}/?${params.toString()}`;
  }

  return (
    <section className="jp-section">
      <h2>한국 의료관광 맞춤 견적 계산기</h2>
      <p className="jp-sub">
        받고 싶은 시술을 골라보세요. 실제 결제 데이터를 기반으로 예상 총 견적을 바로 계산해드립니다.
      </p>

      <div className="jp-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={category === c ? 'active' : ''}
            onClick={() => {
              setCategory(c);
              setSelected(new Set());
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="jp-quote-grid">
        {items.map((it) => (
          <label key={it.name} className={`jp-quote-item ${selected.has(it.name) ? 'checked' : ''}`}>
            <input type="checkbox" checked={selected.has(it.name)} onChange={() => toggle(it.name)} />
            <span className="jp-qi-name">{it.name}</span>
            <span className="jp-qi-price mono">{fmtWon(it.p50)}~</span>
          </label>
        ))}
        {items.length === 0 && <div className="jp-empty">불러오는 중…</div>}
      </div>

      {totals.count > 0 && (
        <div className="jp-quote-total">
          <div className="jp-qt-label">선택한 시술 {totals.count}건 · 찐가격 기준 예상 견적</div>
          <div className="jp-qt-range">
            {fmtWon(totals.p20)} ~ {fmtWon(totals.p80)}
          </div>
          <div className="jp-qt-median">중간값 {fmtWon(totals.p50)}</div>
          <button className="jp-cta-btn" onClick={requestConsult}>
            이 견적으로 무료 상담 신청하기
          </button>
          <div className="jp-disclaimer">
            실제 견적은 상담·검진 후 확정됩니다. 이 금액은 동일 시술을 받은 다른 환자들의 실제 결제 데이터를
            기반으로 한 참고용 추정치입니다.
          </div>
        </div>
      )}
    </section>
  );
}

// ================================================================
// 4. 내가 낸 금액 제보하기
// ================================================================
function SubmitForm({ onSubmitted }) {
  const [hospital, setHospital] = useState('');
  const [procedure, setProcedure] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  function submit() {
    setError('');
    if (!hospital.trim() || !procedure.trim() || !price.trim()) {
      setError('병원명·시술명·금액을 모두 입력해주세요');
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('금액은 0보다 큰 숫자로 입력해주세요');
      return;
    }
    const saved = { hospital: hospital.trim(), procedure: procedure.trim(), price: priceNum, ts: Date.now() };
    onSubmitted(saved);
    setHospital('');
    setProcedure('');
    setPrice('');
  }

  return (
    <section className="jp-section">
      <h2>내가 낸 금액 제보하기</h2>
      <p className="jp-sub">
        병원명·받은 시술·실제로 결제한 금액을 남겨주시면, 더 정확한 찐가격 데이터가 됩니다.
      </p>
      <div className="jp-submit-form">
        <input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="병원명" />
        <input value={procedure} onChange={(e) => setProcedure(e.target.value)} placeholder="받은 시술" />
        <input
          type="number"
          min={0}
          step={1000}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="결제 금액 (원)"
        />
        <button onClick={submit}>제보하기</button>
      </div>
      {error && <div className="jp-error">{error}</div>}
    </section>
  );
}

// ================================================================
// 메인 페이지
// ================================================================
export default function RealPrice() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setSubmissions(getStoredSubmissions());
  }, []);

  function handleSubmitted(s) {
    setSubmissions(addStoredSubmission(s));
  }

  return (
    <main className="jp-root">
      <div style={{ paddingTop: 20 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--jp-ink-soft)' }}>
          ← 홈으로
        </Link>
      </div>

      <section className="jp-hero">
        <div className="jp-stamp">✓ 찐가격 인증</div>
        <h1>
          외국인 견적 말고, <em>한국인이 실제로 낸 가격</em>을 보여드립니다
        </h1>
        <p className="jp-sub">
          병원 가격표에 적힌 견적이 아니라, 환자들이 실제로 결제하고 알려준 금액을 모았습니다. &quot;얼마부터&quot;가
          아니라 &quot;얼마를 냈다&quot;는 기록입니다.
        </p>
      </section>

      <ProcedureSearch />
      <HospitalSearch submissions={submissions} />
      <QuoteCalculator />
      <SubmitForm onSubmitted={handleSubmitted} />

      <section className="jp-section jp-trust">
        <h2>이 가격, 어디서 나온 건가요</h2>
        <p className="jp-sub">
          병원 홈페이지나 상담실에서 부르는 견적가가 아닙니다. 실제로 시술을 받고 돈을 낸 환자가 다른 환자에게
          알려준 &quot;지불 금액&quot;과, &quot;내가 낸 금액 제보하기&quot;로 직접 받은 실제 지불 금액을 모았습니다.
          견적은 협상 전 숫자지만, 이 데이터는 협상과 이벤트가 다 끝난 뒤 실제로 결제된 최종 금액입니다.
        </p>
      </section>
    </main>
  );
}
