// SOOL RESERVE — 라이브 앱 (claude.ai 저장소 연동)
// 데이터: cat/v1 (설정), cat/v1/{products,breweries,articles,notices} — 관리자만 수정
// 문의: inq/<viewer id> — 각자 자기 문서만 작성, 관리자만 전체 열람
"use strict";

const ART = JSON.parse(document.getElementById("art-data").textContent);

// ─── 라벨 ───────────────────────────────────────────────
const LIQUOR = { DISTILLED_SOJU: "증류식 소주", YAKJU: "약주", CHEONGJU: "청주", TAKJU: "탁주", FRUIT_WINE: "과실주", OTHER: "기타 전통주" };
const LEGAL = { FOLK: "민속주", REGIONAL: "지역특산주", NONE: "해당 없음(일반 주류)", UNKNOWN: "미확인" };
const ELIG = { UNCHECKED: "미확인", IN_REVIEW: "검토 중", VERIFIED: "통신판매 적격 확인", INELIGIBLE: "부적격 · 소개 전용" };
const PSTATUS = { DRAFT: "작성 중", REVIEW: "검토 대기", PUBLISHED: "공개", HIDDEN: "숨김" };
const ONBOARD = { APPLIED: "입점 신청", DOCS_REVIEW: "서류 확인", PRODUCT_REVIEW: "상품 검토", PROFIT_REVIEW: "수익성 검토", CONTRACT: "계약", APPROVED: "관리자 승인", LISTED: "상품 노출", REJECTED: "반려" };
const ONBOARD_FLOW = ["APPLIED", "DOCS_REVIEW", "PRODUCT_REVIEW", "PROFIT_REVIEW", "CONTRACT", "APPROVED", "LISTED"];
const TSOURCE = { MANUFACTURER: "제조사 제공 정보", IN_HOUSE: "SOOL RESERVE 자체 테이스팅", NONE: "미등록" };
const TASTE_AXES = [["tasteSweetness", "단맛"], ["tasteAcidity", "산미"], ["tasteBody", "바디감"], ["tasteCarbonation", "탄산감"], ["tasteAroma", "향의 강도"]];
const SCORES = [["scoreEligibility", "온라인 판매 적격"], ["scoreReputation", "양조장 신뢰도"], ["scoreStory", "브랜드 스토리"], ["scoreQuality", "품질·완성도"], ["scoreRarity", "희소성"], ["scoreDesign", "병·패키지 디자인"], ["scoreGift", "선물 적합성"], ["scoreProfit", "예상 수익"], ["scoreSupply", "공급 안정성"], ["scoreLogistics", "배송·보관 용이성"]];
const OCCASIONS = ["혼자 즐기는 술", "특별한 식사", "홈파티", "캠핑", "부모님 선물", "명절 선물", "기업 VIP 선물", "컬렉션 및 소장용"];
const GIFTS = [["부모님 선물", "For Parents", "감사의 마음을 오래 남는 한 병으로"], ["VIP 선물", "For VIP", "품격으로 기억되는 선택"], ["기업 선물", "Corporate", "브랜드의 태도를 담은 선물"], ["명절 선물", "Holiday", "설과 추석, 한 해의 인사"], ["결혼 및 기념일 선물", "Celebration", "함께 기억할 날을 위한 술"], ["특별한 감사 선물", "Gratitude", "말로 다 못한 고마움"]];
const PAIR_CATS = ["한식", "육류", "해산물", "치즈", "디저트", "퓨전 요리"];
const SHIP_DAYS = ["월", "화", "수", "목", "금", "토"];
const SLOTS = { MAIN: "메인 추천", GIFT: "프리미엄 기프트 추천", PROFIT: "고수익 상품", LIMITED: "한정판 추천", SEASONAL: "시즌 추천" };
const ART_CAT = { STORY: ["명주 이야기", "Story"], INTERVIEW: ["장인 인터뷰", "Interview"], GIFT_GUIDE: ["선물 가이드", "Gift Guide"], PAIRING: ["페어링", "Pairing"], GUIDE: ["보관 · 음용 가이드", "Guide"], TRAVEL: ["양조장 탐방", "Travel"] };
const ART_FALLBACK = { STORY: "hanok", INTERVIEW: "still", GIFT_GUIDE: "courtyard", PAIRING: "field", GUIDE: "lake", TRAVEL: "mountain" };
const THEMES = { hanok: "한옥 처마와 옹기", field: "논과 들판", still: "소줏고리 증류", island: "섬과 돌담", orchard: "과수원", mountain: "산과 계곡", lake: "호수와 새벽 안개", courtyard: "장독대 마당", snow: "설원과 고원", herb: "약초 말리는 처마" };
const AD_CHECKS = [["adCheckNoGlamour", "음주 미화·과음 조장·음주 장면 연출 표현이 없습니다"], ["adCheckNoMinors", "청소년이 등장하거나 청소년을 대상으로 하는 표현이 없습니다"], ["adCheckNoHealth", "건강 효능·질병 예방·치료 효과를 주장하지 않습니다"], ["adCheckWarning", "음주 경고문구가 함께 노출되는 영역에 게시합니다"], ["adCheckFacts", "수상·한정 수량·명인 칭호 등 사실관계를 확인했습니다"]];
const NOTICE_T = { HEALTH_WARNING: "음주 경고문구", YOUTH_NOTICE: "청소년 판매 금지 고지", INTERMEDIARY: "통신판매중개자 고지", TERMS: "이용약관", PRIVACY: "개인정보 처리방침", SHIPPING_POLICY: "배송 정책", RETURN_POLICY: "교환·반품 정책" };
const INQ_T = { PARTNERSHIP: "입점 문의", CORPORATE: "기업 VIP 상담", CUSTOMER: "고객 문의", NEWSLETTER: "정보 구독" };
const PROCESS = [["rice", "쌀 씻기", "Rice"], ["steam", "고두밥 찌기", "Steam"], ["nuruk", "누룩 빚기", "Nuruk"], ["ferment", "발효", "Ferment"], ["distill", "증류 · 거르기", "Distill"], ["age", "숙성", "Age"]];

