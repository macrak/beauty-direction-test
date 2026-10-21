// ─── 공통 조각 ──────────────────────────────────────────
const demo = (cls = "") => `<span class="${cls} inline-flex items-center border border-charcoal/40 bg-ivory/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-charcoal/80">DEMO</span>`;
function badges(p) {
  return `<div class="flex flex-wrap gap-1.5">${p.isMaster && p.masterVerified ? `<span class="border border-gold px-1.5 py-0.5 text-[10px] tracking-wider text-gold-deep">명인주</span>` : ""}${p.isLimited && p.limitedVerified ? `<span class="border border-burgundy/60 px-1.5 py-0.5 text-[10px] tracking-wider text-burgundy">한정판</span>` : ""}${p.eligibility === "INELIGIBLE" ? `<span class="border border-charcoal/30 px-1.5 py-0.5 text-[10px] tracking-wider text-charcoal/60">소개 전용</span>` : ""}</div>`;
}
function priceTag(p, lg) {
  if (p.eligibility === "INELIGIBLE") return `<p class="text-xs text-charcoal/50">온라인 판매 대상 아님</p>`;
  const v = shownPrice(p);
  if (v === null) return "";
  return `<p class="flex items-baseline gap-1.5">${priceMode() === "REFERENCE" ? `<span class="text-[10px] tracking-wider text-charcoal/50">참고 소비자가</span>` : ""}<span class="font-serif ${lg ? "text-2xl" : "text-[15px]"}">${won(v)}</span></p>`;
}
function productImg(p, cls = "aspect-[4/5]") {
  return `<div class="bottle relative flex items-center justify-center overflow-hidden bg-beige ${cls}">${p.imageUrl ? `<img src="${e(p.imageUrl)}" alt="${e(p.imageAlt || p.name)}" class="h-full w-full object-cover" loading="lazy">` : ART[`bottle_${p.liquorType}`] || ""}</div>`;
}
function card(p) {
  const b = S.breweries[p.brewery];
  return `<a href="#product.${e(p.id)}" class="group block"><div class="relative">${productImg(p, "aspect-[4/5] transition duration-700 group-hover:bg-[#E6DDCC]")}${p.isDemo ? demo("absolute left-3 top-3") : ""}</div>
  <div class="mt-4 space-y-1.5">${badges(p)}<p class="text-[11px] tracking-wider text-charcoal/50">${e(b?.name)} · ${LIQUOR[p.liquorType]}</p>
  <h3 class="font-kserif text-[15px] leading-snug md:text-base">${e(p.name)}</h3>${p.summary ? `<p class="line-clamp-2 text-xs leading-relaxed text-charcoal/60">${e(p.summary)}</p>` : ""}
  <p class="text-[11px] text-charcoal/50">${p.abv}% · ${p.volumeMl}ml</p>${priceTag(p)}</div></a>`;
}
const grid = (list) => `<div class="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14">${list.map(card).join("")}</div>`;
const heading = (eb, title, desc, action = "") => `<div class="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between"><div class="max-w-2xl"><p class="eyebrow">${eb}</p><h2 class="h-section mt-3">${title}</h2>${desc ? `<p class="mt-4 text-sm leading-relaxed text-charcoal/60 md:text-[15px]">${desc}</p>` : ""}</div>${action}</div>`;
const breweryArt = (b, tall) => (b.imageUrl ? `<img src="${e(b.imageUrl)}" alt="${e(b.name)} 양조장" class="${tall ? "aspect-[4/5]" : "aspect-[10/7]"} w-full object-cover" loading="lazy">` : `<div class="art-fill ${tall ? "aspect-[4/5]" : "aspect-[10/7]"} overflow-hidden">${ART[`${tall ? "themeTall" : "theme"}_${b.visualTheme && THEMES[b.visualTheme] ? b.visualTheme : "hanok"}`]}</div>`);
const articleCover = (a) => (a.coverImageUrl ? `<img src="${e(a.coverImageUrl)}" alt="${e(a.coverImageAlt || a.title)}" class="aspect-[10/7] w-full object-cover" loading="lazy">` : `<div class="art-fill aspect-[10/7] overflow-hidden">${ART[`theme_${a.coverTheme && THEMES[a.coverTheme] ? a.coverTheme : ART_FALLBACK[a.category]}`]}</div>`);
function articleCard(a) {
  return `<a href="#article.${e(a.id)}" class="group block"><div class="relative overflow-hidden"><div class="transition duration-700 group-hover:scale-[1.02]">${articleCover(a)}</div>${a.isDemo ? demo("absolute left-3 top-3") : ""}</div>
  <p class="eyebrow mt-5">${ART_CAT[a.category][1]}${a.readMinutes ? ` · ${a.readMinutes} min` : ""}</p><h3 class="mt-2 font-kserif text-lg leading-snug transition group-hover:text-burgundy">${e(a.title)}</h3>${a.excerpt ? `<p class="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/60">${e(a.excerpt)}</p>` : ""}</a>`;
}

