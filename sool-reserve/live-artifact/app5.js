// ─── 저장소 분리: 공개(cat) / 관리자 전용(ops) ─────────────────
// 수수료·매입가·공급처·평가 점수·서류는 ops에만 저장 → 일반 방문자는 읽을 수 없음
const INTERNAL_P = ["vatBasis", "commissionRate", "pgRate", "pgBearer", "platformShippingCost", "platformPromoCost", "otherVariableCost", "wholesaleCost", "supplierId", "expectedMonthlyUnits", "eligibilityNote", "scoreNote", ...SCORES.map((x) => x[0])];
const INTERNAL_B = ["compliance", "supplyTerms", "defaultCommissionRate", "salesEnabled"];
function splitDoc(doc, keys) {
  const pub = {}, priv = {};
  for (const [k, v] of Object.entries(doc)) { if (k === "id" || v === undefined) continue; (keys.includes(k) ? priv : pub)[k] = v; }
  return [pub, priv];
}
async function writeProduct(id, doc) {
  const [pub, priv] = splitDoc(doc, INTERNAL_P);
  await S.db.doc(`cat/v1/products/${id}`).set(JSON.parse(JSON.stringify(pub)));
  await S.db.doc(`ops/v1/products/${id}`).set(JSON.parse(JSON.stringify(priv)));
}
async function writeBrewery(id, doc) {
  const [pub, priv] = splitDoc(doc, INTERNAL_B);
  await S.db.doc(`cat/v1/breweries/${id}`).set(JSON.parse(JSON.stringify(pub)));
  await S.db.doc(`ops/v1/breweries/${id}`).set(JSON.parse(JSON.stringify(priv)));
}
function remerge() {
  const m = (cat, ops) => Object.fromEntries(Object.entries(cat).map(([id, x]) => [id, { ...x, ...(ops[id] || {}), id }]));
  S.products = m(S.cat.products, S.ops.products);
  S.breweries = m(S.cat.breweries, S.ops.breweries);
}

// ─── 매입형 수익 (Next.js lib/economics.ts calcWholesale과 동일) ───────
function calcWholesale(i) {
  const price = Math.max(0, Math.round(i.price || 0));
  const netSales = Math.floor((price * 10) / 11);
  const missingCost = i.wholesaleCost == null || i.wholesaleCost === "";
  const netCost = missingCost ? 0 : Math.floor((Math.max(0, Number(i.wholesaleCost)) * 10) / 11);
  const grossMargin = netSales - netCost;
  const pgCost = Math.round((price * (i.pgRate || 0)) / 100);
  const contribution = grossMargin - pgCost - (i.platformShippingCost || 0) - (i.platformPromoCost || 0) - (i.otherVariableCost || 0);
  const r1 = (n) => Math.round(n * 10) / 10;
  return { netSales, netCost, grossMargin, pgCost, contribution, marginOnSales: netSales > 0 ? r1((contribution / netSales) * 100) : null, markup: netCost > 0 ? r1(((netSales - netCost) / netCost) * 100) : null, missingCost };
}
const sellerLabelOf = (p) => (p.tradeModel === "WHOLESALE" ? `${S.settings.brandName} 직매입` : S.breweries[p.brewery]?.name || "");

// ─── 비공개 테스트 주문 (PRIVATE_TEST · 관리자만 · Mock 결제/인증) ─────────
const commerceOn = () => S.settings.salesMode === "PRIVATE_TEST" && S.isAdmin;
const canOrderP = (p) => commerceOn() && p.status === "PUBLISHED" && p.eligibility === "VERIFIED" && (p.stock || 0) > 0;
const CART_KEY = "sr_live_cart_v1";
function readCart() { try { const v = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); return Array.isArray(v) ? v.filter((x) => x && x.id && x.qty > 0) : []; } catch { return []; } }
function writeCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch {} S.cartN = c.reduce((a, x) => a + x.qty, 0); }
function addCart(id, qty) { const c = readCart(); const cur = c.find((x) => x.id === id); if (cur) cur.qty = Math.min(24, cur.qty + qty); else c.push({ id, qty: Math.min(24, qty) }); writeCart(c); }

function quote(cart) {
  const lines = cart.map((c) => {
    const p = S.products[c.id];
    if (!p) return null;
    let error = null;
    if (!canOrderP(p)) error = p.eligibility === "INELIGIBLE" ? "온라인 판매 대상이 아닌 상품입니다." : (p.stock || 0) <= 0 ? "품절된 상품입니다." : "현재 주문할 수 없는 상품입니다.";
    else if (c.qty > p.stock) error = `재고가 ${p.stock}병 남았습니다.`;
    const wholesale = p.tradeModel === "WHOLESALE";
    return { p, qty: c.qty, unit: p.price, total: p.price * c.qty, key: wholesale ? "operator" : `brewery:${p.brewery}`, label: sellerLabelOf(p), wholesale, error };
  }).filter(Boolean);
  const groups = [];
  for (const l of lines.filter((x) => !x.error)) {
    let g = groups.find((x) => x.key === l.key);
    if (!g) { g = { key: l.key, label: l.label, subtotal: 0, ship: 0 }; groups.push(g); }
    g.subtotal += l.total; g.ship = Math.max(g.ship, l.p.shippingFee || 0);
  }
  const subtotal = groups.reduce((a, g) => a + g.subtotal, 0), ship = groups.reduce((a, g) => a + g.ship, 0);
  return { lines, groups, subtotal, ship, total: subtotal + ship, hasErrors: lines.some((l) => l.error) };
}
const thumb = (p) => `<div class="bottle flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden bg-beige md:h-28 md:w-24 [&_svg]:h-[80%]">${p.imageUrl ? `<img src="${e(p.imageUrl)}" alt="${e(p.name)}" class="h-full w-full object-cover">` : ART[`bottle_${p.liquorType}`]}</div>`;

function addToCartBlock(p) {
  const max = Math.min(p.stock || 0, 24);
  return `<div class="mt-8 space-y-3"><p class="inline-flex items-center gap-2 border border-burgundy/30 bg-burgundy/5 px-2.5 py-1 text-[11px] tracking-wider text-burgundy"><span class="h-1.5 w-1.5 rounded-full bg-burgundy"></span>비공개 테스트 · 관리자에게만 보이며 실제 결제되지 않습니다</p>
  <div class="flex items-stretch gap-3"><div class="flex items-center border border-charcoal/25" role="group" aria-label="수량"><button type="button" data-act="qty" data-v="-1" class="h-full px-4 text-lg" aria-label="수량 줄이기">−</button><span id="qty" data-max="${max}" class="w-8 text-center font-serif text-lg tabular-nums">1</span><button type="button" data-act="qty" data-v="1" class="h-full px-4 text-lg" aria-label="수량 늘리기">+</button></div>
  <button type="button" data-act="add-cart" data-v="${e(p.id)}" class="btn-primary flex-1">장바구니 담기</button></div>
  <p class="text-xs text-charcoal/50">재고 ${p.stock}병 · 1회 최대 24병</p><p id="added" class="hidden items-center justify-between border-t border-line pt-3 text-sm">장바구니에 담았습니다.<a href="#cart" class="text-burgundy underline-offset-4 hover:underline">장바구니 보기 →</a></p></div>`;
}