const DEFAULT_SETTINGS = {
  brandName: "SOOL RESERVE", brandNameKo: "술의 격", slogan: "술에도 격이 있습니다.", subCopy: "시간과 장인정신이 빚어낸 대한민국의 가장 귀한 술.",
  salesMode: "SHOWCASE", showReferencePrice: true, showDemoData: true, defaultCommissionRate: 15, minListingPrice: 100000,
  priceTiers: [100000, 200000, 300000, 500000],
  curationWeights: { scoreEligibility: 1.5, scoreReputation: 1, scoreStory: 1, scoreQuality: 1.5, scoreRarity: 1, scoreDesign: 0.8, scoreGift: 1.2, scoreProfit: 1.2, scoreSupply: 1, scoreLogistics: 0.8 },
  pgContractConfirmed: false, settlementStructureConfirmed: false, operatorLicenseConfirmed: false, giftWrapFee: 5000, heroImageUrl: null, heroImageAlt: "",
  business: { companyName: "(운영사 등록 전)", representative: "-", businessNumber: "-", mailOrderNumber: "-", address: "-", email: "hello@soolreserve.example", phone: "-" },
  featured: { MAIN: [], GIFT: [], PROFIT: [], LIMITED: [], SEASONAL: [] },
};

// ─── 상태 ───────────────────────────────────────────────
const S = {
  db: null, user: null, uid: null, isAdmin: false, status: "connecting", // connecting | ready | offline
  settings: DEFAULT_SETTINGS, products: {}, breweries: {}, articles: {}, notices: {}, inquiries: [], audit: [], assets: null, delArm: null, ageOk: false, ageNo: false,
  loaded: { settings: false, products: false, breweries: false, articles: false, notices: false },
  f: { q: "", type: "", taste: [], occasion: "", min: "", sort: "" },
  quiz: { step: 0, tastes: [], types: [], food: "", purpose: "", budget: null, results: null },
  sent: {}, dirty: false, saving: false,
  cat: { products: {}, breweries: {} }, ops: { products: {}, breweries: {} }, orders: {}, suppliers: {}, pos: {}, cartN: 0, ageUntil: null, giftWrapOn: false, co: null, orderTab: "", settleMonth: null,
};

