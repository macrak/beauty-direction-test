// ─── 폼 읽기: name="field|type" (int, int?, num, num?, bool, tri, date, tiers), "field[]" = 체크박스 목록 ───
class FormErr extends Error {}
function readForm(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.name.endsWith("[]")) { const k = el.name.slice(0, -2); out[k] = out[k] || []; if (el.checked) out[k].push(el.value); continue; }
    const [k, t] = el.name.split("|");
    const raw = el.type === "checkbox" ? el.checked : String(el.value).trim();
    if (t === "bool") out[k] = !!raw;
    else if (t === "tri") out[k] = raw === "true" ? true : raw === "false" ? false : null;
    else if (t === "int" || t === "int?" || t === "num" || t === "num?") {
      if (raw === "") { out[k] = t.endsWith("?") ? null : 0; continue; }
      const n = Number(raw);
      if (!Number.isFinite(n) || (t.startsWith("int") && !Number.isInteger(n))) throw new FormErr(`${el.closest("label")?.querySelector(".adm-label")?.textContent || k}: 숫자를 확인해 주세요.`);
      out[k] = n;
    } else if (t === "date") out[k] = raw ? new Date(`${raw}T00:00:00+09:00`).toISOString() : null;
    else if (t === "tiers") out[k] = raw.split(",").map((x) => Number(x.trim().replace(/,/g, ""))).filter((x) => x > 0).sort((a, b) => a - b);
    else out[k] = raw === "" ? null : raw;
  }
  return out;
}
const formError = (form, msg) => { const p = form.querySelector("[data-err]"); if (p) { p.textContent = msg; p.classList.remove("hidden"); } else toast(msg); };

async function audit(action, entity, id, changes) {
  try { await S.db.collection("cat/v1/audit").add({ at: new Date().toISOString(), by: S.uid, action, entity, id, changes: changes || null }); } catch {}
}
const AUDITED = ["price", "stock", "status", "eligibility", "legalClass", "commissionRate", "pgBearer", "platformShippingCost", "platformPromoCost", "otherVariableCost", "isMaster", "masterVerified", "isLimited", "limitedVerified"];
const diff = (a = {}, b = {}) => Object.fromEntries(AUDITED.filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])).map((k) => [k, { from: a[k] ?? null, to: b[k] ?? null }]));