function vCart() {
  if (!commerceOn()) return vNotFound();
  const cart = readCart();
  const q = quote(cart);
  if (!q.lines.length) return `<div class="container-site flex flex-col items-center py-28 text-center"><p class="eyebrow">Cart</p><p class="mt-4 font-kserif text-2xl font-light">장바구니가 비어 있습니다.</p><a href="#collection" class="btn-primary mt-10">컬렉션 살펴보기</a></div>`;
  const keys = [...new Set(q.lines.map((l) => l.key))];
  return `<div class="container-site pb-10 pt-12 md:pt-20"><p class="eyebrow">Cart</p><h1 class="h-display mb-12 mt-4">장바구니</h1><div class="grid gap-12 lg:grid-cols-12 lg:gap-16"><div class="lg:col-span-8">
  ${keys.map((k) => { const ls = q.lines.filter((l) => l.key === k), g = q.groups.find((x) => x.key === k); return `<section class="mb-10"><div class="flex items-baseline justify-between border-b border-charcoal pb-3"><h2 class="text-sm"><span class="text-charcoal/50">판매자</span> <span class="ml-1 font-medium">${e(ls[0].label)}</span></h2>${g ? `<span class="text-xs text-charcoal/50">배송비 ${g.ship ? won(g.ship) : "무료"}</span>` : ""}</div>
    <ul class="divide-y divide-line">${ls.map((l) => `<li class="flex gap-4 py-5 md:gap-6"><a href="#product.${e(l.p.id)}">${thumb(l.p)}</a><div class="flex min-w-0 flex-1 flex-col justify-between gap-3 md:flex-row md:items-center"><div class="min-w-0"><p class="text-[11px] tracking-wider text-charcoal/50">${e(S.breweries[l.p.brewery]?.name)}</p><a href="#product.${e(l.p.id)}" class="mt-1 block font-kserif text-base hover:text-burgundy">${e(l.p.name)}</a><p class="mt-1 text-xs text-charcoal/50">${won(l.unit)}</p>${l.error ? `<p class="mt-2 text-xs text-burgundy">${l.error}</p>` : ""}</div>
      <div class="flex items-center gap-5"><div class="flex items-center border border-charcoal/20"><button data-act="cart-qty" data-id="${e(l.p.id)}" data-v="-1" class="px-3 py-1.5" aria-label="수량 줄이기">−</button><span class="w-7 text-center text-sm tabular-nums">${l.qty}</span><button data-act="cart-qty" data-id="${e(l.p.id)}" data-v="1" class="px-3 py-1.5" aria-label="수량 늘리기">+</button></div><span class="w-24 text-right font-serif text-lg tabular-nums">${won(l.total)}</span><button data-act="cart-del" data-id="${e(l.p.id)}" class="text-xs text-charcoal/45 hover:text-charcoal">삭제</button></div></div></li>`).join("")}</ul></section>`; }).join("")}
  <p class="text-xs leading-relaxed text-charcoal/50">판매자가 다른 상품은 각 판매자가 따로 출고하며, 배송비도 판매자별로 부과됩니다.</p></div>
  <aside class="lg:col-span-4"><div class="sticky top-28 border border-line bg-white/70 p-6 md:p-8"><h2 class="font-kserif text-lg">주문 요약</h2><dl class="mt-6 space-y-3 text-sm"><div class="flex justify-between"><dt class="text-charcoal/60">상품 금액</dt><dd class="tabular-nums">${won(q.subtotal)}</dd></div><div class="flex justify-between"><dt class="text-charcoal/60">배송비</dt><dd class="tabular-nums">${q.ship ? won(q.ship) : "무료"}</dd></div></dl>
  <div class="mt-6 flex items-baseline justify-between border-t border-charcoal pt-5"><span class="text-sm">결제 예정 금액</span><span class="font-serif text-2xl tabular-nums">${won(q.total)}</span></div>${q.hasErrors ? `<p class="mt-4 text-xs text-burgundy">주문할 수 없는 상품을 정리한 뒤 진행해 주세요.</p>` : ""}
  <a href="#checkout" class="btn-primary mt-6 w-full ${q.hasErrors ? "pointer-events-none opacity-40" : ""}">주문하기</a><p class="mt-4 text-center text-[11px] text-burgundy">비공개 테스트 모드 · 실제 결제되지 않습니다</p></div></aside></div></div>`;
}

function vCheckout() {
  if (!commerceOn()) return vNotFound();
  const q = quote(readCart());
  if (!q.lines.length) return `<p class="container-site py-24 text-center text-sm text-charcoal/55">장바구니가 비어 있습니다.</p>`;
  const ageOk = S.ageUntil && S.ageUntil > Date.now();
  const gw = S.giftWrapOn ? S.settings.giftWrapFee || 0 : 0;
  const inp = "w-full border-b border-charcoal/25 bg-transparent py-3 text-[15px] outline-none placeholder:text-charcoal/30 focus:border-charcoal";
  const step = (n, t, done, body) => `<section class="border-t border-charcoal pt-6"><h2 class="flex items-center gap-3 font-kserif text-lg"><span class="flex h-7 w-7 items-center justify-center rounded-full font-serif text-sm ${done ? "bg-burgundy text-ivory" : "border border-charcoal/30"}">${done ? "✓" : n}</span>${t}</h2><div class="mt-6">${body}</div></section>`;
  return `<div class="container-site pb-10 pt-12 md:pt-20"><p class="eyebrow">Checkout · Private Test</p><h1 class="h-display mb-12 mt-4">주문 · 결제</h1>
  <form data-form="checkout" class="grid gap-12 lg:grid-cols-12 lg:gap-16" novalidate><div class="space-y-12 lg:col-span-7">
  ${step(1, "성인 인증", ageOk, ageOk ? `<p class="text-sm text-charcoal/70">인증되었습니다. <span class="text-charcoal/45">(테스트 인증 · ${new Date(S.ageUntil).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}까지 유효)</span></p>` : `<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p class="max-w-sm text-sm leading-relaxed text-charcoal/65">주류는 만 19세 이상만 구매할 수 있습니다. 결제 전 본인 확인 기반 성인 인증이 필요하며, 인증 결과는 성인 여부와 인증 시각만 저장합니다.</p><button type="button" data-act="age-verify" class="btn-ghost shrink-0">테스트 인증 진행</button></div>`)}
  ${step(2, "배송 정보", false, `<div class="grid gap-x-8 gap-y-6 md:grid-cols-2"><label><span class="text-xs text-charcoal/55">받는 분 *</span><input name="recipientName" class="${inp}" value="${e(S.co?.recipientName)}"></label><label><span class="text-xs text-charcoal/55">연락처 *</span><input name="recipientPhone" type="tel" placeholder="010-0000-0000" class="${inp}" value="${e(S.co?.recipientPhone)}"></label><label><span class="text-xs text-charcoal/55">우편번호</span><input name="postalCode" class="${inp}" value="${e(S.co?.postalCode)}"></label><label><span class="text-xs text-charcoal/55">희망 배송일</span><input name="desiredDate" type="date" class="${inp}" value="${e(S.co?.desiredDate)}"></label><label class="md:col-span-2"><span class="text-xs text-charcoal/55">주소 *</span><input name="address" class="${inp}" value="${e(S.co?.address)}"></label><label class="md:col-span-2"><span class="text-xs text-charcoal/55">상세 주소</span><input name="addressDetail" class="${inp}" value="${e(S.co?.addressDetail)}"></label><label class="md:col-span-2"><span class="text-xs text-charcoal/55">배송 요청 사항</span><input name="deliveryNote" placeholder="예: 부재 시 경비실" class="${inp}" value="${e(S.co?.deliveryNote)}"></label></div><p class="mt-4 text-xs text-charcoal/50">수령 시 받는 분의 성인 여부를 확인할 수 있습니다. 미성년자에게는 전달되지 않습니다.</p>`)}
  ${step(3, "선물 포장", S.giftWrapOn, `<label class="flex cursor-pointer items-start gap-3"><input type="checkbox" data-act="gift-toggle" ${S.giftWrapOn ? "checked" : ""} class="mt-1 accent-burgundy"><span><span class="text-sm">한지·보자기 선물 포장 + 쇼핑백</span><span class="ml-2 text-xs text-charcoal/50">+${won(S.settings.giftWrapFee || 0)}</span></span></label>${S.giftWrapOn ? `<label class="mt-5 block"><span class="text-xs text-charcoal/55">메시지 카드 (선택, 200자)</span><textarea name="giftMessage" rows="3" maxlength="200" class="${inp} resize-none" placeholder="마음을 전할 한 줄을 적어 주세요.">${e(S.co?.giftMessage)}</textarea></label>` : ""}`)}
  ${step(4, "결제", false, `<div class="border border-line bg-white/60 p-5 text-sm"><p class="font-medium">테스트 결제 (Mock)</p><p class="mt-1 text-xs text-charcoal/55">비공개 테스트 모드입니다. 실제 결제·카드 승인이 일어나지 않으며 주문은 테스트 주문으로 기록됩니다.</p></div><label class="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" name="agree" class="mt-1 accent-burgundy"><span>주문 상품과 결제 금액을 확인했으며 결제 진행에 동의합니다. 만 19세 미만은 구매할 수 없습니다.</span></label>`)}
  </div><aside class="lg:col-span-5"><div class="sticky top-28 border border-line bg-white/70 p-6 md:p-8"><h2 class="font-kserif text-lg">주문 상품</h2><ul class="mt-5 divide-y divide-line">${q.lines.map((l) => `<li class="flex items-center gap-4 py-4">${thumb(l.p)}<div class="min-w-0 flex-1"><p class="text-[11px] text-charcoal/50">${e(l.label)}</p><p class="truncate font-kserif">${e(l.p.name)}</p><p class="text-xs text-charcoal/50">${won(l.unit)} × ${l.qty}</p>${l.error ? `<p class="text-xs text-burgundy">${l.error}</p>` : ""}</div><span class="font-serif tabular-nums">${won(l.total)}</span></li>`).join("")}</ul>
  <dl class="mt-4 space-y-2.5 border-t border-line pt-5 text-sm"><div class="flex justify-between"><dt class="text-charcoal/60">상품 금액</dt><dd class="tabular-nums">${won(q.subtotal)}</dd></div>${q.groups.map((g) => `<div class="flex justify-between text-xs"><dt class="text-charcoal/50">배송비 · ${e(g.label)}</dt><dd class="tabular-nums text-charcoal/60">${g.ship ? won(g.ship) : "무료"}</dd></div>`).join("")}${gw ? `<div class="flex justify-between"><dt class="text-charcoal/60">선물 포장</dt><dd class="tabular-nums">${won(gw)}</dd></div>` : ""}</dl>
  <div class="mt-5 flex items-baseline justify-between border-t border-charcoal pt-5"><span class="text-sm">총 결제 금액</span><span class="font-serif text-2xl tabular-nums">${won(q.total + gw)}</span></div><p data-err class="mt-4 hidden bg-burgundy/5 px-3 py-2 text-sm text-burgundy" role="alert"></p><button class="btn-primary mt-6 w-full" ${q.hasErrors ? "disabled" : ""}>${won(q.total + gw)} 테스트 결제</button></div></aside></form></div>`;
}