// ─── 유틸 ───────────────────────────────────────────────
const e = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const won = (n) => (n === null || n === undefined || Number.isNaN(n) ? "–" : `${Math.round(n).toLocaleString("ko-KR")}원`);
const pct = (n) => (n === null || n === undefined || !Number.isFinite(n) ? "–" : `${n.toFixed(1)}%`);
const dateKo = (d) => (d ? new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "–");
const slugify = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 !== 0 ? a : b); };
const toast = (msg) => { const t = document.getElementById("toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add("hidden"), 2800); };
const sorted = (o) => Object.values(o).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

// ─── 수익 계산 (서버 lib/economics.ts와 동일) ─────────────────
function calcEconomics(i) {
  const price = Math.max(0, Math.round(i.price || 0));
  const basisAmount = i.vatBasis === "EXCLUSIVE" ? Math.floor((price * 10) / 11) : price;
  const commission = Math.round((basisAmount * i.commissionRate) / 100);
  const pgTotal = Math.round((price * (i.pgRate || 0)) / 100);
  const platformPgCost = i.pgBearer === "PLATFORM" ? pgTotal : 0;
  const contribution = commission - platformPgCost - (i.platformShippingCost || 0) - (i.platformPromoCost || 0) - (i.otherVariableCost || 0);
  const r1 = (n) => Math.round(n * 10) / 10;
  return { basisAmount, commission, platformPgCost, contribution, marginOnCommission: commission > 0 ? r1((contribution / commission) * 100) : null, marginOnGmv: price > 0 ? r1((contribution / price) * 100) : null, sellerPayout: price - commission - (i.pgBearer === "SELLER" ? pgTotal : 0) };
}
function econ(p) {
  if (p.tradeModel === "WHOLESALE") {
    const w = calcWholesale(p);
    return { model: "WHOLESALE", commissionRate: null, basisAmount: w.netSales, commission: w.grossMargin, platformPgCost: w.pgCost, contribution: w.contribution, marginOnCommission: w.marginOnSales, marginOnGmv: p.price > 0 ? Math.round((w.contribution / p.price) * 1000) / 10 : null, sellerPayout: null, w };
  }
  const b = S.breweries[p.brewery];
  const rate = p.commissionRate ?? b?.defaultCommissionRate ?? S.settings.defaultCommissionRate;
  return { model: "COMMISSION", commissionRate: rate, ...calcEconomics({ ...p, commissionRate: rate }) };
}
function curation(p) {
  let sum = 0, ws = 0, n = 0;
  for (const [k] of SCORES) { const v = p[k]; if (v === null || v === undefined) continue; const w = S.settings.curationWeights?.[k] ?? 1; sum += v * w; ws += w; n++; }
  return n < 5 || !ws ? null : Math.round((sum / ws) * 100) / 100;
}

// ─── 공개 데이터 ─────────────────────────────────────────
const priceMode = () => (S.settings.salesMode === "LIVE" ? "LIVE" : S.settings.showReferencePrice ? "REFERENCE" : "HIDDEN");
function visibleBrewery(b) { return b && b.onboardingStatus === "LISTED" && (S.settings.showDemoData || !b.isDemo); }
function publicProducts() { return sorted(S.products).filter((p) => p.status === "PUBLISHED" && visibleBrewery(S.breweries[p.brewery]) && (S.settings.showDemoData || !p.isDemo)); }
function publicArticles() { const now = Date.now(); return Object.values(S.articles).filter((a) => a.status === "PUBLISHED" && a.publishedAt && new Date(a.publishedAt).getTime() <= now && (S.settings.showDemoData || !a.isDemo)).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)); }
function currentNotice(type) { const now = Date.now(); return Object.values(S.notices).filter((n) => n.type === type && new Date(n.effectiveFrom).getTime() <= now).sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0]; }
const shownPrice = (p) => (priceMode() === "HIDDEN" && !commerceOn() ? null : p.price);