async function saveProduct(form) {
  const id = form.dataset.id, v = readForm(form);
  if (!v.name) throw new FormErr("상품명을 입력해 주세요.");
  if (!v.ingredients) throw new FormErr("원재료 및 함량을 입력해 주세요.");
  if (!v.abv || !v.volumeMl || !v.price) throw new FormErr("도수, 용량, 판매가는 필수입니다.");
  for (const [k, l] of [...TASTE_AXES, ...SCORES]) if (v[k] != null && (v[k] < 1 || v[k] > 5)) throw new FormErr(`${l}: 1~5 사이로 입력해 주세요.`);
  const hasTaste = TASTE_AXES.some(([k]) => v[k] != null);
  if (hasTaste && v.tasteSource === "NONE") throw new FormErr("맛 점수를 입력했다면 정보 출처(제조사 제공/자체 테이스팅)를 선택해 주세요.");
  if (!hasTaste) v.tasteSource = "NONE";
  if (v.legalClass === "NONE" && v.eligibility === "VERIFIED") throw new FormErr("법적 분류가 '해당 없음(일반 주류)'인 상품은 통신판매 적격으로 설정할 수 없습니다.");
  if (!v.isLimited) v.productionCount = null;
  v.pairings = [0, 1, 2, 3].map((i) => ({ category: v[`pair_${i}_category`], name: v[`pair_${i}_name`], description: v[`pair_${i}_description`] || undefined, recipe: v[`pair_${i}_recipe`] || undefined })).filter((x) => x.category && x.name).map((x) => JSON.parse(JSON.stringify(x)));
  for (let i = 0; i < 4; i++) for (const f of ["category", "name", "description", "recipe"]) delete v[`pair_${i}_${f}`];
  v.pairingCategories = [...new Set(v.pairings.map((x) => x.category))];
  let docId = id;
  if (!id) {
    docId = slugify(v.slug || v.nameEn || "") || `p-${Date.now().toString(36)}`;
    if (S.products[docId]) throw new FormErr("이미 사용 중인 URL(slug)입니다.");
  }
  delete v.slug;
  const before = S.products[docId];
  const doc = { ...(before || { gallery: [], isDemo: false, wholesaleCost: null }), ...v, slug: docId };
  delete doc.id;
  await S.db.doc(`cat/v1/products/${docId}`).set(doc);
  await audit(id ? "UPDATE" : "CREATE", "product", docId, id ? diff(before, doc) : { name: doc.name });
  return `admin.product.${docId}`;
}
async function quickSave(form) {
  const id = form.dataset.id, v = readForm(form), before = S.products[id];
  const doc = { ...before, price: Number(form.price.value), stock: Number(form.stock.value), status: form.status.value };
  if (!(doc.price >= 0) || !(doc.stock >= 0)) throw new FormErr("판매가·재고를 확인해 주세요.");
  delete doc.id;
  await S.db.doc(`cat/v1/products/${id}`).set(doc);
  await audit("QUICK_UPDATE", "product", id, diff(before, doc));
  void v;
}
async function saveBrewery(form) {
  const id = form.dataset.id, v = readForm(form);
  if (!v.name || !v.region) throw new FormErr("양조장 이름과 지역을 입력해 주세요.");
  const compliance = {};
  for (const k of Object.keys(v)) if (k.startsWith("c_")) { compliance[k.slice(2)] = v[k]; delete v[k]; }
  if (v.salesEnabled && compliance.status !== "APPROVED") throw new FormErr("판매 서류가 승인(APPROVED)된 양조장만 판매 활성화할 수 있습니다.");
  const before = id ? S.breweries[id] : null;
  if (before?.compliance?.status !== compliance.status) { compliance.reviewedAt = new Date().toISOString(); compliance.reviewedBy = S.uid; }
  let docId = id;
  if (!id) { docId = slugify(v.slug || v.nameEn || "") || `b-${Date.now().toString(36)}`; if (S.breweries[docId]) throw new FormErr("이미 사용 중인 URL(slug)입니다."); }
  delete v.slug;
  const doc = { ...(before || { isDemo: false, gallery: [] }), ...v, slug: docId, compliance: { ...(before?.compliance || {}), ...compliance } };
  delete doc.id;
  await S.db.doc(`cat/v1/breweries/${docId}`).set(JSON.parse(JSON.stringify(doc)));
  await audit(id ? "UPDATE" : "CREATE", "brewery", docId, { onboardingStatus: doc.onboardingStatus, salesEnabled: doc.salesEnabled, compliance: doc.compliance.status });
  return `admin.brewery.${docId}`;
}
async function saveArticle(form) {
  const id = form.dataset.id, v = readForm(form);
  if (!v.title || !v.body) throw new FormErr("제목과 본문을 입력해 주세요.");
  if (v.status === "PUBLISHED") { const miss = AD_CHECKS.filter(([k]) => !v[k]).map(([, l]) => l); if (miss.length) throw new FormErr(`게시 전 광고 기준 점검을 완료해 주세요: ${miss.join(" / ")}`); if (!v.publishedAt) v.publishedAt = new Date().toISOString(); }
  v.productSlugs = (v.productSlugs || []).slice(0, 8);
  v.readMinutes = Math.max(1, Math.round(String(v.body).replace(/\s+/g, "").length / 500));
  let docId = id;
  if (!id) { docId = slugify(v.slug || "") || `a-${Date.now().toString(36)}`; if (S.articles[docId]) throw new FormErr("이미 사용 중인 URL(slug)입니다."); }
  delete v.slug;
  const doc = { ...(S.articles[docId] || { isDemo: false }), ...v, slug: docId };
  delete doc.id;
  await S.db.doc(`cat/v1/articles/${docId}`).set(doc);
  await audit("SAVE", "article", docId, { title: doc.title, status: doc.status });
  return `admin.article.${docId}`;
}
async function saveSettings(form) {
  const v = readForm(form);
  if (!v.priceTiers?.length) throw new FormErr("가격 구간을 1개 이상 입력해 주세요.");
  const weights = {}, business = {};
  for (const k of Object.keys(v)) { if (k.startsWith("w_")) { weights[k.slice(2)] = v[k]; delete v[k]; } else if (k.startsWith("b_")) { business[k.slice(2)] = v[k] || ""; delete v[k]; } }
  const doc = { ...S.settings, ...v, curationWeights: weights, business, salesMode: "SHOWCASE" };
  await S.db.doc("cat/v1").set(doc);
  await audit("UPDATE", "settings", null, { showDemoData: doc.showDemoData, showReferencePrice: doc.showReferencePrice });
  return null;
}
async function saveNotice(form) {
  const v = readForm(form);
  if (!v.title || !v.version || !v.effectiveFrom || !v.body) throw new FormErr("제목·버전·시행일·본문을 모두 입력해 주세요.");
  const id = `${v.type.toLowerCase()}-${slugify(v.version) || "v"}-${Date.now().toString(36)}`;
  await S.db.doc(`cat/v1/notices/${id}`).set(v);
  await audit("CREATE", "notice", id, { type: v.type, version: v.version });
  form.reset();
  return null;
}
async function saveSettingsPatch(patch) {
  await S.db.doc("cat/v1").set({ ...S.settings, ...patch });
}