async function bumpStock(id, d) {
  const ref = S.db.doc(`cat/v1/products/${id}`), snap = await ref.get();
  if (!snap.exists) return;
  const cur = snap.data();
  await ref.set({ ...cur, stock: Math.max(0, (cur.stock || 0) + d) });
}
const orderNo = () => { const d = new Date(); return `SR${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`; };
async function placeOrder(form) {
  if (!commerceOn()) throw new FormErr("현재 주문 기능을 사용할 수 없습니다.");
  const v = Object.fromEntries([...new FormData(form).entries()].map(([k, x]) => [k, String(x).trim()]));
  S.co = v;
  if (!(S.ageUntil && S.ageUntil > Date.now())) throw new FormErr("성인 인증을 먼저 진행해 주세요.");
  if (!v.recipientName || !v.address || !/^[0-9+\-\s()]{7,20}$/.test(v.recipientPhone || "")) throw new FormErr("받는 분 이름·연락처·주소를 확인해 주세요.");
  if (!v.agree) throw new FormErr("주문 내용 확인 및 결제 진행에 동의해 주세요.");
  const q = quote(readCart());
  if (!q.lines.length) throw new FormErr("주문할 상품이 없습니다.");
  if (q.hasErrors) throw new FormErr(q.lines.find((l) => l.error).error);
  // 재고 차감: 최신 재고를 다시 읽어 확인 후 반영 (테스트 환경 — 관리자 1인 기준)
  for (const l of q.lines) { const snap = await S.db.doc(`cat/v1/products/${l.p.id}`).get(); if ((snap.data()?.stock || 0) < l.qty) throw new FormErr(`${l.p.name} 재고가 부족합니다.`); }
  for (const l of q.lines) await bumpStock(l.p.id, -l.qty);
  const no = orderNo(), gw = S.giftWrapOn ? S.settings.giftWrapFee || 0 : 0;
  const sellers = q.groups.map((g) => {
    const ls = q.lines.filter((l) => l.key === g.key);
    let commission = 0, costTotal = 0;
    const items = ls.map((l) => { const ec = econ(l.p); if (l.wholesale) costTotal += (l.p.wholesaleCost || 0) * l.qty; else commission += ec.commission * l.qty; return { productId: l.p.id, name: l.p.name, qty: l.qty, unitPrice: l.unit, tradeModel: l.wholesale ? "WHOLESALE" : "COMMISSION", commissionRate: l.wholesale ? null : ec.commissionRate, unitCost: l.wholesale ? l.p.wholesaleCost ?? null : null }; });
    return { key: g.key, type: g.key === "operator" ? "OPERATOR" : "BREWERY", breweryId: g.key === "operator" ? null : g.key.slice(8), label: g.label, status: "PAID", subtotal: g.subtotal, shippingFee: g.ship, commission, costTotal, items, carrier: null, trackingNumber: null, shippedAt: null, deliveredAt: null, damage: null };
  });
  const order = { orderNumber: no, createdAt: new Date().toISOString(), status: "PAID", isTest: true, subtotal: q.subtotal, shippingFee: q.ship, giftWrapFee: gw, total: q.total + gw, recipient: { name: v.recipientName, phone: v.recipientPhone, postalCode: v.postalCode || null, address: v.address, addressDetail: v.addressDetail || null, deliveryNote: v.deliveryNote || null, desiredDate: v.desiredDate || null }, giftWrap: !!S.giftWrapOn, giftMessage: S.giftWrapOn ? v.giftMessage || null : null, age: { provider: "mock", at: new Date(S.ageUntil - 30 * 60000).toISOString() }, payment: { provider: "mock", ref: `MOCK-PAY-${no}`, status: "PAID", at: new Date().toISOString() }, sellers, by: S.uid };
  await S.db.doc(`ops/v1/orders/${no}`).set(order);
  await audit("PLACE_ORDER", "order", no, { total: order.total });
  writeCart([]); S.co = null; S.giftWrapOn = false;
  return `order.${no}`;
}