const TASTE_FILTERS = [
  ["sweet", "달콤한", (p) => (p.tasteSweetness ?? 0) >= 4], ["dry", "드라이한", (p) => p.tasteSweetness != null && p.tasteSweetness <= 2],
  ["acidic", "산미가 있는", (p) => (p.tasteAcidity ?? 0) >= 4], ["aromatic", "향이 풍부한", (p) => (p.tasteAroma ?? 0) >= 4],
  ["full", "바디감이 높은", (p) => (p.tasteBody ?? 0) >= 4], ["sparkling", "탄산이 있는", (p) => (p.tasteCarbonation ?? 0) >= 3],
  ["smooth", "부드러운", (p) => (p.flavorTags || []).includes("부드러운")], ["strong", "고도수", (p) => p.abv >= 30],
];
function filtered(special) {
  const f = S.f;
  let out = publicProducts();
  if (f.q) { const q = f.q.toLowerCase(); out = out.filter((p) => [p.name, p.nameEn, S.breweries[p.brewery]?.name, p.region, p.summary, p.ingredients].filter(Boolean).some((s) => s.toLowerCase().includes(q))); }
  if (f.type) out = out.filter((p) => p.liquorType === f.type);
  if (special === "master") out = out.filter((p) => p.isMaster && p.masterVerified);
  if (special === "limited") out = out.filter((p) => p.isLimited && p.limitedVerified);
  for (const t of f.taste) { const r = TASTE_FILTERS.find((x) => x[0] === t); if (r) out = out.filter(r[2]); }
  if (f.occasion) out = out.filter((p) => (p.occasions || []).includes(f.occasion));
  if (f.min) out = out.filter((p) => shownPrice(p) !== null && p.price >= Number(f.min));
  const s = [...out];
  if (f.sort === "price-desc") s.sort((a, b) => b.price - a.price);
  if (f.sort === "price-asc") s.sort((a, b) => a.price - b.price);
  if (f.sort === "abv-desc") s.sort((a, b) => b.abv - a.abv);
  return s;
}

function recommend(a) {
  const rules = {
    sweet: ["단맛", (p) => (p.tasteSweetness == null ? null : (p.tasteSweetness - 1) / 4)], dry: ["드라이함", (p) => (p.tasteSweetness == null ? null : (5 - p.tasteSweetness) / 4)],
    acidic: ["산미", (p) => (p.tasteAcidity == null ? null : (p.tasteAcidity - 1) / 4)], aromatic: ["풍부한 향", (p) => (p.tasteAroma == null ? null : (p.tasteAroma - 1) / 4)],
    full: ["바디감", (p) => (p.tasteBody == null ? null : (p.tasteBody - 1) / 4)], sparkling: ["탄산감", (p) => (p.tasteCarbonation == null ? null : (p.tasteCarbonation - 1) / 4)],
    smooth: ["부드러움", (p) => ((p.flavorTags || []).includes("부드러운") ? 1 : 0)],
  };
  const out = [];
  for (const p of publicProducts().filter((x) => x.eligibility !== "INELIGIBLE")) {
    const price = shownPrice(p);
    if (a.budget && (price === null || price < a.budget[0] || (a.budget[1] && price > a.budget[1]))) continue;
    let score = 0; const reasons = [];
    for (const t of a.tastes) { const r = rules[t]; const fit = r?.[1](p); if (fit === null || fit === undefined) continue; score += fit * 3; if (fit >= 0.75) reasons.push(`${josa(r[0], "이", "가")} 두드러집니다`); }
    if (a.types.length && a.types.includes(p.liquorType)) { score += 2; reasons.push("선호하신 주종입니다"); }
    if (a.food && (p.pairingCategories || []).includes(a.food)) { score += 1.5; reasons.push(`${josa(a.food, "과", "와")} 잘 어울립니다`); }
    if (a.purpose === "gift" && (p.giftPurposes || []).length) { score += 1; reasons.push("선물용 구성이 준비되어 있습니다"); }
    if (score > 0) out.push({ p, score, reasons });
  }
  return out.sort((x, y) => y.score - x.score).slice(0, 6);
}

function parseBody(body) {
  const blocks = [];
  for (const chunk of String(body || "").replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => l.startsWith("- "))) blocks.push({ t: "ul", items: lines.map((l) => l.slice(2)) });
    else if (lines[0].startsWith("## ")) { blocks.push({ t: "h2", x: lines[0].slice(3) }); if (lines.length > 1) blocks.push({ t: "p", x: lines.slice(1).join(" ") }); }
    else if (lines.every((l) => l.startsWith(">"))) blocks.push({ t: "q", x: lines.map((l) => l.replace(/^>\s?/, "")).join(" ") });
    else blocks.push({ t: "p", x: lines.join(" ") });
  }
  return blocks;
}

// ─── 라우터 ─────────────────────────────────────────────
function route() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ""));
  const [name, ...rest] = h.split(".");
  return { name: name || "home", arg: rest.join(".") || "" };
}