// 문의 접수: inq/<viewer id> 문서의 items 배열에 추가
async function submitInquiry(form) {
  const type = form.dataset.type, fd = new FormData(form), v = Object.fromEntries([...fd.entries()].map(([k, x]) => [k, String(x).trim()]));
  if (!v.name) throw new FormErr("이름을 입력해 주세요.");
  if (!v.email && !v.phone) throw new FormErr("이메일 또는 연락처 중 하나는 필요합니다.");
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) throw new FormErr("올바른 이메일을 입력해 주세요.");
  if (!v.consentPrivacy) throw new FormErr("개인정보 수집·이용에 동의해 주세요.");
  if (!S.db || !S.uid) throw new FormErr("claude.ai에 로그인한 상태에서만 접수할 수 있습니다.");
  const { name, email, phone, company, message, consentPrivacy, consentMarketing, ...extra } = v;
  void consentPrivacy;
  const item = JSON.parse(JSON.stringify({ type, at: new Date().toISOString(), name, email, phone, company, message, consentMarketing: !!consentMarketing, extra: Object.fromEntries(Object.entries(extra).filter(([, x]) => x)), status: "NEW" }));
  const ref = S.db.doc(`inq/${S.uid}`);
  let items = [];
  try { const snap = await ref.get(); items = snap.exists ? snap.data().items || [] : []; } catch {}
  try { await ref.set({ items: [...items, item].slice(-50), updatedAt: item.at }); }
  catch (err) { throw new FormErr(err?.code === "invalid_argument" ? "현재 권한으로는 접수할 수 없습니다. 아티팩트 소유자에게 Contributor 이상 권한을 요청해 주세요." : "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."); }
}