function vOrderDone(no) {
  const o = S.orders[no];
  if (!S.isAdmin || !o) return S.isAdmin && S.status !== "ready" ? "" : vNotFound();
  return `<div class="container-site max-w-3xl pb-10 pt-16 md:pt-24"><div class="text-center"><p class="eyebrow">Thank You</p><h1 class="h-display mt-4">주문이 접수되었습니다.</h1><p class="mt-5 text-sm text-charcoal/60">주문번호 <span class="font-serif text-base text-charcoal">${e(o.orderNumber)}</span><span class="ml-2 border border-burgundy/40 px-1.5 py-0.5 text-[10px] text-burgundy">테스트 주문</span></p></div>
  <div class="mt-14 space-y-8">${o.sellers.map((s) => `<section class="border-t border-charcoal pt-5"><div class="flex items-baseline justify-between"><h2 class="text-sm"><span class="text-charcoal/50">판매자</span> <span class="ml-1 font-medium">${e(s.label)}</span></h2><span class="text-xs text-burgundy">${ORDER_ST[s.status]}</span></div><ul class="mt-3 divide-y divide-line text-sm">${s.items.map((i) => `<li class="flex justify-between py-3"><span>${e(i.name)} <span class="text-charcoal/45">× ${i.qty}</span></span><span class="tabular-nums">${won(i.unitPrice * i.qty)}</span></li>`).join("")}<li class="flex justify-between py-3 text-xs text-charcoal/55"><span>배송비</span><span class="tabular-nums">${s.shippingFee ? won(s.shippingFee) : "무료"}</span></li></ul></section>`).join("")}</div>
  <dl class="mt-8 grid gap-3 border-y border-line py-6 text-sm sm:grid-cols-2"><div><dt class="text-xs text-charcoal/50">받는 분</dt><dd class="mt-1">${e(o.recipient.name)} · ${e(o.recipient.phone)}</dd></div><div><dt class="text-xs text-charcoal/50">주소</dt><dd class="mt-1">${e(o.recipient.address)} ${e(o.recipient.addressDetail)}</dd></div>${o.giftWrap ? `<div class="sm:col-span-2"><dt class="text-xs text-charcoal/50">선물 포장 · 메시지 카드</dt><dd class="mt-1">${e(o.giftMessage || "메시지 없음")}</dd></div>` : ""}</dl>
  <div class="mt-6 flex items-baseline justify-between"><span class="text-sm">총 결제 금액</span><span class="font-serif text-3xl tabular-nums">${won(o.total)}</span></div><p class="mt-2 text-right text-xs text-charcoal/50">테스트 결제 (실제 승인 없음)</p>
  <div class="mt-14 flex flex-wrap justify-center gap-3"><a href="#collection" class="btn-ghost">계속 둘러보기</a><a href="#admin.order.${e(o.orderNumber)}" class="btn-primary">관리자에서 주문 보기</a></div></div>`;
}