function radar(data) {
  const SIZE = 360, C = 180, R = 118, n = data.length;
  const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  const ring = (lv) => data.map((_, i) => pt(i, (R * lv) / 5).join(",")).join(" ");
  const shape = data.map((d, i) => pt(i, (R * (d[1] ?? 0)) / 5));
  return `<svg viewBox="-60 -6 ${SIZE + 120} ${SIZE + 12}" class="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label="맛 프로필: ${data.map((d) => `${d[0]} ${d[1] ?? "해당 없음"}`).join(", ")}">
  ${[1, 2, 3, 4, 5].map((lv) => `<polygon points="${ring(lv)}" fill="none" stroke="#202020" stroke-opacity="${lv === 5 ? 0.18 : 0.08}"/>`).join("")}
  ${data.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="#202020" stroke-opacity="0.08"/>`; }).join("")}
  <polygon points="${shape.map((p) => p.join(",")).join(" ")}" fill="#4C202B" fill-opacity="0.14" stroke="#4C202B" stroke-width="2" stroke-linejoin="round"/>
  ${shape.map(([x, y], i) => (data[i][1] == null ? "" : `<circle cx="${x}" cy="${y}" r="4.5" fill="#4C202B"><title>${data[i][0]} ${data[i][1]} / 5</title></circle>`)).join("")}
  ${data.map((d, i) => { const [x, y] = pt(i, R + 28); const anchor = Math.abs(x - C) < 4 ? "middle" : x > C ? "start" : "end"; return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-size="13" fill="#202020">${d[0]}${d[1] == null ? `<tspan fill="#20202080" font-size="11"> (해당 없음)</tspan>` : ""}</text>`; }).join("")}
  </svg>`;
}

// ─── 헤더 · 푸터 ────────────────────────────────────────
const NAV = [["collection", "컬렉션"], ["masters", "명인주"], ["limited", "리미티드"], ["gift", "프리미엄 기프트"], ["breweries", "양조장"], ["taste", "취향 추천"], ["corporate", "기업 VIP"], ["story", "브랜드 스토리"]];
function header(r) {
  const s = S.settings;
  return `<header class="sticky z-40 border-b border-line/60 bg-ivory/90 backdrop-blur" style="top:env(safe-area-inset-top,0px)">
  <div class="container-site flex h-16 items-center justify-between md:h-20">
    <a href="#" class="flex flex-col leading-none" aria-label="${e(s.brandName)} 홈"><span class="font-serif text-lg tracking-[0.32em] md:text-xl">${e(s.brandName)}</span><span class="mt-1 font-kserif text-[10px] tracking-[0.5em] text-gold-deep">${e(s.brandNameKo)}</span></a>
    <nav class="hidden items-center gap-7 lg:flex" aria-label="주요 메뉴">${NAV.map(([k, l]) => `<a href="#${k}" class="text-[13px] tracking-wide ${r.name === k ? "text-burgundy" : "text-charcoal/80 hover:text-charcoal"}">${l}</a>`).join("")}${S.isAdmin ? `<a href="#admin" class="rounded border border-charcoal/20 px-2.5 py-1 text-[12px] hover:border-charcoal">관리자</a>` : ""}</nav>
    <details class="group lg:hidden"><summary class="flex h-10 w-10 cursor-pointer list-none flex-col items-center justify-center gap-1.5" aria-label="메뉴"><span class="h-px w-6 bg-charcoal transition group-open:translate-y-[3.5px] group-open:rotate-45"></span><span class="h-px w-6 bg-charcoal transition group-open:-translate-y-[3.5px] group-open:-rotate-45"></span></summary>
      <nav class="absolute inset-x-0 top-full border-y border-line bg-ivory px-5 pb-8 pt-4" aria-label="모바일 메뉴"><ul class="space-y-1">${NAV.map(([k, l]) => `<li><a href="#${k}" class="block py-3 font-kserif text-lg">${l}</a></li>`).join("")}</ul>
      <div class="mt-6 flex flex-wrap gap-5 text-xs text-charcoal/60"><a href="#magazine">매거진</a><a href="#partnership">입점 문의</a><a href="#support">고객센터</a>${S.isAdmin ? `<a href="#admin" class="text-burgundy">관리자</a>` : ""}</div></nav></details>
  </div></header>`;
}
function footer() {
  const s = S.settings, b = s.business, w = currentNotice("HEALTH_WARNING"), inter = currentNotice("INTERMEDIARY"), youth = currentNotice("YOUTH_NOTICE");
  const col = (t, links) => `<div><p class="font-serif text-xs uppercase tracking-luxe text-gold">${t}</p><ul class="mt-5 space-y-3 text-sm">${links.map(([h, l]) => `<li><a href="#${h}" class="text-ivory/70 hover:text-ivory">${l}</a></li>`).join("")}</ul></div>`;
  return `<footer class="mt-24 bg-charcoal text-ivory/80 md:mt-32">${w ? `<div class="bg-burgundy/90"><p class="container-site py-3 text-center text-[11px] leading-relaxed text-ivory/90 md:text-xs">${e(w.body)}</p></div>` : ""}
  <div class="container-site grid gap-12 py-16 md:grid-cols-4"><div><p class="font-serif text-xl tracking-[0.32em] text-ivory">${e(s.brandName)}</p><p class="mt-2 font-kserif text-xs tracking-[0.4em] text-gold">${e(s.brandNameKo)}</p><p class="mt-6 text-xs leading-relaxed text-ivory/50">${e(s.subCopy)}</p></div>
  ${col("Collection", [["collection", "전체 컬렉션"], ["masters", "명인주 컬렉션"], ["limited", "리미티드 에디션"], ["gift", "프리미엄 기프트"], ["taste", "취향별 추천"]])}
  ${col("About", [["story", "브랜드 스토리"], ["breweries", "양조장"], ["magazine", "매거진"], ["corporate", "기업 VIP 선물"], ["partnership", "입점 문의"]])}
  ${col("Support", [["support", "고객센터"], ["legal.TERMS", "이용약관"], ["legal.PRIVACY", "개인정보 처리방침"], ["legal.SHIPPING_POLICY", "배송 정책"], ["legal.RETURN_POLICY", "교환·반품"]])}</div>
  <div class="border-t border-ivory/10"><div class="container-site space-y-3 py-8 text-[11px] leading-relaxed text-ivory/45" style="padding-bottom:calc(2rem + env(safe-area-inset-bottom,0px))">
  <p>상호 ${e(b.companyName)} · 대표 ${e(b.representative)} · 사업자등록번호 ${e(b.businessNumber)} · 통신판매업 신고 ${e(b.mailOrderNumber)}</p><p>주소 ${e(b.address)} · 이메일 ${e(b.email)} · 전화 ${e(b.phone)}</p>
  ${inter ? `<p>${e(inter.body)}</p>` : ""}${youth ? `<p>${e(youth.body)}</p>` : ""}
  <p>현재 SOOL RESERVE는 전통주 소개·큐레이션 서비스로 운영 중이며, 온라인 주문·결제 기능은 제공하지 않습니다.${s.showDemoData ? " DEMO 표시가 있는 양조장과 상품은 화면 구성을 위한 가상 데이터입니다." : ""}</p>
  <p class="pt-2">© ${new Date().getFullYear()} ${e(s.brandName)}</p></div></div></footer>`;
}

// ─── 고객 페이지 ─────────────────────────────────────────
function vHome() {
  const s = S.settings, all = publicProducts();
  const pick = (slot) => (s.featured?.[slot] || []).map((id) => all.find((p) => p.id === id)).filter(Boolean);
  const main = pick("MAIN"), coll = (main.length ? main : all).slice(0, 8), limited = pick("LIMITED");
  const showPrices = priceMode() !== "HIDDEN";
  const brews = Object.values(S.breweries).filter(visibleBrewery).sort((a, b) => (a.foundedYear || 0) - (b.foundedYear || 0)).slice(0, 3);
  const arts = publicArticles().slice(0, 3);
  return `<section class="hero-light relative -mt-16 overflow-hidden md:-mt-20"><div class="container-site grid items-center gap-6 pb-16 pt-28 md:grid-cols-2 md:pt-28" style="min-height:min(100svh,880px)">
    <div class="order-2 md:order-1"><p class="eyebrow">The Reserve of Korean Sool</p><h1 class="h-display mt-6 text-[2.2rem] md:text-6xl">${e(s.slogan)}</h1><p class="mt-6 max-w-md text-[15px] leading-relaxed text-charcoal/65 md:text-base">${e(s.subCopy)}</p>
    <div class="mt-10 flex flex-wrap gap-3"><a href="#collection" class="btn-primary">컬렉션 살펴보기</a><a href="#story" class="btn-ghost">브랜드 스토리</a></div></div>
    <div class="relative order-1 flex justify-center md:order-2"><div class="absolute top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(182,154,104,0.28)_0%,rgba(247,244,238,0)_65%)]"></div>${s.heroImageUrl ? `<img src="${e(s.heroImageUrl)}" alt="${e(s.heroImageAlt || "SOOL RESERVE 대표 이미지")}" class="relative h-[46vh] w-full max-w-[520px] object-cover shadow-[0_30px_60px_rgba(32,32,32,0.18)] md:h-[68vh]">` : `<div class="relative h-[46vh] drop-shadow-[0_30px_40px_rgba(32,32,32,0.18)] md:h-[64vh] [&_svg]:h-full [&_svg]:w-auto">${ART.bottle_YAKJU}</div>`}</div></div></section>
  <section class="container-site py-24 md:py-32">${heading("The Collection", "대한민국의 명주를 만나다.", "양조장의 신뢰, 술의 완성도, 이야기와 희소성. 열 가지 기준으로 엄선한 전통주입니다.", `<a href="#collection" class="link-u text-sm">전체 컬렉션 보기 →</a>`)}${grid(coll)}</section>
  ${showPrices ? `<section class="border-y border-line bg-beige/40 py-24 md:py-28"><div class="container-site"><div class="mb-14 text-center"><p class="eyebrow">Price Collection</p><h2 class="h-section mt-3">가치에 맞는 한 병을 고르다.</h2><p class="mt-4 text-sm text-charcoal/60">가격대별로 엄선한 컬렉션. 표시 가격은 참고 소비자가입니다.</p></div>
    <div class="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-5">${(s.priceTiers || []).map((t) => `<a href="#collection" data-act="tier" data-v="${t}" class="flex flex-col items-center gap-2 bg-ivory px-4 py-10 text-center transition hover:bg-white"><span class="font-serif text-2xl md:text-3xl">${t / 10000}만 원</span><span class="text-xs tracking-wider text-charcoal/50">이상 · ${all.filter((p) => p.price >= t && p.eligibility !== "INELIGIBLE").length}종</span></a>`).join("")}
    <a href="#limited" class="col-span-2 flex flex-col items-center gap-2 bg-burgundy px-4 py-10 text-center text-ivory md:col-span-1"><span class="font-kserif text-xl md:text-2xl">특별 한정판</span><span class="text-xs tracking-wider text-ivory/60">${all.filter((p) => p.isLimited && p.limitedVerified).length}종</span></a></div></div></section>` : ""}
  <section class="container-site py-24 md:py-32">${heading("Master Breweries", "술을 빚는 사람들.", "한 병의 술 뒤에는 물과 쌀, 누룩, 그리고 수십 년을 이어 온 손이 있습니다.", `<a href="#breweries" class="link-u text-sm">모든 양조장 →</a>`)}
    <div class="space-y-20 md:space-y-28">${brews.map((b, i) => `<article class="grid items-center gap-8 md:grid-cols-12 md:gap-16"><div class="relative md:col-span-6 ${i % 2 ? "md:order-2" : ""}">${breweryArt(b)}${b.isDemo ? demo("absolute left-4 top-4") : ""}</div>
      <div class="md:col-span-6"><p class="eyebrow">${e(b.region)} · Since ${e(b.foundedYear)}</p><h3 class="mt-4 font-kserif text-2xl md:text-3xl">${e(b.name)}</h3><p class="mt-2 font-serif text-lg italic text-charcoal/50">${e(b.tagline)}</p><p class="mt-6 text-[15px] leading-loose text-charcoal/70">${e(b.history)}</p>
      <dl class="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 text-sm"><div><dt class="text-xs text-charcoal/45">물과 누룩</dt><dd class="mt-1 leading-relaxed">${e(b.waterAndNuruk)}</dd></div><div><dt class="text-xs text-charcoal/45">제조 방식</dt><dd class="mt-1 leading-relaxed">${e(b.method)}</dd></div></dl>
      <a href="#brewery.${e(b.id)}" class="link-u mt-8 inline-block text-sm">양조장 이야기 →</a></div></article>`).join("")}</div></section>
  <section class="bg-charcoal py-24 text-ivory md:py-32"><div class="container-site"><div class="mb-14 max-w-2xl"><p class="font-serif text-xs uppercase tracking-luxe text-gold">Premium Gift</p><h2 class="h-section mt-3">마음을 전하는 가장 품격 있는 방법.</h2><p class="mt-4 text-sm text-ivory/55">받는 분과 자리에 맞춰 고른 선물 컬렉션.</p></div>
    <div class="grid grid-cols-2 gap-px bg-ivory/10 md:grid-cols-3">${GIFTS.map((g, i) => `<a href="#gift.${i}" class="group bg-charcoal p-6 transition hover:bg-[#2a2a2a] md:p-10"><p class="font-serif text-xs uppercase tracking-luxe text-gold/80">${g[1]}</p><h3 class="mt-3 font-kserif text-lg md:text-2xl">${g[0]}</h3><p class="mt-3 text-xs leading-relaxed text-ivory/50 md:text-sm">${g[2]}</p><span class="mt-6 inline-block text-xs text-ivory/60 group-hover:text-gold">둘러보기 →</span></a>`).join("")}</div></div></section>
  ${limited.length ? `<section class="container-site py-24 md:py-32">${heading("Limited Edition", "쉽게 만날 수 없는 특별한 한 병.", "생산 수량이 검증된 한정 생산 제품만 소개합니다.", `<a href="#limited" class="link-u text-sm">리미티드 전체 →</a>`)}<div class="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-8">${limited.map((p) => `<div>${card(p)}${p.productionCount ? `<p class="mt-2 font-serif text-sm italic text-burgundy">${p.productionCount.toLocaleString()} bottles only</p>` : ""}</div>`).join("")}</div></section>` : ""}
  <section class="border-y border-line bg-beige/50 py-24 md:py-32"><div class="container-site grid items-center gap-12 md:grid-cols-2"><div><p class="eyebrow">Taste Discovery</p><h2 class="h-section mt-3">당신의 취향에 맞는 명주.</h2><p class="mt-5 max-w-md text-[15px] leading-relaxed text-charcoal/65">단맛, 산미, 바디감, 탄산감, 향. 다섯 가지 질문에 답하시면 실제 등록된 맛 정보를 바탕으로 어울리는 술을 추천해 드립니다.</p><a href="#taste" class="btn-primary mt-10">취향 찾기 시작</a></div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">${TASTE_FILTERS.slice(0, 6).map(([k, l]) => `<a href="#collection" data-act="taste-link" data-v="${k}" class="border border-charcoal/15 bg-ivory px-4 py-6 text-center font-kserif text-sm transition hover:border-burgundy hover:text-burgundy md:text-base">${l}</a>`).join("")}</div></div></section>
  ${arts.length ? `<section class="container-site pt-24 md:pt-32">${heading("Journal", "술을 곁에 두는 법.", "명주 이야기, 장인 인터뷰, 페어링과 보관 가이드.", `<a href="#magazine" class="link-u text-sm">매거진 전체 →</a>`)}<div class="grid gap-10 md:grid-cols-3">${arts.map(articleCard).join("")}</div></section>` : ""}
  <section class="container-site py-28 text-center md:py-40"><p class="eyebrow">Philosophy</p><h2 class="mx-auto mt-6 max-w-3xl font-kserif text-2xl font-light leading-relaxed md:text-[2.6rem] md:leading-snug">좋은 술을 넘어,<br>가치 있는 술을 선택합니다.</h2><div class="mx-auto my-10 h-px w-12 bg-gold"></div><p class="mx-auto max-w-2xl text-[15px] leading-loose text-charcoal/65">우리는 많이 파는 대신 오래 남을 술을 고릅니다. 양조장의 철학과 원료, 시간과 손의 기록을 함께 전하며, 한 병의 술이 한국의 문화로 기억되도록 큐레이션합니다.</p><a href="#story" class="link-u mt-10 inline-block text-sm">SOOL RESERVE의 선별 기준 →</a></section>`;
}

function vCollection(name) {
  const special = name === "masters" ? "master" : name === "limited" ? "limited" : "";
  const meta = { collection: ["The Collection", "전체 컬렉션", "주종과 맛, 상황과 가격으로 나에게 맞는 한 병을 찾아보세요."], masters: ["Master's Collection", "명인주 컬렉션", "평생을 한 가지 술에 바친 장인과 명인의 술. 명인·장인 여부가 확인된 상품만 소개합니다."], limited: ["Limited Edition", "쉽게 만날 수 없는 특별한 한 병.", "한정 생산 여부와 생산 수량이 검증된 제품만 소개합니다."] }[name];
  const list = filtered(special), f = S.f, showP = priceMode() !== "HIDDEN";
  const active = f.q || f.type || f.taste.length || f.occasion || f.min || f.sort;
  return `<div class="container-site pb-10 pt-12 md:pt-20"><header class="max-w-2xl"><p class="eyebrow">${meta[0]}</p><h1 class="h-display mt-4">${meta[1]}</h1><p class="mt-5 text-[15px] leading-relaxed text-charcoal/60">${meta[2]}</p></header>
  <div class="mt-12 space-y-6 border-y border-line py-8">
    <div class="flex flex-col gap-3 md:flex-row md:items-end">
      <label class="flex-1"><span class="sr-only">검색</span><input id="f-q" data-f="q" value="${e(f.q)}" placeholder="상품명, 양조장, 지역, 원료로 검색" class="finput py-2.5 text-sm"></label>
      <select id="f-occ" data-f="occasion" class="border-b border-charcoal/30 bg-transparent py-2.5 text-sm outline-none" aria-label="상황"><option value="">모든 상황</option>${OCCASIONS.map((o) => `<option ${f.occasion === o ? "selected" : ""}>${o}</option>`).join("")}</select>
      <select id="f-sort" data-f="sort" class="border-b border-charcoal/30 bg-transparent py-2.5 text-sm outline-none" aria-label="정렬"><option value="">추천순</option>${showP ? `<option value="price-desc" ${f.sort === "price-desc" ? "selected" : ""}>가격 높은순</option><option value="price-asc" ${f.sort === "price-asc" ? "selected" : ""}>가격 낮은순</option>` : ""}<option value="abv-desc" ${f.sort === "abv-desc" ? "selected" : ""}>도수 높은순</option></select>
    </div>
    <div class="flex flex-wrap items-center gap-2"><span class="mr-2 w-12 text-xs text-charcoal/45">주종</span><button data-act="ftype" data-v="" class="chip ${!f.type ? "chip-on" : ""}">전체</button>${Object.entries(LIQUOR).map(([k, v]) => `<button data-act="ftype" data-v="${k}" class="chip ${f.type === k ? "chip-on" : ""}">${v}</button>`).join("")}</div>
    <div class="flex flex-wrap items-center gap-2"><span class="mr-2 w-12 text-xs text-charcoal/45">맛</span>${TASTE_FILTERS.map(([k, l]) => `<button data-act="ftaste" data-v="${k}" aria-pressed="${f.taste.includes(k)}" class="chip ${f.taste.includes(k) ? "chip-on" : ""}">${l}</button>`).join("")}</div>
    ${showP ? `<div class="flex flex-wrap items-center gap-2"><span class="mr-2 w-12 text-xs text-charcoal/45">가격</span>${(S.settings.priceTiers || []).map((t) => `<button data-act="fmin" data-v="${t}" class="chip ${String(f.min) === String(t) ? "chip-on" : ""}">${t / 10000}만 원 이상</button>`).join("")}</div>` : ""}
  </div>
  <div class="my-8 flex items-center justify-between text-xs text-charcoal/50"><span>${list.length}개의 술</span>${active ? `<button data-act="freset" class="link-u">필터 초기화</button>` : ""}</div>
  ${list.length ? grid(list) : `<p class="py-24 text-center text-sm text-charcoal/50">조건에 맞는 술이 없습니다. 필터를 조정해 보세요.</p>`}
  <p class="mt-16 text-[11px] leading-relaxed text-charcoal/40">맛 필터는 등록된 맛 프로필(1~5점)을 기준으로 합니다. 맛 정보가 등록되지 않은 상품은 맛 필터 결과에 포함되지 않습니다.</p></div>`;
}

function vProduct(id) {
  const p = publicProducts().find((x) => x.id === id) || (S.isAdmin ? S.products[id] : null);
  if (!p) return vNotFound();
  const b = S.breweries[p.brewery] || {};
  const taste = TASTE_AXES.map(([k, l]) => [l, p[k] ?? null]);
  const tn = taste.filter((t) => t[1] != null).length;
  const pairings = (p.pairings || []).filter((x) => x && x.name);
  const related = publicProducts().filter((x) => x.brewery === p.brewery && x.id !== p.id).slice(0, 4);
  const w = currentNotice("HEALTH_WARNING"), inter = currentNotice("INTERMEDIARY");
  const dl = (rows) => rows.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => `<div class="flex gap-6 border-b border-line py-3"><dt class="w-28 shrink-0 text-charcoal/50">${k}</dt><dd class="leading-relaxed">${e(v)}</dd></div>`).join("");
  const sec = (eb, t, body) => `<section class="container-site mt-24 md:mt-32"><p class="eyebrow">${eb}</p><h2 class="h-section mb-10 mt-3">${t}</h2>${body}</section>`;
  return `<article>
  <section class="container-site grid gap-10 pt-6 md:grid-cols-12 md:gap-16 md:pt-12">
    <div class="md:col-span-7"><div class="relative">${productImg(p)}${p.isDemo ? demo("absolute left-4 top-4") : ""}</div>${(p.gallery || []).length ? `<div class="mt-4 grid grid-cols-2 gap-4">${p.gallery.map((u, i) => `<img src="${e(u)}" alt="${e(p.name)} 상세 사진 ${i + 1}" class="aspect-square w-full bg-beige object-cover" loading="lazy">`).join("")}</div>` : ""}</div>
    <div class="md:col-span-5 md:py-8">
      <nav class="text-[11px] tracking-wider text-charcoal/45"><a href="#collection" class="hover:text-charcoal">컬렉션</a> / ${LIQUOR[p.liquorType]}</nav>
      <div class="mt-6">${badges(p)}</div><a href="#brewery.${e(b.id)}" class="mt-5 block text-sm tracking-wide text-gold-deep hover:text-burgundy">${e(b.name)}</a>
      <h1 class="mt-2 font-kserif text-3xl font-light leading-snug md:text-4xl">${e(p.name)}</h1>${p.nameEn ? `<p class="mt-2 font-serif text-lg italic text-charcoal/50">${e(p.nameEn)}</p>` : ""}${p.summary ? `<p class="mt-6 text-[15px] leading-relaxed text-charcoal/70">${e(p.summary)}</p>` : ""}
      <div class="mt-8 grid grid-cols-3 border-y border-line py-5 text-center">${[["도수", `${p.abv}%`], ["용량", `${p.volumeMl}ml`], ["지역", p.region || b.region]].map(([k, v]) => `<div><p class="text-[11px] tracking-wider text-charcoal/45">${k}</p><p class="mt-1.5 font-serif text-lg">${e(v)}</p></div>`).join("")}</div>
      <div class="mt-8">${priceTag(p, true)}</div>
      <div class="mt-8 border border-line bg-white/60 p-5 text-sm leading-relaxed">${p.eligibility === "INELIGIBLE" ? `<p class="text-charcoal/70">이 상품은 관련 법령상 온라인 판매 대상이 아니어서 정보만 소개합니다.</p>` : `<p class="font-medium">현재 온라인 판매 준비 중입니다.</p><p class="mt-2 text-charcoal/60">판매자 자격과 법적 요건 확인이 완료되면 SOOL RESERVE에서 구매하실 수 있습니다. 선물·대량 구매 상담은 <a href="#corporate" class="underline underline-offset-4">기업 VIP 상담</a>을 이용해 주세요.</p>`}</div>
      ${p.isDemo ? `<p class="mt-4 text-xs text-charcoal/50">DEMO · 화면 구성을 위한 가상 상품입니다. 가격·맛 평가·제조 정보는 실제와 무관합니다.</p>` : ""}${p.description ? `<p class="mt-8 text-[15px] leading-loose text-charcoal/75">${e(p.description)}</p>` : ""}
      ${S.isAdmin ? `<a href="#admin.product.${e(p.id)}" class="adm-btn-ghost mt-8">관리자에서 수정</a>` : ""}
    </div></section>
  ${sec("Taste Profile", "맛의 지도", tn >= 3 ? `<div class="grid items-center gap-10 md:grid-cols-2">${radar(taste)}<div><ul class="divide-y divide-line border-y border-line">${taste.map(([l, v]) => `<li class="flex items-center justify-between py-3.5 text-sm"><span>${l}</span>${v == null ? `<span class="text-xs text-charcoal/40">해당 없음</span>` : `<span class="flex items-center gap-3"><span class="flex gap-1">${[1, 2, 3, 4, 5].map((i) => `<span class="h-1.5 w-5 ${i <= v ? "bg-burgundy" : "bg-charcoal/10"}"></span>`).join("")}</span><span class="w-8 text-right font-serif">${v}/5</span></span>`}</li>`).join("")}</ul>
      <p class="mt-4 text-xs text-charcoal/50">출처: ${TSOURCE[p.tasteSource] || "미등록"}${p.tasteEvaluatedAt ? ` · 평가일 ${dateKo(p.tasteEvaluatedAt)}` : ""}${p.isDemo ? " · 데모 값" : ""}</p></div></div>` : `<p class="text-sm text-charcoal/55">아직 검증된 맛 평가 정보가 등록되지 않았습니다. 확인된 정보만 표시합니다.</p>`)}
  ${sec("Details", "상품 정보", `<dl class="grid gap-x-12 text-sm md:grid-cols-2">${dl([["상품명", p.name + (p.nameEn ? ` (${p.nameEn})` : "")], ["제조업체", b.name], ["제조 지역", p.region || b.region], ["주종", LIQUOR[p.liquorType]], ["알코올 도수", `${p.abv}%`], ["용량", `${p.volumeMl}ml`], ["원재료 및 함량", p.ingredients], ["원산지", p.origin], ["제조 방식", p.productionMethod], ["숙성", [p.agingMethod, p.agingPeriod].filter(Boolean).join(" · ")], ["유통·품질유지기한", p.shelfLife], ["보관 방법", p.storageGuide], ["법적 분류", LEGAL[p.legalClass]], ["통신판매 적격", ELIG[p.eligibility] + (p.isDemo ? " (데모)" : "")]])}</dl>`)}
  <section class="mt-24 bg-charcoal py-20 text-ivory md:mt-32 md:py-28"><div class="container-site grid gap-12 md:grid-cols-12"><div class="md:col-span-5"><p class="font-serif text-xs uppercase tracking-luxe text-gold">The Brewery</p><h2 class="mt-4 font-kserif text-3xl font-light">${e(b.name)}</h2><p class="mt-3 font-serif text-lg italic text-ivory/50">${e(b.tagline)}</p><p class="mt-8 text-[15px] leading-loose text-ivory/70">${e(b.history)}</p><a href="#brewery.${e(b.id)}" class="mt-8 inline-block text-sm text-gold hover:text-ivory">양조장 이야기 전체 보기 →</a></div>
    <dl class="divide-y divide-ivory/10 border-y border-ivory/10 md:col-span-6 md:col-start-7">${[["장인 이야기", b.artisan], ["원료 생산 지역", b.ingredientOrigin], ["물과 누룩", b.waterAndNuruk], ["제조 방법", b.method], ["숙성", b.aging], ["제조 철학", b.philosophy], ["수상 내역", b.awardsVerified ? b.awards : null]].filter(([, v]) => v).map(([k, v]) => `<div class="grid gap-2 py-5 md:grid-cols-3"><dt class="text-xs tracking-wider text-gold/80">${k}</dt><dd class="text-sm leading-relaxed text-ivory/80 md:col-span-2">${e(v)}</dd></div>`).join("")}</dl></div></section>
  ${sec("Serving Guide", "이렇게 즐기세요", `<div class="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">${[["권장 음용 온도", p.servingTemp], ["추천 술잔", p.glassware], ["냉장 후 음용", p.chillBeforeServing == null ? null : p.chillBeforeServing ? "권장" : "상온 권장"], ["개봉 후 보관", p.afterOpening]].map(([k, v]) => `<div class="bg-ivory p-6"><p class="text-xs text-charcoal/50">${k}</p><p class="mt-3 font-kserif text-[15px] leading-relaxed">${v ? e(v) : `<span class="text-charcoal/35">확인 중</span>`}</p></div>`).join("")}</div>${p.aromaNotes ? `<p class="mt-6 text-sm text-charcoal/65">향과 특징 — ${e(p.aromaNotes)}</p>` : ""}`)}
  ${pairings.length ? sec("Food Pairing", "함께하면 좋은 음식", `<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">${pairings.map((x) => `<div class="border border-line bg-white/50 p-6"><span class="text-xs tracking-wider text-gold-deep">${e(x.category)}</span><h3 class="mt-3 font-kserif text-lg">${e(x.name)}</h3>${x.description ? `<p class="mt-2 text-sm leading-relaxed text-charcoal/65">${e(x.description)}</p>` : ""}${x.recipe ? `<details class="mt-4 text-sm"><summary class="cursor-pointer text-xs text-burgundy">간단 레시피</summary><p class="mt-2 text-charcoal/65">${e(x.recipe)}</p></details>` : ""}</div>`).join("")}</div>`) : ""}
  ${sec("Gift & Delivery", "선물과 배송", `<div class="grid gap-12 text-sm md:grid-cols-2"><div><h3 class="font-kserif text-lg">선물 정보</h3><dl class="mt-4">${dl([["추천 대상", p.giftRecommendFor], ["선물 상자 구성", p.giftBoxContents], ["포장 옵션", p.giftWrapOptions], ["쇼핑백", p.shoppingBag ? "제공" : "미제공"], ["메시지 카드", p.messageCard ? "지원" : "미지원"], ["선물 배송", p.giftDelivery ? "가능" : "판매 승인 및 수령인 연령 확인 체계 마련 후 제공"]])}</dl></div>
    <div><h3 class="font-kserif text-lg">배송 · 보관</h3><dl class="mt-4">${dl([["배송 유형", p.storageType === "REFRIGERATED" ? "냉장 배송" : "일반(상온) 배송"], ["권장 보관 온도", p.storageTemp], ["보냉 포장", p.coldChainRequired ? p.coldPackaging || "보냉 포장" : null], ["출고 요일", (p.shipDays || []).join(" · ")], ["공휴일 전 출고", p.noShipBeforeHoliday ? "출고 제한" : null], ["배송 지역", p.shipRegions], ["파손 방지 포장", p.protectivePackaging], ["파손 처리", p.damagePolicy]])}</dl></div></div>`)}
  <section class="container-site mt-20"><div class="space-y-2 border-t border-line pt-6 text-[11px] leading-relaxed text-charcoal/50"><p>판매자(제조사): ${e(b.name)}${p.isDemo ? " — 데모 데이터로 실제 사업자 정보가 아닙니다." : ""}</p>${inter ? `<p>${e(inter.body)}</p>` : ""}${w ? `<p>${e(w.body)}</p>` : ""}${shownPrice(p) !== null && priceMode() === "REFERENCE" ? `<p>표시 가격 ${won(p.price)}은 참고 소비자가이며 실제 판매가와 다를 수 있습니다.</p>` : ""}</div></section>
  ${related.length ? sec("From the Same Brewery", `${e(b.name)}의 다른 술`, `<div class="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">${related.map(card).join("")}</div>`) : ""}
  </article>`;
}

function vBreweries() {
  const list = Object.values(S.breweries).filter(visibleBrewery).sort((a, b) => (a.foundedYear || 0) - (b.foundedYear || 0));
  return `<div class="container-site pt-12 md:pt-20"><header class="max-w-2xl"><p class="eyebrow">Master Breweries</p><h1 class="h-display mt-4">술을 빚는 사람들.</h1><p class="mt-5 text-[15px] leading-relaxed text-charcoal/60">지역의 물과 쌀, 집안의 누룩, 그리고 시간을 지켜 온 양조장들을 소개합니다.</p></header>
  <div class="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">${list.map((b) => `<a href="#brewery.${e(b.id)}" class="group block"><div class="relative overflow-hidden"><div class="transition duration-700 group-hover:scale-[1.02]">${breweryArt(b)}</div>${b.isDemo ? demo("absolute left-3 top-3") : ""}</div><p class="eyebrow mt-5">${e(b.region)}${b.foundedYear ? ` · Since ${b.foundedYear}` : ""}</p><h2 class="mt-2 font-kserif text-xl">${e(b.name)}</h2><p class="mt-2 text-sm text-charcoal/60">${e(b.tagline)}</p><p class="mt-3 text-xs text-charcoal/45">소개 상품 ${publicProducts().filter((p) => p.brewery === b.id).length}종</p></a>`).join("")}</div></div>`;
}

function vBrewery(id) {
  const b = S.breweries[id];
  if (!b || (!visibleBrewery(b) && !S.isAdmin)) return vNotFound();
  const products = publicProducts().filter((p) => p.brewery === id);
  const arts = publicArticles().filter((a) => a.brewery === id).slice(0, 3);
  const gallery = (b.gallery || []).filter((g) => g && g.url);
  return `<section class="container-site grid items-center gap-10 pt-10 md:grid-cols-12 md:gap-16 md:pt-16"><div class="relative md:col-span-7">${breweryArt(b)}${b.isDemo ? demo("absolute left-4 top-4") : ""}</div>
    <div class="md:col-span-5"><p class="eyebrow">${e(b.region)}${b.foundedYear ? ` · Since ${b.foundedYear}` : ""}</p><h1 class="h-display mt-4">${e(b.name)}</h1>${b.nameEn ? `<p class="mt-2 font-serif text-lg italic text-charcoal/50">${e(b.nameEn)}</p>` : ""}${b.tagline ? `<p class="mt-6 font-kserif text-lg text-burgundy">“${e(b.tagline)}”</p>` : ""}${b.history ? `<p class="mt-6 text-[15px] leading-loose text-charcoal/70">${e(b.history)}</p>` : ""}${b.isDemo ? `<p class="mt-6 text-xs text-charcoal/50">DEMO · 화면 구성을 위한 가상 양조장으로, 실제 입점 업체가 아닙니다.</p>` : ""}${S.isAdmin ? `<a href="#admin.brewery.${e(b.id)}" class="adm-btn-ghost mt-6">관리자에서 수정</a>` : ""}</div></section>
  ${b.artisan ? `<section class="mt-24 bg-charcoal py-20 text-ivory md:mt-32 md:py-28"><div class="container-site grid items-center gap-12 md:grid-cols-12"><div class="md:col-span-4">${b.artisanImageUrl ? `<img src="${e(b.artisanImageUrl)}" alt="${e(b.name)} 장인" class="aspect-[4/5] w-full object-cover">` : `<div class="art-fill aspect-[4/5] overflow-hidden opacity-90">${ART.artisan}</div>`}</div>
    <div class="md:col-span-7 md:col-start-6"><p class="font-serif text-xs uppercase tracking-luxe text-gold">The Artisan</p>${b.artisanTitle ? `<p class="mt-4 text-xs tracking-wider text-gold/80">${e(b.artisanTitle)}</p>` : ""}<p class="mt-6 font-kserif text-2xl font-light leading-relaxed md:text-3xl">${e(b.artisan)}</p>${b.philosophy ? `<blockquote class="mt-10 border-l border-gold pl-6 font-kserif text-lg text-ivory/80">“${e(b.philosophy)}”</blockquote>` : ""}</div></div></section>` : ""}
  <section class="container-site mt-24 md:mt-32"><p class="eyebrow">The Process</p><h2 class="h-section mt-3">한 병이 되기까지</h2>
    ${gallery.length ? `<div class="mt-12 grid gap-6 md:grid-cols-3">${gallery.map((g) => `<figure><img src="${e(g.url)}" alt="${e(g.caption || b.name)}" class="aspect-[4/3] w-full object-cover">${g.caption ? `<figcaption class="mt-3 text-sm text-charcoal/65">${e(g.caption)}</figcaption>` : ""}</figure>`).join("")}</div>` : `<ol class="mt-12 grid grid-cols-2 gap-4 md:grid-cols-6">${PROCESS.map(([k, l, en], i) => `<li class="list-none"><div class="art-fill">${ART[`process_${k}`]}</div><p class="mt-3 font-serif text-xs text-gold-deep">${String(i + 1).padStart(2, "0")} · ${en}</p><p class="mt-1 font-kserif text-[15px]">${l}</p></li>`).join("")}</ol>`}
    <dl class="mx-auto mt-16 max-w-3xl divide-y divide-line border-y border-line">${[["원료의 생산 지역", b.ingredientOrigin], ["물과 누룩", b.waterAndNuruk], ["전통 제조 방법", b.method], ["숙성 과정", b.aging], ["수상 내역", b.awardsVerified ? b.awards : null]].filter(([, v]) => v).map(([k, v]) => `<div class="grid gap-3 py-6 md:grid-cols-4"><dt class="eyebrow md:pt-1">${k}</dt><dd class="text-[15px] leading-loose text-charcoal/75 md:col-span-3">${e(v)}</dd></div>`).join("")}</dl></section>
  ${products.length ? `<section class="container-site mt-24 md:mt-32"><p class="eyebrow">Signature</p><h2 class="h-section mb-12 mt-3">대표 제품</h2>${grid(products)}</section>` : ""}
  ${arts.length ? `<section class="container-site mt-24 md:mt-32"><p class="eyebrow">Journal</p><h2 class="h-section mb-12 mt-3">${e(b.name)}의 이야기</h2><div class="grid gap-10 md:grid-cols-3">${arts.map(articleCard).join("")}</div></section>` : ""}`;
}

function vGift(arg) {
  const g = GIFTS[Number(arg)];
  const all = publicProducts();
  const featured = (S.settings.featured?.GIFT || []).map((id) => all.find((p) => p.id === id)).filter(Boolean);
  const list = g ? all.filter((p) => (p.giftPurposes || []).includes(g[0])) : featured.length ? featured : all.filter((p) => (p.giftPurposes || []).length);
  return `<section class="bg-charcoal pb-20 pt-16 text-ivory md:pb-28 md:pt-24"><div class="container-site"><p class="font-serif text-xs uppercase tracking-luxe text-gold">Premium Gift</p><h1 class="h-display mt-4 max-w-3xl">마음을 전하는 가장 품격 있는 방법.</h1><p class="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/60">전용 선물 상자, 한지·보자기 포장, 메시지 카드까지. 받는 분과 자리에 맞춰 고른 전통주 선물 컬렉션입니다.</p>
    <div class="mt-12 flex flex-wrap gap-2"><a href="#gift" class="border px-4 py-2 text-sm ${!g ? "border-gold bg-gold text-charcoal" : "border-ivory/25 hover:border-ivory"}">추천 선물</a>${GIFTS.map((x, i) => `<a href="#gift.${i}" class="border px-4 py-2 text-sm ${g === x ? "border-gold bg-gold text-charcoal" : "border-ivory/25 hover:border-ivory"}">${x[0]}</a>`).join("")}</div></div></section>
  <section class="container-site pt-16 md:pt-24"><div class="mb-10 flex items-end justify-between"><h2 class="h-section">${g ? g[0] : "SOOL RESERVE 추천 선물"}</h2><span class="text-xs text-charcoal/50">${list.length}종</span></div>${list.length ? grid(list) : `<p class="py-20 text-center text-sm text-charcoal/50">해당 목적의 선물이 준비 중입니다.</p>`}</section>
  <section class="container-site mt-24 grid gap-px border border-line bg-line md:grid-cols-4">${[["프리미엄 선물 상자", "상품별 전용 상자 또는 오동나무 상자"], ["한지 · 보자기 포장", "전통 소재로 마감한 선물 포장"], ["메시지 카드", "손글씨 느낌의 인쇄 카드 동봉"], ["희망 배송일", "판매 기능 활성화 후 제공 예정"]].map(([t, d]) => `<div class="bg-ivory p-8"><h3 class="font-kserif text-lg">${t}</h3><p class="mt-2 text-sm text-charcoal/60">${d}</p></div>`).join("")}</section>
  <p class="container-site mt-6 text-xs text-charcoal/50">선물 배송은 판매자 자격, 수령인 연령 확인, 배송 관련 법적 조건이 확인된 이후 제공됩니다. 대량·기업 선물은 <a href="#corporate" class="underline underline-offset-4">기업 VIP 상담</a>을 이용해 주세요.</p>`;
}

function vTaste() {
  const q = S.quiz, tiers = S.settings.priceTiers || [];
  const opt = (act, v, on, label) => `<button data-act="${act}" data-v="${e(v)}" aria-pressed="${on}" class="border px-4 py-5 font-kserif text-[15px] transition ${on ? "border-burgundy bg-burgundy text-ivory" : "border-charcoal/15 bg-white/40 hover:border-charcoal/50"}">${label}</button>`;
  const budgets = [[null, "상관없음"], ...tiers.map((t, i) => [[t, tiers[i + 1] ? tiers[i + 1] - 1 : 0], i < tiers.length - 1 ? `${t / 10000}~${tiers[i + 1] / 10000}만 원` : `${t / 10000}만 원 이상`])];
  const steps = [
    ["어떤 맛을 좋아하시나요?", "여러 개 선택할 수 있습니다.", [["sweet", "달콤한"], ["dry", "드라이한"], ["acidic", "산미가 있는"], ["aromatic", "향이 풍부한"], ["full", "묵직한 바디"], ["sparkling", "탄산이 있는"], ["smooth", "부드러운"]].map(([k, l]) => opt("q-taste", k, q.tastes.includes(k), l))],
    ["어떤 주종을 선호하시나요?", "선택하지 않으면 모든 주종에서 찾습니다.", Object.entries(LIQUOR).map(([k, l]) => opt("q-type", k, q.types.includes(k), l))],
    ["어떤 음식과 함께 드실 예정인가요?", "", PAIR_CATS.map((c) => opt("q-food", c, q.food === c, c))],
    ["직접 드시나요, 선물하시나요?", "", [opt("q-purpose", "self", q.purpose === "self", "직접 즐길 술"), opt("q-purpose", "gift", q.purpose === "gift", "선물할 술")]],
    ...(priceMode() !== "HIDDEN" ? [["선호하는 가격대는 얼마인가요?", "참고 소비자가 기준", budgets.map(([v, l], i) => opt("q-budget", i, JSON.stringify(q.budget) === JSON.stringify(v), l))]] : []),
  ];
  const top = `<header class="mx-auto max-w-2xl text-center"><p class="eyebrow">Taste Discovery</p><h1 class="h-display mt-4">당신의 취향에 맞는 명주.</h1><p class="mt-5 text-[15px] text-charcoal/60">다섯 가지 질문에 답해 주세요. 실제 등록된 맛 프로필과 상품 정보만으로 추천합니다.</p></header>`;
  if (q.results) {
    return `<div class="container-site pt-12 md:pt-20">${top}<section class="mt-16"><div class="flex items-end justify-between border-b border-line pb-6"><h2 class="h-section">추천 결과</h2><button data-act="q-reset" class="link-u text-sm">다시 하기</button></div>
    ${q.results.length ? `<div class="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">${q.results.map((r, i) => `<a href="#product.${e(r.p.id)}" class="group block"><div class="relative">${productImg(r.p)}<span class="absolute right-3 top-3 font-serif text-3xl text-charcoal/25">0${i + 1}</span>${r.p.isDemo ? demo("absolute left-3 top-3") : ""}</div><p class="mt-4 text-[11px] tracking-wider text-charcoal/50">${e(S.breweries[r.p.brewery]?.name)}</p><h3 class="mt-1 font-kserif text-lg">${e(r.p.name)}</h3><ul class="mt-3 space-y-1 text-xs text-burgundy">${r.reasons.slice(0, 3).map((x) => `<li>· ${e(x)}</li>`).join("")}</ul><div class="mt-3">${priceTag(r.p)}</div></a>`).join("")}</div>` : `<p class="py-20 text-center text-sm text-charcoal/55">조건에 맞는 술을 찾지 못했습니다. 선택을 조금 넓혀 보세요.</p>`}</section></div>`;
  }
  const cur = steps[q.step], last = q.step === steps.length - 1;
  return `<div class="container-site pt-12 md:pt-20">${top}<section class="mx-auto mt-14 max-w-3xl"><div class="flex gap-1.5">${steps.map((_, i) => `<span class="h-0.5 flex-1 ${i <= q.step ? "bg-burgundy" : "bg-charcoal/10"}"></span>`).join("")}</div>
    <p class="mt-10 font-serif text-sm text-charcoal/45">Question ${q.step + 1} / ${steps.length}</p><h2 class="mt-3 font-kserif text-2xl md:text-3xl">${cur[0]}</h2>${cur[1] ? `<p class="mt-2 text-sm text-charcoal/50">${cur[1]}</p>` : ""}
    <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">${cur[2].join("")}</div>
    <div class="mt-12 flex justify-between"><button data-act="q-prev" class="btn-ghost" ${q.step === 0 ? "disabled" : ""}>이전</button>${last ? `<button data-act="q-go" class="btn-primary">추천 받기</button>` : `<button data-act="q-next" class="btn-primary">다음</button>`}</div></section></div>`;
}

function vMagazine(cat) {
  const c = ART_CAT[cat] ? cat : "";
  const list = publicArticles().filter((a) => !c || a.category === c);
  const [lead, ...rest] = list;
  return `<div class="container-site pt-12 md:pt-20"><header class="max-w-2xl"><p class="eyebrow">Journal</p><h1 class="h-display mt-4">술의 격, 매거진</h1><p class="mt-5 text-[15px] text-charcoal/60">술을 빚는 사람과 땅, 그리고 술을 곁에 두는 법에 관한 기록.</p></header>
  <nav class="mt-10 flex flex-wrap gap-2 border-b border-line pb-6"><a href="#magazine" class="chip ${!c ? "chip-on" : ""}">전체</a>${Object.entries(ART_CAT).map(([k, v]) => `<a href="#magazine.${k}" class="chip ${c === k ? "chip-on" : ""}">${v[0]}</a>`).join("")}</nav>
  ${!lead ? `<p class="py-24 text-center text-sm text-charcoal/50">준비 중인 이야기입니다.</p>` : `<a href="#article.${e(lead.id)}" class="group mt-12 grid items-center gap-8 md:grid-cols-12 md:gap-14"><div class="relative overflow-hidden md:col-span-7">${articleCover(lead)}${lead.isDemo ? demo("absolute left-4 top-4") : ""}</div><div class="md:col-span-5"><p class="eyebrow">${ART_CAT[lead.category][1]}${lead.readMinutes ? ` · ${lead.readMinutes} min read` : ""}</p><h2 class="mt-4 font-kserif text-3xl font-light leading-snug group-hover:text-burgundy md:text-4xl">${e(lead.title)}</h2>${lead.subtitle ? `<p class="mt-3 font-serif text-lg italic text-charcoal/50">${e(lead.subtitle)}</p>` : ""}${lead.excerpt ? `<p class="mt-6 text-[15px] leading-loose text-charcoal/65">${e(lead.excerpt)}</p>` : ""}<span class="link-u mt-8 inline-block text-sm">읽기 →</span></div></a>
  ${rest.length ? `<div class="mt-20 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">${rest.map(articleCard).join("")}</div>` : ""}`}</div>`;
}

function vArticle(id) {
  const a = publicArticles().find((x) => x.id === id) || (S.isAdmin ? S.articles[id] : null);
  if (!a) return vNotFound();
  const prods = (a.productSlugs || []).map((s) => publicProducts().find((p) => p.id === s)).filter(Boolean);
  const w = currentNotice("HEALTH_WARNING"), b = a.brewery ? S.breweries[a.brewery] : null;
  const body = parseBody(a.body).map((x) => (x.t === "h2" ? `<h2 class="!mt-14 font-kserif text-2xl font-light text-charcoal">${e(x.x)}</h2>` : x.t === "q" ? `<blockquote class="!my-12 border-l-2 border-gold py-1 pl-6 font-kserif text-xl leading-relaxed text-burgundy md:text-2xl">${e(x.x)}</blockquote>` : x.t === "ul" ? `<ul class="space-y-2 border-y border-line py-6">${x.items.map((i) => `<li class="flex gap-3"><span class="mt-[0.9em] h-px w-3 shrink-0 bg-gold"></span><span>${e(i)}</span></li>`).join("")}</ul>` : `<p>${e(x.x)}</p>`)).join("");
  return `<article><header class="container-site max-w-4xl pt-12 text-center md:pt-20"><a href="#magazine.${a.category}" class="eyebrow hover:text-burgundy">${ART_CAT[a.category][1]} · ${ART_CAT[a.category][0]}</a><h1 class="mx-auto mt-6 max-w-3xl font-kserif text-3xl font-light leading-snug md:text-5xl md:leading-tight">${e(a.title)}</h1>${a.subtitle ? `<p class="mt-4 font-serif text-lg italic text-charcoal/55 md:text-xl">${e(a.subtitle)}</p>` : ""}<p class="mt-8 text-xs tracking-wider text-charcoal/45">${e(a.author || "SOOL RESERVE 편집부")} · ${dateKo(a.publishedAt)}${a.readMinutes ? ` · ${a.readMinutes}분 읽기` : ""}</p></header>
  <figure class="container-site mt-12 max-w-6xl"><div class="relative">${articleCover(a)}${a.isDemo ? demo("absolute left-4 top-4") : ""}</div></figure>
  <div class="container-site mt-14 max-w-2xl md:mt-20">${a.excerpt ? `<p class="mb-12 font-kserif text-xl leading-relaxed text-charcoal/85 md:text-2xl">${e(a.excerpt)}</p>` : ""}<div class="space-y-7 text-[16px] leading-[2] text-charcoal/80">${body}</div>
  ${b ? `<p class="mt-14 border-t border-line pt-6 text-sm">이 글의 양조장 — <a href="#brewery.${e(b.id)}" class="link-u text-burgundy">${e(b.name)}</a></p>` : ""}${a.isDemo ? `<p class="mt-6 text-xs text-charcoal/45">DEMO · 화면 구성을 위한 예시 콘텐츠입니다. 등장하는 양조장·인물·상품은 가상입니다.</p>` : ""}${w ? `<p class="mt-6 bg-beige/70 px-4 py-3 text-[11px] leading-relaxed text-charcoal/60">${e(w.body)}</p>` : ""}${S.isAdmin ? `<a href="#admin.article.${e(a.id)}" class="adm-btn-ghost mt-6">관리자에서 수정</a>` : ""}</div>
  ${prods.length ? `<section class="container-site mt-24"><p class="eyebrow">In This Story</p><h2 class="h-section mb-10 mt-3">이야기 속의 술</h2><div class="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">${prods.map(card).join("")}</div></section>` : ""}</article>`;
}

// 문의 폼 (claude.ai 저장소의 inq/<viewer id> 문서에 저장)
function inquiryForm(type, fields, submit, privacy, marketing) {
  if (S.sent[type]) return `<div class="border border-line bg-white/60 p-10 text-center"><p class="font-kserif text-xl">감사합니다.</p><p class="mt-3 text-sm text-charcoal/65">접수되었습니다. 담당자가 확인 후 연락드리겠습니다.</p><button data-act="sent-reset" data-v="${type}" class="link-u mt-6 text-sm">새로 작성</button></div>`;
  return `<form data-form="inquiry" data-type="${type}" class="space-y-8" novalidate><div class="grid gap-x-8 gap-y-7 md:grid-cols-2">${fields.map((f) => `<label class="${f.full || f.type === "textarea" ? "md:col-span-2" : ""}"><span class="text-xs tracking-wide text-charcoal/55">${f.label}${f.req ? `<span class="text-burgundy"> *</span>` : ""}</span>${f.type === "textarea" ? `<textarea id="i-${type}-${f.name}" name="${f.name}" rows="5" placeholder="${e(f.ph || "")}" class="finput resize-y"></textarea>` : f.type === "select" ? `<select id="i-${type}-${f.name}" name="${f.name}" class="finput"><option value="">선택해 주세요</option>${f.options.map((o) => `<option>${o}</option>`).join("")}</select>` : `<input id="i-${type}-${f.name}" name="${f.name}" type="${f.type || "text"}" placeholder="${e(f.ph || "")}" class="finput">`}</label>`).join("")}</div>
  <div class="space-y-3 border-t border-line pt-6 text-sm"><label class="flex items-start gap-3"><input type="checkbox" name="consentPrivacy" class="mt-1 accent-burgundy"><span><b class="font-medium">[필수]</b> 개인정보 수집·이용에 동의합니다.<span class="mt-1 block text-xs text-charcoal/50">${privacy}</span></span></label>${marketing ? `<label class="flex items-start gap-3"><input type="checkbox" name="consentMarketing" class="mt-1 accent-burgundy"><span><b class="font-medium">[선택]</b> 신상품·큐레이션 등 광고성 정보 수신에 동의합니다. (언제든 수신 거부 가능)</span></label>` : ""}</div>
  <p data-err class="hidden text-sm text-burgundy"></p><button class="btn-primary w-full md:w-auto">${submit}</button></form>`;
}
const pageHead = (eb, t, d) => `<header class="max-w-2xl"><p class="eyebrow">${eb}</p><h1 class="h-display mt-4">${t}</h1>${d ? `<p class="mt-5 text-[15px] leading-relaxed text-charcoal/60">${d}</p>` : ""}</header>`;

function vCorporate() {
  return `<section class="bg-burgundy pb-20 pt-16 text-ivory md:pb-28 md:pt-24"><div class="container-site grid gap-12 md:grid-cols-2"><div><p class="font-serif text-xs uppercase tracking-luxe text-gold">Corporate & VIP</p><h1 class="h-display mt-4">브랜드의 태도를 담은 선물.</h1><p class="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/65">예산과 수량, 받는 분에 맞춰 SOOL RESERVE 큐레이터가 구성을 제안해 드립니다. 명절 대량 주문과 맞춤 패키지도 상담 가능합니다.</p></div>
  <ol class="grid gap-px self-end bg-ivory/15 sm:grid-cols-2">${[["01", "상담 신청", "회사·예산·수량·희망일"], ["02", "구성 제안", "예산별 추천 상품과 패키지"], ["03", "샘플 · 확정", "포장·카드 문구 확정"], ["04", "판매자 연결", "적격 판매자가 거래·배송 담당"]].map(([n, t, d]) => `<li class="bg-burgundy p-6"><span class="font-serif text-gold">${n}</span><p class="mt-2 font-kserif text-lg">${t}</p><p class="mt-1 text-xs text-ivory/55">${d}</p></li>`).join("")}</ol></div></section>
  <section class="container-site mt-20 grid gap-16 md:grid-cols-12"><div class="md:col-span-4"><h2 class="h-section">상담 신청</h2><p class="mt-4 text-sm leading-relaxed text-charcoal/60">접수된 내용은 상담 목적으로만 사용됩니다. 실제 주류 거래는 통신판매 자격을 갖춘 판매자(양조장)가 담당합니다.</p></div><div class="md:col-span-8">${inquiryForm("CORPORATE", [{ name: "company", label: "회사명", req: 1 }, { name: "name", label: "담당자명", req: 1 }, { name: "phone", label: "연락처", type: "tel", req: 1 }, { name: "email", label: "이메일", type: "email" }, { name: "budgetPerUnit", label: "1인당 예산", type: "select", options: ["10만 원대", "20만 원대", "30만 원대", "50만 원 이상", "미정"] }, { name: "quantity", label: "예상 수량", type: "number" }, { name: "desiredDate", label: "배송 희망일", type: "date" }, { name: "occasion", label: "목적", type: "select", options: ["명절 선물", "VIP 감사 선물", "임직원 선물", "행사·기념품", "기타"] }, { name: "message", label: "요청 사항", type: "textarea", ph: "맞춤 패키지, 로고 각인, 카드 문구 등" }], "상담 신청하기", "수집 항목: 이름, 회사명, 연락처, 이메일 / 목적: 기업 선물 상담 / 보관: 상담 종료 후 1년")}</div></section>`;
}
function vPartnership() {
  return `<div class="container-site pt-12 md:pt-20">${pageHead("Partnership", "함께 술의 격을 만들어 갈 양조장을 찾습니다.", "제출하신 정보는 입점 검토에만 사용됩니다. 제조면허, 통신판매 자격 등 서류는 담당자 연락 후 별도 보안 채널로 받습니다.")}
  <ol class="mt-12 flex flex-wrap gap-y-3 text-xs">${ONBOARD_FLOW.map((s, i) => `<li class="flex items-center"><span class="border border-line bg-white/60 px-3 py-2"><span class="mr-1.5 font-serif text-gold-deep">${i + 1}</span>${ONBOARD[s]}</span>${i < ONBOARD_FLOW.length - 1 ? `<span class="mx-2 text-charcoal/30">→</span>` : ""}</li>`).join("")}</ol>
  <div class="mt-16 max-w-4xl">${inquiryForm("PARTNERSHIP", [{ name: "company", label: "양조장 이름", req: 1 }, { name: "businessNumber", label: "사업자등록번호" }, { name: "address", label: "사업장 소재지", full: 1 }, { name: "name", label: "담당자", req: 1 }, { name: "phone", label: "연락처", type: "tel", req: 1 }, { name: "email", label: "이메일", type: "email" }, { name: "website", label: "홈페이지", type: "url" }, { name: "legalClass", label: "전통주 법적 분류", type: "select", options: ["민속주", "지역특산주", "해당 없음", "잘 모르겠음"] }, { name: "products", label: "대표 상품 (상품명 · 도수 · 용량 · 희망 판매가)", type: "textarea" }, { name: "message", label: "브랜드 소개 · 공급 조건 · 배송 정책", type: "textarea" }], "입점 신청하기", "수집 항목: 담당자명, 연락처, 이메일 / 목적: 입점 검토 및 연락 / 보관: 검토 종료 후 1년")}</div></div>`;
}
function vSupport() {
  const ns = [currentNotice("SHIPPING_POLICY"), currentNotice("RETURN_POLICY")].filter(Boolean);
  const faqs = [["지금 바로 주문할 수 있나요?", "현재 SOOL RESERVE는 전통주 소개·큐레이션 서비스로 운영 중입니다. 판매자 자격과 법적 요건 확인이 끝나면 주문 기능을 열 예정입니다."], ["표시된 가격은 무엇인가요?", "판매자가 제공한 참고 소비자가입니다. 실제 판매가는 판매 개시 시점에 달라질 수 있습니다."], ["맛 그래프는 누가 평가하나요?", "제조사 제공 정보 또는 SOOL RESERVE 자체 테이스팅이며, 상품 상세에 출처를 표시합니다."], ["기업 선물 대량 구매가 가능한가요?", "기업 VIP 상담을 통해 구성 제안을 받으실 수 있으며, 실제 거래는 적격 판매자가 담당합니다."]];
  return `<div class="container-site pt-12 md:pt-20">${pageHead("Customer Care", "고객센터")}<section class="mt-14 grid gap-12 md:grid-cols-2">${ns.map((x) => `<div class="border-t border-charcoal pt-6"><h2 class="font-kserif text-xl">${e(x.title)}</h2><p class="mt-4 whitespace-pre-line text-sm leading-loose text-charcoal/70">${e(x.body)}</p></div>`).join("")}</section>
  <section class="mt-20"><h2 class="h-section">자주 묻는 질문</h2><div class="mt-8 divide-y divide-line border-y border-line">${faqs.map(([q, a]) => `<details class="group py-5"><summary class="flex cursor-pointer list-none items-center justify-between font-kserif text-[17px]">${q}<span class="text-charcoal/40 transition group-open:rotate-45">+</span></summary><p class="mt-3 text-sm leading-relaxed text-charcoal/65">${a}</p></details>`).join("")}</div></section>
  <section class="mt-20 max-w-3xl"><h2 class="h-section">1:1 문의</h2><div class="mt-8">${inquiryForm("CUSTOMER", [{ name: "name", label: "이름", req: 1 }, { name: "email", label: "이메일", type: "email", req: 1 }, { name: "category", label: "문의 유형", type: "select", options: ["상품 문의", "선물 문의", "배송 문의", "기타"] }, { name: "phone", label: "연락처", type: "tel" }, { name: "message", label: "문의 내용", type: "textarea", req: 1 }], "문의 접수", "수집 항목: 이름, 이메일, 연락처 / 목적: 문의 응대 / 보관: 처리 완료 후 1년")}</div></section></div>`;
}
function vStory() {
  const crit = ["전통주 온라인 판매 적격 여부", "양조장 인지도와 신뢰도", "브랜드 스토리와 장인정신", "술의 품질과 완성도", "희소성과 한정 생산", "병과 패키지 디자인", "선물로서의 가치", "지속 가능한 거래 구조", "안정적인 공급", "배송과 보관"];
  return `<section class="hero-light"><div class="container-site py-24 text-center md:py-36"><p class="eyebrow">Our Philosophy</p><h1 class="mx-auto mt-6 max-w-3xl font-kserif text-3xl font-light leading-relaxed md:text-5xl md:leading-snug">좋은 술을 넘어,<br>가치 있는 술을 선택합니다.</h1><div class="mx-auto my-10 h-px w-12 bg-gold"></div><p class="mx-auto max-w-2xl text-[15px] leading-loose text-charcoal/65">대한민국에는 오랜 역사와 뛰어난 기술을 지닌 양조장이 많습니다. 그러나 그 술들을 한자리에서 비교하고, 철학을 이해하고, 귀한 선물로 고를 수 있는 곳은 드뭅니다. SOOL RESERVE는 그 자리를 만들기 위해 시작했습니다.</p></div></section>
  <section class="container-site mt-20 grid gap-12 md:grid-cols-3">${[["Curation", "많이 파는 대신, 오래 남을 술을 고릅니다.", "가격이 높다는 이유만으로 입점하지 않습니다. 열 가지 기준을 통과한 술만 소개합니다."], ["Story", "술 뒤에 있는 사람과 땅을 전합니다.", "물과 쌀, 누룩, 숙성. 한 병이 만들어지기까지의 시간을 기록합니다."], ["Trust", "확인된 정보만 말합니다.", "맛 평가의 출처, 한정 수량, 수상 내역은 검증된 경우에만 표시합니다."]].map(([en, t, d]) => `<div><p class="font-serif text-sm italic text-gold-deep">${en}</p><h2 class="mt-3 font-kserif text-xl leading-snug">${t}</h2><p class="mt-4 text-sm leading-relaxed text-charcoal/60">${d}</p></div>`).join("")}</section>
  <section class="container-site mt-24"><p class="eyebrow">Selection Criteria</p><h2 class="h-section mt-3">열 가지 선별 기준</h2><ol class="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">${crit.map((t, i) => `<li class="flex gap-6 bg-ivory p-6 md:p-8"><span class="font-serif text-2xl text-gold">${String(i + 1).padStart(2, "0")}</span><h3 class="font-kserif text-[17px]">${t}</h3></li>`).join("")}</ol></section>
  <section class="container-site mt-24 grid gap-12 md:grid-cols-12"><div class="md:col-span-4"><p class="eyebrow">Monthly Reserve</p><h2 class="h-section mt-3">이달의 프리미엄 전통주</h2><p class="mt-4 text-sm leading-relaxed text-charcoal/60">매월 큐레이터가 고른 전통주 이야기와 신상품 소식을 보내드립니다. 정보 구독 서비스이며 주류 정기배송이 아닙니다.</p></div><div class="md:col-span-8">${inquiryForm("NEWSLETTER", [{ name: "name", label: "이름", req: 1 }, { name: "email", label: "이메일", type: "email", req: 1 }], "정보 구독하기", "수집 항목: 이름, 이메일 / 목적: 큐레이션 콘텐츠 발송 / 보관: 구독 해지 시까지", true)}</div></section>`;
}
function vLegal(type) {
  const n = currentNotice(type);
  if (!n) return vNotFound();
  return `<div class="container-site max-w-3xl pt-12 md:pt-20"><h1 class="h-display">${e(n.title)}</h1><p class="mt-4 text-xs text-charcoal/50">버전 ${e(n.version)} · 시행일 ${dateKo(n.effectiveFrom)}</p><div class="mt-10 whitespace-pre-line border-t border-line pt-8 text-[15px] leading-loose text-charcoal/75">${e(n.body)}</div></div>`;
}
function vNotFound() {
  return `<div class="container-site flex min-h-[50vh] flex-col items-center justify-center py-24 text-center"><h1 class="font-kserif text-3xl font-light">페이지를 찾을 수 없습니다.</h1><a href="#" class="btn-ghost mt-10">홈으로</a></div>`;
}

// 19세 안내 (고지 목적 — 실제 구매 자격 검증은 판매 개시 시 본인확인 기반 성인 인증으로 별도 수행)
function ageGate() {
  let seen = false;
  try { seen = !!localStorage.getItem("sr_age_v1"); } catch {}
  if (seen || S.ageOk) return "";
  return `<div class="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="age-t"><div class="w-full max-w-md bg-ivory px-8 py-10 text-center shadow-2xl"><p class="font-serif text-sm tracking-[0.32em]">SOOL RESERVE</p><div class="mx-auto my-6 h-px w-10 bg-gold"></div>
  ${S.ageNo ? `<h2 id="age-t" class="font-kserif text-xl">이용할 수 없습니다</h2><p class="mt-4 text-sm leading-relaxed text-charcoal/70">본 사이트는 주류 정보를 다루고 있어 만 19세 이상만 이용할 수 있습니다.</p>` : `<h2 id="age-t" class="font-kserif text-xl">만 19세 이상이신가요?</h2><p class="mt-4 text-sm leading-relaxed text-charcoal/70">본 사이트는 전통주 정보를 소개합니다. 19세 미만 청소년의 주류 구매는 법으로 금지되어 있으며, 향후 실제 구매 시에는 본인 확인 기반 성인 인증을 별도로 진행합니다.</p><div class="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center"><button data-act="age-yes" class="btn-primary">네, 만 19세 이상입니다</button><button data-act="age-no" class="btn-ghost">아니오</button></div>`}</div></div>`;
}