// ─── 렌더 ──────────────────────────────────────────────
function statusBar() {
  if (S.status === "connecting") return `<div class="bg-beige px-4 py-2 text-center text-xs text-charcoal/70">데이터를 불러오는 중입니다…</div>`;
  if (S.status === "offline") return `<div class="bg-beige px-4 py-2 text-center text-xs text-charcoal/70">claude.ai에 로그인한 상태에서 열면 상품·양조장 데이터가 표시됩니다.</div>`;
  if (S.status === "ready" && !Object.keys(S.products).length && S.loaded.products) return `<div class="bg-beige px-4 py-2 text-center text-xs text-charcoal/70">등록된 상품이 아직 없습니다.</div>`;
  return "";
}
function view(r) {
  switch (r.name) {
    case "home": return vHome();
    case "collection": case "masters": case "limited": return vCollection(r.name);
    case "product": return vProduct(r.arg);
    case "breweries": return vBreweries();
    case "brewery": return vBrewery(r.arg);
    case "gift": return vGift(r.arg);
    case "taste": return vTaste();
    case "magazine": return vMagazine(r.arg);
    case "article": return vArticle(r.arg);
    case "corporate": return vCorporate();
    case "partnership": return vPartnership();
    case "support": return vSupport();
    case "story": return vStory();
    case "legal": return vLegal(r.arg);
    default: return vNotFound();
  }
}
function adminView(r) {
  const [sec, ...rest] = r.arg.split(".");
  const arg = rest.join(".");
  switch (sec) {
    case "": return aDashboard();
    case "products": return aProducts();
    case "product": return aProductForm(arg);
    case "product-new": return aProductForm("");
    case "breweries": return aBreweries();
    case "brewery": return aBreweryForm(arg);
    case "brewery-new": return aBreweryForm("");
    case "selection": return aSelection();
    case "featured": return aFeatured();
    case "profitability": return aProfit();
    case "magazine": return aMagazine();
    case "article": return aArticleForm(arg);
    case "article-new": return aArticleForm("");
    case "inquiries": return aInquiries();
    case "legal": return aLegal();
    case "settings": return aSettings();
    default: return aDashboard();
  }
}
function render() {
  const r = route();
  const app = document.getElementById("app");
  if (r.name === "admin") {
    if (!S.isAdmin) { app.innerHTML = statusBar() + header(r) + `<div class="container-site py-24 text-center"><h1 class="font-kserif text-2xl">관리자 전용 화면입니다.</h1><p class="mt-4 text-sm text-charcoal/60">${S.status === "connecting" ? "권한을 확인하는 중입니다…" : "이 아티팩트의 소유자 또는 편집자(Editor)만 관리자 화면을 사용할 수 있습니다."}</p><a href="#" class="btn-ghost mt-8">홈으로</a></div>`; return; }
    app.innerHTML = adminShell(r, adminView(r));
  } else {
    app.innerHTML = statusBar() + header(r) + `<main>${view(r)}</main>` + footer();
  }
  document.title = `${S.settings.brandName}${r.name === "admin" ? " · 관리자" : ""}`;
}
let lastRoute = "";
function onRoute() {
  const key = location.hash;
  S.dirty = false;
  if (key !== lastRoute) { if (!/^#(collection|masters|limited)/.test(key) || !/^#(collection|masters|limited)/.test(lastRoute)) S.f = { q: "", type: "", taste: [], occasion: "", min: "", sort: "" }; lastRoute = key; window.scrollTo(0, 0); }
  render();
}
// 다른 사람이 저장해 새 데이터가 와도, 편집 중인 폼은 덮어쓰지 않음
function onData() { if (S.dirty) return; const y = window.scrollY; render(); window.scrollTo(0, y); }

// ─── 이벤트 ─────────────────────────────────────────────
document.addEventListener("click", async (ev) => {
  const t = ev.target.closest("[data-act]");
  if (!t) return;
  const act = t.dataset.act, v = t.dataset.v;
  const q = S.quiz;
  const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  switch (act) {
    case "tier": S.f = { ...S.f, min: v }; lastRoute = "#collection"; return;
    case "taste-link": S.f = { ...S.f, taste: [v] }; lastRoute = "#collection"; return;
    case "ftype": S.f.type = v; return rerender();
    case "ftaste": S.f.taste = S.f.taste.includes(v) ? S.f.taste.filter((x) => x !== v) : [...S.f.taste, v]; return rerender();
    case "fmin": S.f.min = String(S.f.min) === v ? "" : v; return rerender();
    case "freset": S.f = { q: "", type: "", taste: [], occasion: "", min: "", sort: "" }; return rerender();
    case "q-taste": q.tastes = q.tastes.includes(v) ? q.tastes.filter((x) => x !== v) : [...q.tastes, v]; return rerender();
    case "q-type": q.types = q.types.includes(v) ? q.types.filter((x) => x !== v) : [...q.types, v]; return rerender();
    case "q-food": q.food = q.food === v ? "" : v; return rerender();
    case "q-purpose": q.purpose = v; return rerender();
    case "q-budget": { const tiers = S.settings.priceTiers || []; const i = Number(v); q.budget = i === 0 ? null : [tiers[i - 1], tiers[i] ? tiers[i] - 1 : 0]; return rerender(); }
    case "q-prev": q.step = Math.max(0, q.step - 1); return rerender();
    case "q-next": q.step++; return rerender();
    case "q-go": q.results = recommend(q); window.scrollTo(0, 0); return render();
    case "q-reset": S.quiz = { step: 0, tastes: [], types: [], food: "", purpose: "", budget: null, results: null }; return rerender();
    case "sent-reset": delete S.sent[v]; return rerender();
    case "sel-add": {
      const slot = document.getElementById("sel-slot").value;
      const ids = [...document.querySelectorAll("[data-pick]:checked")].map((x) => x.dataset.pick);
      if (!ids.length) return toast("추가할 상품을 선택해 주세요.");
      const fe = { ...S.settings.featured }; fe[slot] = [...new Set([...(fe[slot] || []), ...ids])];
      await saveSettingsPatch({ featured: fe }); return toast(`${SLOTS[slot]}에 ${ids.length}개 추가했습니다.`);
    }
    case "slot-add": { const sel = document.getElementById(`slot-add-${t.dataset.slot}`); if (!sel.value) return; const fe = { ...S.settings.featured }; fe[t.dataset.slot] = [...(fe[t.dataset.slot] || []), sel.value]; await saveSettingsPatch({ featured: fe }); return toast("추가했습니다."); }
    case "slot-del": { const fe = { ...S.settings.featured }; fe[t.dataset.slot] = fe[t.dataset.slot].filter((_, i) => i !== Number(t.dataset.i)); await saveSettingsPatch({ featured: fe }); return toast("삭제했습니다."); }
    case "slot-move": { const fe = { ...S.settings.featured }, arr = [...fe[t.dataset.slot]], i = Number(t.dataset.i), j = i + Number(t.dataset.d); if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; fe[t.dataset.slot] = arr; await saveSettingsPatch({ featured: fe }); return; }
    case "notice-del": { const n = S.notices[v]; if (!n || new Date(n.effectiveFrom) <= new Date()) return; await S.db.doc(`cat/v1/notices/${v}`).delete(); await audit("DELETE", "notice", v); return toast("삭제했습니다."); }
  }
});

document.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.dataset.f) { S.f[el.dataset.f] = el.value; const pos = el.selectionStart; render(); const again = document.getElementById(el.id); if (again && el.tagName === "INPUT") { again.focus(); try { again.setSelectionRange(pos, pos); } catch {} } return; }
  if (el.dataset.sel) { S.sel[el.dataset.sel] = el.type === "checkbox" ? el.checked : el.value; const id = el.dataset.sel; render(); const again = document.querySelector(`[data-sel="${id}"]`); if (again && el.type !== "checkbox") again.focus(); return; }
  const form = el.closest("form[data-form]");
  if (form && ["product", "brewery", "article", "settings", "notice"].includes(form.dataset.form)) {
    S.dirty = true;
    if (form.dataset.form === "product") { try { const v = readForm(form); const box = document.getElementById("econ-preview"); if (box) box.innerHTML = econPreview({ ...v, commissionRate: v.commissionRate ?? "" }); } catch {} }
  }
});
document.addEventListener("change", async (ev) => {
  const el = ev.target;
  if (el.dataset.f && el.tagName === "SELECT") { S.f[el.dataset.f] = el.value; return render(); }
  if (el.dataset.inqStatus) {
    const [docId, idx] = el.dataset.inqStatus.split("|");
    const d = S.inquiries.find((x) => x.id === docId); if (!d) return;
    const items = (d.items || []).map((it, i) => (i === Number(idx) ? { ...it, status: el.value } : it));
    try { const { id: _drop, ...rest } = d; void _drop; await S.db.doc(`inq/${docId}`).set({ ...rest, items }); toast("상태를 변경했습니다."); } catch { toast("변경하지 못했습니다."); }
  }
  if (ev.target.closest("form[data-form]")?.dataset.form === "product") ev.target.dispatchEvent(new Event("input", { bubbles: true }));
});