// ─── 관리자: 주문 · 정산 · 공급처 · 발주 ─────────────────────────
const ORDER_ST = { PENDING: "결제 대기", PAID: "결제 완료", PREPARING: "상품 준비 중", SHIPPED: "배송 중", DELIVERED: "배송 완료", CANCELLED: "주문 취소", REFUNDED: "환불 완료" };
const ST_TONE = { PAID: "r", PREPARING: "w", SHIPPED: "r", DELIVERED: "g", CANCELLED: "b", REFUNDED: "b", PENDING: "w" };
const FLOW = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"];
const stepper = (s) => (FLOW.indexOf(s) < 0 ? `<span class="text-xs text-[#9B1C1C]">${ORDER_ST[s]}</span>` : `<ol class="flex flex-wrap items-center gap-1 text-[11px]">${FLOW.map((f, i) => `<li class="flex items-center gap-1"><span class="rounded px-1.5 py-0.5 ${i <= FLOW.indexOf(s) ? "bg-burgundy text-white" : "bg-[#EEE9E0] text-charcoal/50"}">${ORDER_ST[f]}</span>${i < 3 ? `<span class="text-charcoal/30">›</span>` : ""}</li>`).join("")}</ol>`);

function aOrders() {
  const all = Object.values(S.orders).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const tab = S.orderTab || "";
  const list = all.filter((o) => !tab || (tab === "CANCELLED" ? ["CANCELLED", "REFUNDED"].includes(o.status) : o.status === tab));
  const paid = all.filter((o) => !["CANCELLED", "REFUNDED"].includes(o.status));
  const kpi = [["결제 완료 주문", `${paid.length}건`], ["결제 금액", won(paid.reduce((a, o) => a + o.total, 0))], ["출고 대기", `${all.filter((o) => o.status === "PAID" || o.status === "PREPARING").length}건`], ["취소·환불", `${all.length - paid.length}건`]];
  return `${ptitle("주문 관리", S.settings.salesMode === "PRIVATE_TEST" ? "비공개 테스트 모드 — 관리자 테스트 주문만 생성됩니다 (Mock 결제)." : "현재 SHOWCASE 모드입니다. 시스템 설정에서 PRIVATE_TEST로 바꾸면 관리자 계정으로 주문 흐름을 테스트할 수 있습니다.")}
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">${kpi.map(([l, v]) => `<div class="adm-card"><p class="text-xs text-charcoal/55">${l}</p><p class="mt-2 text-xl font-semibold tabular-nums">${v}</p></div>`).join("")}</div>
  <div class="mb-4 mt-6 flex flex-wrap gap-2">${[["", "전체"], ["PAID", "결제 완료"], ["PREPARING", "준비 중"], ["SHIPPED", "배송 중"], ["DELIVERED", "배송 완료"], ["CANCELLED", "취소·환불"]].map(([k, l]) => `<button data-act="order-tab" data-v="${k}" class="adm-btn-ghost py-1 ${tab === k ? "border-charcoal" : ""}">${l}</button>`).join("")}</div>
  <div class="adm-card overflow-x-auto p-0"><table class="adm-table min-w-[820px]"><thead><tr><th>주문번호</th><th>주문 일시</th><th>받는 분</th><th>판매자</th><th class="text-right">결제 금액</th><th>상태</th></tr></thead><tbody>${list.map((o) => `<tr><td><a href="#admin.order.${e(o.orderNumber)}" class="font-medium tabular-nums hover:underline">${e(o.orderNumber)}</a> ${pill("테스트")}</td><td class="whitespace-nowrap text-xs">${new Date(o.createdAt).toLocaleString("ko-KR")}</td><td>${e(o.recipient.name)}</td><td class="text-xs">${o.sellers.map((s) => (s.type === "OPERATOR" ? "직매입" : e(s.label))).join(", ")}</td><td class="text-right tabular-nums">${won(o.total)}</td><td>${pill(ORDER_ST[o.status], ST_TONE[o.status])}</td></tr>`).join("")}</tbody></table>${list.length ? "" : `<p class="p-8 text-center text-sm text-charcoal/50">주문이 없습니다.</p>`}</div>`;
}

function aOrder(no) {
  const o = S.orders[no];
  if (!o) return `<p class="adm-card">주문을 찾을 수 없습니다.</p>`;
  const NEXT = { PAID: ["PREPARING", "상품 준비 시작"], PREPARING: ["SHIPPED", "출고 처리"], SHIPPED: ["DELIVERED", "배송 완료 처리"] };
  const canCancel = !["CANCELLED", "REFUNDED"].includes(o.status) && !o.sellers.some((s) => ["SHIPPED", "DELIVERED"].includes(s.status));
  return `${ptitle(`주문 ${e(o.orderNumber)}`, `${new Date(o.createdAt).toLocaleString("ko-KR")} · 테스트 주문 (Mock 결제)`, `<a href="#admin.orders" class="adm-btn-ghost">← 목록</a>`)}
  <div class="grid gap-4 lg:grid-cols-3"><div class="space-y-4 lg:col-span-2">${o.sellers.map((s, si) => { const op = s.type === "OPERATOR", nx = NEXT[s.status]; return `<section class="adm-card"><div class="flex flex-wrap items-center justify-between gap-2"><h2 class="text-sm font-semibold">${e(s.label)} ${op ? pill("매입형", "r") : pill("중개형")}</h2>${stepper(s.status)}</div>
    <table class="adm-table mt-3"><thead><tr><th>상품</th><th class="text-right">단가</th><th class="text-right">수량</th><th class="text-right">금액</th><th class="text-right">${op ? "매입 원가" : "수수료율"}</th></tr></thead><tbody>${s.items.map((i) => `<tr><td>${e(i.name)}</td><td class="text-right tabular-nums">${won(i.unitPrice)}</td><td class="text-right tabular-nums">${i.qty}</td><td class="text-right tabular-nums">${won(i.unitPrice * i.qty)}</td><td class="text-right tabular-nums">${op ? won((i.unitCost || 0) * i.qty) : `${i.commissionRate ?? "-"}%`}</td></tr>`).join("")}</tbody></table>
    <dl class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4"><div><dt class="text-xs text-charcoal/50">상품 금액</dt><dd class="tabular-nums">${won(s.subtotal)}</dd></div><div><dt class="text-xs text-charcoal/50">배송비</dt><dd class="tabular-nums">${won(s.shippingFee)}</dd></div><div><dt class="text-xs text-charcoal/50">${op ? "매출총이익 (VAT 포함)" : "플랫폼 수수료"}</dt><dd class="font-medium tabular-nums">${won(op ? s.subtotal - s.costTotal : s.commission)}</dd></div><div><dt class="text-xs text-charcoal/50">${op ? "매입 원가" : "판매자 정산 예정"}</dt><dd class="tabular-nums">${won(op ? s.costTotal : s.subtotal + s.shippingFee - s.commission)}</dd></div></dl>
    ${s.carrier ? `<p class="mt-3 text-sm">운송장 · ${e(s.carrier)} <span class="tabular-nums">${e(s.trackingNumber)}</span></p>` : ""}${s.damage ? `<p class="mt-2 rounded bg-[#F6E1E1] px-3 py-2 text-sm text-[#9B1C1C]">파손 신고 · ${e(s.damage)}</p>` : ""}
    <div class="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-2">${nx ? `<form data-form="advance" data-no="${e(o.orderNumber)}" data-i="${si}" data-next="${nx[0]}" class="space-y-2">${nx[0] === "SHIPPED" ? `<div class="grid grid-cols-2 gap-2"><input name="carrier" placeholder="택배사" class="adm-input"><input name="trackingNumber" placeholder="운송장 번호" class="adm-input"></div>` : ""}<button class="adm-btn">${nx[1]}</button><p data-err class="hidden text-sm text-[#9B1C1C]"></p></form>` : ""}${["SHIPPED", "DELIVERED"].includes(s.status) && !s.damage ? `<form data-form="damage" data-no="${e(o.orderNumber)}" data-i="${si}" class="space-y-2"><input name="damage" placeholder="파손 내용 (사진 접수 여부 등)" class="adm-input"><button class="adm-btn-ghost">파손 신고 기록</button><p data-err class="hidden text-sm text-[#9B1C1C]"></p></form>` : ""}</div></section>`; }).join("")}</div>
  <div class="space-y-4"><section class="adm-card"><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">주문 정보</h2>${pill(ORDER_ST[o.status], ST_TONE[o.status])}</div><dl class="mt-3 space-y-2 text-sm"><div class="flex justify-between"><dt class="text-charcoal/55">상품 금액</dt><dd class="tabular-nums">${won(o.subtotal)}</dd></div><div class="flex justify-between"><dt class="text-charcoal/55">배송비</dt><dd class="tabular-nums">${won(o.shippingFee)}</dd></div>${o.giftWrapFee ? `<div class="flex justify-between"><dt class="text-charcoal/55">선물 포장</dt><dd class="tabular-nums">${won(o.giftWrapFee)}</dd></div>` : ""}<div class="flex justify-between border-t border-line pt-2 font-semibold"><dt>결제 금액</dt><dd class="tabular-nums">${won(o.total)}</dd></div></dl>
    <dl class="mt-4 space-y-2 border-t border-line pt-3 text-sm"><div><dt class="text-xs text-charcoal/50">받는 분</dt><dd>${e(o.recipient.name)} · ${e(o.recipient.phone)}</dd></div><div><dt class="text-xs text-charcoal/50">주소</dt><dd>${o.recipient.postalCode ? `(${e(o.recipient.postalCode)}) ` : ""}${e(o.recipient.address)} ${e(o.recipient.addressDetail)}</dd></div>${o.recipient.deliveryNote ? `<div><dt class="text-xs text-charcoal/50">배송 요청</dt><dd>${e(o.recipient.deliveryNote)}</dd></div>` : ""}${o.giftWrap ? `<div><dt class="text-xs text-charcoal/50">선물 포장 · 메시지</dt><dd>${e(o.giftMessage || "메시지 없음")}</dd></div>` : ""}<div><dt class="text-xs text-charcoal/50">성인 인증</dt><dd>테스트 인증 완료 · 결제 시점 재확인</dd></div></dl></section>
    <section class="adm-card"><h2 class="text-sm font-semibold">결제</h2><p class="mt-3 flex items-center justify-between text-sm"><span>테스트 결제 <span class="text-xs text-charcoal/45">${e(o.payment.ref)}</span></span>${pill(o.payment.status === "PAID" ? "승인" : "환불", o.payment.status === "PAID" ? "g" : "b")}</p></section>
    ${canCancel ? `<section class="adm-card"><h2 class="text-sm font-semibold">주문 취소 · 환불</h2><p class="mt-1 text-xs text-charcoal/50">출고 전 주문만 취소할 수 있습니다. 재고가 복구되고 결제는 환불됩니다.</p><form data-form="cancel-order" data-no="${e(o.orderNumber)}" class="mt-3 space-y-2"><input name="reason" placeholder="취소 사유" class="adm-input"><button class="adm-btn">주문 취소</button><p data-err class="hidden text-sm text-[#9B1C1C]"></p></form></section>` : o.cancelReason ? `<p class="adm-card text-sm">취소 사유 · ${e(o.cancelReason)}</p>` : ""}</div></div>`;
}

async function advanceOrder(form) {
  const o = structuredClone(S.orders[form.dataset.no]); const s = o.sellers[Number(form.dataset.i)]; const next = form.dataset.next;
  if (FLOW.indexOf(next) !== FLOW.indexOf(s.status) + 1) throw new FormErr("배송 단계는 순서대로만 변경할 수 있습니다.");
  if (next === "SHIPPED") { const c = form.carrier.value.trim(), t = form.trackingNumber.value.trim(); if (!c || !t) throw new FormErr("택배사와 운송장 번호를 입력해 주세요."); s.carrier = c; s.trackingNumber = t; s.shippedAt = new Date().toISOString(); }
  if (next === "DELIVERED") s.deliveredAt = new Date().toISOString();
  s.status = next;
  o.status = FLOW[Math.min(...o.sellers.map((x) => FLOW.indexOf(x.status)).filter((x) => x >= 0))];
  delete o.id;
  await S.db.doc(`ops/v1/orders/${o.orderNumber}`).set(o);
  await audit("ORDER_" + next, "order", o.orderNumber);
}
async function reportDamage(form) {
  const o = structuredClone(S.orders[form.dataset.no]); const d = form.damage.value.trim();
  if (!d) throw new FormErr("파손 내용을 입력해 주세요.");
  o.sellers[Number(form.dataset.i)].damage = d; delete o.id;
  await S.db.doc(`ops/v1/orders/${o.orderNumber}`).set(o);
  await audit("ORDER_DAMAGE", "order", o.orderNumber, { note: d });
}
async function cancelOrder(form) {
  const o = structuredClone(S.orders[form.dataset.no]); const reason = form.reason.value.trim();
  if (!reason) throw new FormErr("취소 사유를 입력해 주세요.");
  if (o.sellers.some((s) => ["SHIPPED", "DELIVERED"].includes(s.status))) throw new FormErr("출고된 주문은 반품 절차로 처리해 주세요.");
  for (const s of o.sellers) for (const i of s.items) await bumpStock(i.productId, i.qty);
  o.status = "REFUNDED"; o.sellers.forEach((s) => (s.status = "REFUNDED")); o.payment = { ...o.payment, status: "REFUNDED", refundedAt: new Date().toISOString() }; o.cancelReason = reason; o.cancelledAt = new Date().toISOString(); delete o.id;
  await S.db.doc(`ops/v1/orders/${o.orderNumber}`).set(o);
  await audit("ORDER_CANCEL", "order", o.orderNumber, { reason });
}

function aSettlements() {
  const now = new Date();
  const m = S.settleMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [y, mo] = m.split("-").map(Number);
  const inMonth = (iso) => { if (!iso) return false; const d = new Date(new Date(iso).getTime() + 9 * 3600e3); return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === mo; };
  const bm = new Map(); const op = { n: 0, sales: 0, cost: 0, ship: 0 };
  for (const o of Object.values(S.orders)) for (const s of o.sellers) {
    if (s.status !== "DELIVERED" || !inMonth(s.deliveredAt)) continue;
    if (s.type === "OPERATOR") { op.n++; op.sales += s.subtotal; op.cost += s.costTotal; op.ship += s.shippingFee; }
    else { const b = bm.get(s.breweryId) || { name: s.label, n: 0, gross: 0, com: 0, dmg: 0 }; b.n++; b.gross += s.subtotal + s.shippingFee; b.com += s.commission; if (s.damage) b.dmg++; bm.set(s.breweryId, b); }
  }
  const bl = [...bm.values()].sort((a, b) => b.gross - a.gross);
  const refunds = Object.values(S.orders).filter((o) => o.status === "REFUNDED" && inMonth(o.cancelledAt));
  const shift = (d) => { const t = new Date(y, mo - 1 + d, 1); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`; };
  return `${ptitle("정산", "배송 완료 기준 월별 정산 리포트입니다. 실제 지급·세금계산서 발행은 계약 조건과 세무 기준에 따라 처리하세요.", `<div class="flex items-center gap-2"><button data-act="settle-month" data-v="${shift(-1)}" class="adm-btn-ghost px-3">←</button><span class="min-w-[90px] text-center text-sm font-semibold tabular-nums">${m}</span><button data-act="settle-month" data-v="${shift(1)}" class="adm-btn-ghost px-3">→</button></div>`)}
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">${[["중개 수수료 수익", won(bl.reduce((a, b) => a + b.com, 0))], ["직매입 매출총이익", won(op.sales - op.cost)], ["양조장 지급 예정액", won(bl.reduce((a, b) => a + b.gross - b.com, 0))], ["취소·환불", `${refunds.length}건 · ${won(refunds.reduce((a, o) => a + o.total, 0))}`]].map(([l, v]) => `<div class="adm-card"><p class="text-xs text-charcoal/55">${l}</p><p class="mt-2 text-xl font-semibold tabular-nums">${v}</p></div>`).join("")}</div>
  <section class="adm-card mt-4 overflow-x-auto p-0"><h2 class="border-b border-line p-4 text-sm font-semibold">양조장별 정산 (중개형)</h2><table class="adm-table min-w-[680px]"><thead><tr><th>양조장</th><th class="text-right">배송 완료</th><th class="text-right">거래액(배송비 포함)</th><th class="text-right">플랫폼 수수료</th><th class="text-right">지급 예정액</th><th>파손</th></tr></thead><tbody>${bl.map((b) => `<tr><td>${e(b.name)}</td><td class="text-right tabular-nums">${b.n}건</td><td class="text-right tabular-nums">${won(b.gross)}</td><td class="text-right tabular-nums">${won(b.com)}</td><td class="text-right font-semibold tabular-nums">${won(b.gross - b.com)}</td><td>${b.dmg ? pill(`${b.dmg}건`, "b") : "-"}</td></tr>`).join("") || `<tr><td colspan="6" class="py-6 text-center text-sm text-charcoal/50">이 기간에 배송 완료된 중개 주문이 없습니다.</td></tr>`}</tbody></table></section>
  <section class="adm-card mt-4"><h2 class="text-sm font-semibold">직매입 손익 (${e(S.settings.brandName)})</h2><dl class="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">${[["배송 완료", `${op.n}건`], ["상품 매출", won(op.sales)], ["매입 원가", won(op.cost)], ["매출총이익", won(op.sales - op.cost)], ["배송비 수입", won(op.ship)]].map(([l, v]) => `<div><dt class="text-xs text-charcoal/50">${l}</dt><dd class="mt-1 font-semibold tabular-nums">${v}</dd></div>`).join("")}</dl><p class="mt-3 text-xs text-charcoal/50">금액은 VAT 포함 기준입니다.</p></section>`;
}

function aSuppliers() {
  const list = Object.values(S.suppliers).sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return `${ptitle("공급처 (도매상)", "직매입 상품을 공급받는 도매상을 관리합니다. 면허 확인이 끝난 공급처만 거래하세요.", `<a href="#admin.supplier-new" class="adm-btn">+ 공급처 등록</a>`)}
  <div class="adm-card overflow-x-auto p-0"><table class="adm-table min-w-[720px]"><thead><tr><th>공급처</th><th>담당자</th><th>면허</th><th>결제 조건</th><th class="text-right">공급 상품</th><th class="text-right">발주</th></tr></thead><tbody>${list.map((s) => `<tr><td><a href="#admin.supplier.${e(s.id)}" class="font-medium hover:underline">${e(s.name)}</a> ${s.isDemo ? pill("DEMO") : ""} ${s.active === false ? pill("거래 중지", "b") : ""}</td><td class="text-xs">${e(s.contactName)} ${e(s.phone)}</td><td>${s.licenseVerified ? pill(e(s.licenseType || "확인"), "g") : pill("미확인", "w")}</td><td class="text-xs">${e(s.paymentTerms || "-")}</td><td class="text-right tabular-nums">${Object.values(S.products).filter((p) => p.supplierId === s.id).length}</td><td class="text-right tabular-nums">${Object.values(S.pos).filter((p) => p.supplierId === s.id).length}</td></tr>`).join("")}</tbody></table>${list.length ? "" : `<p class="p-8 text-center text-sm text-charcoal/50">등록된 공급처가 없습니다.</p>`}</div>`;
}
function aSupplierForm(id) {
  const s = id ? S.suppliers[id] : { active: true };
  if (!s) return `<p class="adm-card">공급처를 찾을 수 없습니다.</p>`;
  const prods = id ? sorted(S.products).filter((p) => p.supplierId === id) : [];
  const pos = id ? Object.values(S.pos).filter((p) => p.supplierId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
  return `${ptitle(id ? e(s.name) : "공급처 등록", s.isDemo ? "DEMO 공급처 — 실제 거래처가 아닙니다." : "", id ? `<a href="#admin.po-new.${e(id)}" class="adm-btn">+ 발주서 작성</a>` : "")}
  ${id ? `<div class="mb-4 grid gap-4 lg:grid-cols-2"><section class="adm-card overflow-x-auto"><h2 class="text-sm font-semibold">공급 상품 (${prods.length})</h2><table class="adm-table mt-2 min-w-[480px]"><thead><tr><th>상품</th><th class="text-right">매입가</th><th class="text-right">판매가</th><th class="text-right">이익률</th><th class="text-right">재고</th></tr></thead><tbody>${prods.map((p) => `<tr><td><a href="#admin.product.${e(p.id)}" class="hover:underline">${e(p.name)}</a></td><td class="text-right tabular-nums">${p.wholesaleCost ? won(p.wholesaleCost) : pill("미입력", "w")}</td><td class="text-right tabular-nums">${won(p.price)}</td><td class="text-right tabular-nums">${pct(calcWholesale(p).marginOnSales)}</td><td class="text-right tabular-nums">${p.stock}</td></tr>`).join("")}</tbody></table>${prods.length ? "" : `<p class="mt-2 text-sm text-charcoal/50">상품 수정에서 거래 모델을 '매입', 공급처를 이 업체로 지정하세요.</p>`}</section>
  <section class="adm-card"><h2 class="text-sm font-semibold">최근 발주</h2><ul class="mt-2 divide-y divide-line text-sm">${pos.map((po) => `<li class="flex items-center justify-between py-2"><a href="#admin.po.${e(po.number)}" class="tabular-nums hover:underline">${e(po.number)}</a><span class="flex items-center gap-2"><span class="tabular-nums">${won(po.totalCost)}</span>${pill(PO_ST[po.status], PO_TONE[po.status])}</span></li>`).join("") || `<li class="py-2 text-charcoal/50">발주 내역이 없습니다.</li>`}</ul></section></div>` : ""}
  <form data-form="supplier" data-id="${e(id || "")}" class="space-y-4">${SECT("기본 정보", "", `${F("공급처명", "name", s.name, { req: 1, span: 2 })}${F("사업자등록번호", "businessNumber", s.businessNumber)}<div class="flex items-end">${CK("거래 중", "active|bool", s.active !== false)}</div>${F("담당자", "contactName", s.contactName)}${F("연락처", "phone", s.phone)}${F("이메일", "email", s.email)}${F("입고 소요일", "leadTimeDays|int?", s.leadTimeDays, { type: "number" })}${F("주소", "address", s.address, { span: 4 })}`)}
  ${SECT("주류 판매 면허", "도매 면허(종합주류도매업·특정주류도매업 등)를 확인한 공급처에서만 매입하세요.", `${F("면허 종류", "licenseType", s.licenseType, { ph: "예: 종합주류도매업" })}${F("면허 번호", "licenseNumber", s.licenseNumber)}<div class="flex items-end md:col-span-2">${CK("면허 확인 완료", "licenseVerified|bool", s.licenseVerified)}</div>`)}
  ${SECT("거래 조건", "", `${F("결제 조건", "paymentTerms", s.paymentTerms, { span: 2, ph: "예: 월말 마감 익월 10일 결제" })}${F("메모", "note", s.note, { ta: 1, span: 4 })}`)}${saveBar(id ? "변경 사항 저장" : "공급처 등록")}</form>`;
}
async function saveSupplier(form) {
  const id = form.dataset.id, v = readForm(form);
  if (!v.name) throw new FormErr("공급처명을 입력해 주세요.");
  const docId = id || `sup-${Date.now().toString(36)}`;
  await S.db.doc(`ops/v1/suppliers/${docId}`).set(JSON.parse(JSON.stringify({ ...(S.suppliers[docId] || { isDemo: false }), ...v, id: undefined })));
  await audit("SAVE", "supplier", docId, { name: v.name, licenseVerified: v.licenseVerified });
  return `admin.supplier.${docId}`;
}

const PO_ST = { DRAFT: "작성 중", ORDERED: "발주 완료", RECEIVED: "입고 완료", CANCELLED: "취소" };
const PO_TONE = { DRAFT: "w", ORDERED: "w", RECEIVED: "g", CANCELLED: "b" };
function aPOs() {
  const list = Object.values(S.pos).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const low = sorted(S.products).filter((p) => p.tradeModel === "WHOLESALE" && p.status === "PUBLISHED" && (p.stock || 0) <= 5);
  return `${ptitle("발주 · 입고", "직매입 상품의 발주서를 만들고, 입고 처리하면 재고와 매입가가 자동 반영됩니다.", `<a href="#admin.po-new" class="adm-btn">+ 발주서 작성</a>`)}
  ${low.length ? `<section class="adm-card mb-4 border-[#E8C77A] bg-[#FFFBF0]"><h2 class="text-sm font-semibold">재고 부족 (5병 이하) · 직매입 상품</h2><div class="mt-2 flex flex-wrap gap-2 text-sm">${low.map((p) => `<a href="#admin.po-new.${e(p.supplierId || "")}" class="adm-btn-ghost py-1">${e(p.name)} <span class="ml-1.5 tabular-nums text-[#9B1C1C]">${p.stock}병</span></a>`).join("")}</div></section>` : ""}
  <div class="adm-card overflow-x-auto p-0"><table class="adm-table min-w-[720px]"><thead><tr><th>발주번호</th><th>공급처</th><th>작성일</th><th class="text-right">품목</th><th class="text-right">매입 금액</th><th>상태</th></tr></thead><tbody>${list.map((po) => `<tr><td><a href="#admin.po.${e(po.number)}" class="font-medium tabular-nums hover:underline">${e(po.number)}</a></td><td>${e(S.suppliers[po.supplierId]?.name)}</td><td class="text-xs">${new Date(po.createdAt).toLocaleDateString("ko-KR")}</td><td class="text-right tabular-nums">${po.items.length}</td><td class="text-right tabular-nums">${won(po.totalCost)}</td><td>${pill(PO_ST[po.status], PO_TONE[po.status])}</td></tr>`).join("")}</tbody></table>${list.length ? "" : `<p class="p-8 text-center text-sm text-charcoal/50">발주 내역이 없습니다.</p>`}</div>`;
}
function aPONew(supplierId) {
  const s = S.suppliers[supplierId];
  if (!s) return `${ptitle("발주서 작성", "공급처를 선택하세요.")}<div class="grid gap-3 md:grid-cols-3">${Object.values(S.suppliers).filter((x) => x.active !== false).map((x) => `<a href="#admin.po-new.${e(x.id)}" class="adm-card block hover:border-charcoal"><p class="font-medium">${e(x.name)}</p><p class="mt-1 text-xs text-charcoal/55">공급 상품 ${Object.values(S.products).filter((p) => p.supplierId === x.id).length}개${x.licenseVerified ? "" : " · 면허 미확인"}</p></a>`).join("") || `<p class="adm-card text-sm">먼저 공급처를 등록해 주세요.</p>`}</div>`;
  const prods = sorted(S.products).filter((p) => p.supplierId === s.id);
  return `${ptitle(`발주서 작성 · ${e(s.name)}`, `입고 소요 ${e(s.leadTimeDays ?? "-")}일 · 결제 조건 ${e(s.paymentTerms || "-")}`)}
  ${s.licenseVerified ? "" : `<p class="mb-4 rounded border border-[#E8C77A] bg-[#FFFBF0] px-3 py-2 text-sm">이 공급처는 주류 판매 면허 확인이 끝나지 않았습니다. 확인 후 발주하세요.</p>`}
  <form data-form="po" data-supplier="${e(s.id)}" class="space-y-4"><div class="adm-card overflow-x-auto p-0"><table class="adm-table min-w-[680px]"><thead><tr><th>상품</th><th class="text-right">현재 재고</th><th class="text-right">최근 매입가</th><th class="text-right">발주 수량</th><th class="text-right">매입 단가 (VAT 포함)</th></tr></thead><tbody>${prods.map((p) => `<tr><td>${e(p.name)} ${(p.stock || 0) <= 5 ? pill("재고 부족", "w") : ""}</td><td class="text-right tabular-nums">${p.stock}</td><td class="text-right tabular-nums">${p.wholesaleCost ? won(p.wholesaleCost) : "-"}</td><td class="text-right"><input name="qty_${e(p.id)}" type="number" min="0" value="0" class="adm-input ml-auto w-24 py-1 text-right" aria-label="${e(p.name)} 발주 수량"></td><td class="text-right"><input name="cost_${e(p.id)}" type="number" min="0" step="100" value="${e(p.wholesaleCost ?? "")}" class="adm-input ml-auto w-32 py-1 text-right" aria-label="${e(p.name)} 매입 단가"></td></tr>`).join("")}</tbody></table>${prods.length ? "" : `<p class="p-6 text-center text-sm text-charcoal/50">이 공급처에 연결된 상품이 없습니다.</p>`}</div>
  <div class="adm-card"><label class="block"><span class="adm-label">요청 사항</span><textarea name="note" rows="2" class="adm-input" placeholder="예: 냉장 상품 화요일 입고 요청"></textarea></label></div>${saveBar("발주서 만들기")}</form>`;
}
async function createPO(form) {
  const sid = form.dataset.supplier;
  const items = sorted(S.products).filter((p) => p.supplierId === sid).map((p) => ({ productId: p.id, name: p.name, qty: Number(form[`qty_${p.id}`]?.value || 0), unitCost: Number(form[`cost_${p.id}`]?.value || 0) })).filter((x) => x.qty > 0);
  if (!items.length) throw new FormErr("발주 수량을 1개 이상 입력해 주세요.");
  if (items.some((x) => !(x.unitCost > 0) || !Number.isInteger(x.qty))) throw new FormErr("수량과 매입 단가를 확인해 주세요.");
  const d = new Date(); const no = `PO${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
  await S.db.doc(`ops/v1/pos/${no}`).set({ number: no, supplierId: sid, status: "DRAFT", items, totalCost: items.reduce((a, x) => a + x.qty * x.unitCost, 0), note: form.note.value.trim() || null, createdAt: d.toISOString(), orderedAt: null, receivedAt: null, by: S.uid });
  await audit("CREATE", "po", no);
  return `admin.po.${no}`;
}
function aPO(no) {
  const po = S.pos[no];
  if (!po) return `<p class="adm-card">발주서를 찾을 수 없습니다.</p>`;
  const s = S.suppliers[po.supplierId] || {}, b = S.settings.business;
  const acts = po.status === "DRAFT" ? [["ORDERED", "발주 완료로 변경"], ["CANCELLED", "발주 취소"]] : po.status === "ORDERED" ? [["RECEIVED", "입고 처리 (재고 반영)"], ["CANCELLED", "발주 취소"]] : [];
  const net = Math.floor((po.totalCost * 10) / 11);
  return `${ptitle(`발주서 ${e(po.number)}`, `${e(s.name)} · ${PO_ST[po.status]}`, `<a href="#admin.pos" class="adm-btn-ghost">← 목록</a>`)}
  <div class="grid gap-4 lg:grid-cols-3"><article class="rounded-md border border-line bg-white p-6 md:p-10 lg:col-span-2"><header class="flex flex-wrap items-start justify-between gap-4 border-b-2 border-charcoal pb-5"><div><p class="font-serif text-xs tracking-[0.3em] text-charcoal/50">PURCHASE ORDER</p><h2 class="mt-1 text-2xl font-semibold">발 주 서</h2></div><div class="text-right text-xs leading-relaxed text-charcoal/70"><p class="font-medium tabular-nums text-charcoal">No. ${e(po.number)}</p><p>작성일 ${new Date(po.createdAt).toLocaleDateString("ko-KR")}</p>${po.orderedAt ? `<p>발주일 ${new Date(po.orderedAt).toLocaleDateString("ko-KR")}</p>` : ""}${po.receivedAt ? `<p>입고일 ${new Date(po.receivedAt).toLocaleDateString("ko-KR")}</p>` : ""}</div></header>
  <div class="mt-5 grid gap-6 text-sm md:grid-cols-2"><div><p class="text-xs text-charcoal/50">공급처 (수신)</p><p class="mt-1 font-medium">${e(s.name)}</p><p class="text-xs text-charcoal/60">${e(s.contactName)} ${e(s.phone)} ${e(s.email)}</p><p class="text-xs text-charcoal/60">${e(s.licenseType)} ${e(s.licenseNumber)}</p></div><div><p class="text-xs text-charcoal/50">발주처 (발신)</p><p class="mt-1 font-medium">${e(b.companyName)}</p><p class="text-xs text-charcoal/60">사업자 ${e(b.businessNumber)} · ${e(b.phone)} · ${e(b.email)}</p></div></div>
  <table class="adm-table mt-6"><thead><tr><th>#</th><th>품목</th><th class="text-right">수량</th><th class="text-right">단가</th><th class="text-right">금액</th></tr></thead><tbody>${po.items.map((i, idx) => `<tr><td class="text-charcoal/50">${idx + 1}</td><td>${e(i.name)}</td><td class="text-right tabular-nums">${i.qty}</td><td class="text-right tabular-nums">${won(i.unitCost)}</td><td class="text-right tabular-nums">${won(i.unitCost * i.qty)}</td></tr>`).join("")}</tbody></table>
  <div class="mt-4 flex justify-end"><dl class="w-64 text-sm"><div class="flex justify-between py-1"><dt class="text-charcoal/55">공급가액</dt><dd class="tabular-nums">${won(net)}</dd></div><div class="flex justify-between py-1"><dt class="text-charcoal/55">부가세</dt><dd class="tabular-nums">${won(po.totalCost - net)}</dd></div><div class="flex justify-between border-t-2 border-charcoal py-2 font-semibold"><dt>합계</dt><dd class="tabular-nums">${won(po.totalCost)}</dd></div></dl></div>${po.note ? `<p class="mt-4 border-t border-line pt-4 text-sm">요청 사항 · ${e(po.note)}</p>` : ""}<p class="mt-6 text-xs text-charcoal/50">결제 조건 · ${e(s.paymentTerms || "-")}</p></article>
  <aside class="space-y-4"><section class="adm-card"><h2 class="text-sm font-semibold">상태</h2><p class="mt-2">${pill(PO_ST[po.status], PO_TONE[po.status])}</p><div class="mt-4 space-y-2">${acts.map(([to, l]) => `<button data-act="po-status" data-no="${e(po.number)}" data-v="${to}" class="${to === "CANCELLED" ? "adm-btn-ghost text-[#9B1C1C]" : "adm-btn"} w-full">${l}</button>`).join("")}${po.status === "RECEIVED" ? `<p class="text-xs text-charcoal/55">입고 완료 — 재고와 매입가가 반영되었습니다.</p>` : ""}</div></section></aside></div>`;
}
async function poStatus(no, to) {
  const po = structuredClone(S.pos[no]);
  const allowed = { DRAFT: ["ORDERED", "CANCELLED"], ORDERED: ["RECEIVED", "CANCELLED"] }[po.status] || [];
  if (!allowed.includes(to)) throw new FormErr("현재 상태에서는 변경할 수 없습니다.");
  if (to === "RECEIVED") {
    for (const i of po.items) {
      await bumpStock(i.productId, i.qty);
      const os = await S.db.doc(`ops/v1/products/${i.productId}`).get();
      await S.db.doc(`ops/v1/products/${i.productId}`).set({ ...(os.exists ? os.data() : {}), wholesaleCost: i.unitCost });
    }
    po.receivedAt = new Date().toISOString();
  }
  if (to === "ORDERED") po.orderedAt = new Date().toISOString();
  po.status = to; delete po.id;
  await S.db.doc(`ops/v1/pos/${no}`).set(po);
  await audit("PO_" + to, "po", no);
}