document.addEventListener("submit", async (ev) => {
  const form = ev.target.closest("form[data-form]");
  if (!form) return;
  ev.preventDefault();
  const kind = form.dataset.form;
  const handlers = { inquiry: submitInquiry, product: saveProduct, quick: quickSave, brewery: saveBrewery, article: saveArticle, settings: saveSettings, notice: saveNotice };
  if (kind !== "inquiry" && !S.isAdmin) return toast("관리자만 저장할 수 있습니다.");
  const btn = form.querySelector("button:not([type=button])");
  if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "저장 중…"; }
  try {
    const next = await handlers[kind](form);
    S.dirty = false;
    if (kind === "inquiry") { S.sent[form.dataset.type] = true; render(); return; }
    toast("저장되었습니다. 고객 화면에 반영되었습니다.");
    if (next && location.hash !== `#${next}`) location.hash = next; else render();
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
    formError(form, err instanceof FormErr ? err.message : err?.code === "invalid_argument" ? "권한이 없거나 입력값이 올바르지 않습니다." : "저장 중 오류가 발생했습니다.");
    if (!(err instanceof FormErr)) console.error(err);
  }
});
window.addEventListener("hashchange", onRoute);

// ─── 저장소 연결 ─────────────────────────────────────────
async function init() {
  lastRoute = location.hash;
  render();
  const c = window.claude;
  if (!c || typeof c.use !== "function") { S.status = "offline"; return render(); }
  const [db, user] = await Promise.all([c.use("db"), c.use("user")]);
  if (!db) { S.status = "offline"; return render(); }
  S.db = db; S.user = user;
  if (user) { S.isAdmin = await user.canEdit(); S.uid = await user.id(); }
  const fail = (e2) => { console.warn("db", e2?.code); };
  db.doc("cat/v1").onSnapshot((s) => { const d = s.exists ? s.data() : {}; S.settings = { ...DEFAULT_SETTINGS, ...d, business: { ...DEFAULT_SETTINGS.business, ...(d.business || {}) }, featured: { ...DEFAULT_SETTINGS.featured, ...(d.featured || {}) } }; S.loaded.settings = true; ready(); }, fail);
  const coll = (name) => db.collection(`cat/v1/${name}`).onSnapshot((qs) => { S[name] = Object.fromEntries(qs.docs.map((d) => [d.id, { ...d.data(), id: d.id }])); S.loaded[name] = true; ready(); }, fail);
  ["products", "breweries", "articles", "notices"].forEach(coll);
  if (S.isAdmin) db.collection("inq").onSnapshot((qs) => { S.inquiries = qs.docs.map((d) => ({ ...d.data(), id: d.id })); onData(); }, fail);
}
function ready() { if (Object.values(S.loaded).every(Boolean)) S.status = "ready"; onData(); }
init();
