"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma, Role } from "@prisma/client";
import { prisma } from "./db";
import { hashPassword, requireStaff } from "./auth";
import { audit, diff } from "./audit";
import { bool, FormError, int, num, oneOf, reqStr, str, type ActionState } from "./form";
import { AUDITED_PRODUCT_FIELDS, parseProductForm } from "./productForm";
import { MAX_GALLERY, saveImage, saveImages } from "./uploads";
import { getSettings, saveSettings, type SalesMode } from "./settings";
import { liveReadiness } from "./commerce";
import { REQUIRED_NOTICES } from "./legal";
import { slugify } from "./format";
import { AD_CHECKS, estimateReadMinutes, missingAdChecks, type AdCheckKey } from "./magazine";

function fail(e: unknown): ActionState {
  if (e instanceof FormError) return { ok: false, message: e.message };
  const err = e as { code?: string; message?: string; digest?: string };
  if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e;
  if (err?.code === "P2002") return { ok: false, message: "이미 사용 중인 값입니다 (URL/slug 또는 이메일 중복)." };
  if (err instanceof Error && /이미지/.test(err.message)) return { ok: false, message: err.message };
  console.error(e);
  return { ok: false, message: "저장 중 오류가 발생했습니다." };
}

function productScopes(role: Role) {
  return {
    content: role === "SUPER_ADMIN" || role === "CURATOR",
    curation: role === "SUPER_ADMIN" || role === "CURATOR",
    economics: role === "SUPER_ADMIN" || role === "FINANCE",
  };
}

// ─── 상품 ────────────────────────────────────────────

// 상품 갤러리: 기존 사진 중 삭제 체크된 것 제외 + 새 업로드 추가 (최대 MAX_GALLERY장)
async function mergeGallery(fd: FormData, current: string[]): Promise<string[]> {
  const remove = new Set(fd.getAll("removeGallery").map(String));
  const added = await saveImages(fd.getAll("galleryImages"));
  const next = [...current.filter((u) => !remove.has(u)), ...added];
  if (next.length > MAX_GALLERY) throw new FormError(`추가 사진은 최대 ${MAX_GALLERY}장까지 등록할 수 있습니다.`);
  return next;
}

export async function saveProduct(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const scopes = productScopes(user.role);
  let id = str(fd, "id");
  try {
    const data = parseProductForm(fd, scopes);
    if (scopes.content) {
      const breweryId = reqStr(fd, "breweryId", "양조장");
      if (!(await prisma.brewery.findUnique({ where: { id: breweryId } }))) throw new FormError("양조장을 선택해 주세요.");
      data.breweryId = breweryId;
      const image = await saveImage(fd.get("image") as File | null);
      if (image) data.imageUrl = image;
      else if (bool(fd, "removeImage")) data.imageUrl = null;
    }
    if (id) {
      const before = await prisma.product.findUniqueOrThrow({ where: { id } });
      if (scopes.content) data.gallery = await mergeGallery(fd, before.gallery);
      const after = await prisma.product.update({ where: { id }, data });
      await audit(user, "UPDATE", "Product", id, diff(before, after, AUDITED_PRODUCT_FIELDS));
    } else {
      if (!scopes.content) throw new FormError("상품 등록 권한이 없습니다.");
      data.gallery = await mergeGallery(fd, []);
      const created = await prisma.product.create({ data: data as Prisma.ProductUncheckedCreateInput });
      id = created.id;
      await audit(user, "CREATE", "Product", id, { name: created.name, price: created.price });
    }
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "저장되었습니다.", redirectTo: `/admin/products/${id}?saved=1` };
}

export async function quickUpdateProduct(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const id = reqStr(fd, "id", "id");
  const before = await prisma.product.findUniqueOrThrow({ where: { id } });
  const data: Prisma.ProductUpdateInput = {};
  const price = int(fd, "price", { min: 0, max: 100_000_000 });
  const stock = int(fd, "stock", { min: 0, max: 1_000_000 });
  if (price !== null) data.price = price;
  if (stock !== null) data.stock = stock;
  const status = str(fd, "status");
  if (status) data.status = oneOf(fd, "status", ["DRAFT", "REVIEW", "PUBLISHED", "HIDDEN"] as const, before.status);
  const after = await prisma.product.update({ where: { id }, data });
  await audit(user, "QUICK_UPDATE", "Product", id, diff(before, after, ["price", "stock", "status"]));
  revalidatePath("/", "layout");
}

export async function deleteProduct(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN"]);
  const id = reqStr(fd, "id", "id");
  const p = await prisma.product.findUniqueOrThrow({ where: { id }, include: { _count: { select: { orderItems: true } } } });
  if (p._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { status: "HIDDEN" } });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  await audit(user, "DELETE", "Product", id, { name: p.name });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

// ─── 양조장 ───────────────────────────────────────────

// 제조 과정 사진 6슬롯: 새 파일 > 기존 URL(삭제 체크 시 제외), 캡션 유지
async function breweryGallery(fd: FormData) {
  const out: { url: string; caption: string | null }[] = [];
  for (let i = 0; i < 6; i++) {
    const uploaded = await saveImage(fd.get(`gallery_${i}_file`) as File | null);
    const existing = bool(fd, `gallery_${i}_remove`) ? null : str(fd, `gallery_${i}_url`, 300);
    const url = uploaded ?? existing;
    if (url) out.push({ url, caption: str(fd, `gallery_${i}_caption`, 120) });
  }
  return out;
}

export async function saveBrewery(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  let id = str(fd, "id");
  try {
    const name = reqStr(fd, "name", "양조장 이름", 80);
    const complianceStatus = oneOf(fd, "complianceStatus", ["PENDING", "APPROVED", "REJECTED"] as const, "PENDING");
    let salesEnabled = bool(fd, "salesEnabled");
    if (salesEnabled && complianceStatus !== "APPROVED") throw new FormError("판매 서류가 승인(APPROVED)된 양조장만 판매 활성화할 수 있습니다.");
    const isSuper = user.role === "SUPER_ADMIN";
    if (!isSuper) salesEnabled = id ? (await prisma.brewery.findUniqueOrThrow({ where: { id } })).salesEnabled : false;

    const data: Prisma.BreweryUncheckedUpdateInput = {
      name,
      slug: slugify(str(fd, "slug", 80) || str(fd, "nameEn", 80) || name),
      nameEn: str(fd, "nameEn", 80),
      region: reqStr(fd, "region", "지역", 60),
      foundedYear: int(fd, "foundedYear", { min: 1000, max: 2100, label: "설립연도" }),
      tagline: str(fd, "tagline", 120),
      history: str(fd, "history"),
      artisan: str(fd, "artisan"),
      artisanTitle: str(fd, "artisanTitle", 120),
      ingredientOrigin: str(fd, "ingredientOrigin", 300),
      waterAndNuruk: str(fd, "waterAndNuruk", 300),
      method: str(fd, "method", 300),
      aging: str(fd, "aging", 300),
      philosophy: str(fd, "philosophy", 500),
      awards: str(fd, "awards", 1000),
      awardsVerified: bool(fd, "awardsVerified"),
      videoUrl: str(fd, "videoUrl", 300),
      website: str(fd, "website", 300),
      onboardingStatus: oneOf(
        fd,
        "onboardingStatus",
        ["APPLIED", "DOCS_REVIEW", "PRODUCT_REVIEW", "PROFIT_REVIEW", "CONTRACT", "APPROVED", "LISTED", "REJECTED"] as const,
        "APPLIED",
      ),
      salesEnabled,
      defaultCommissionRate: num(fd, "defaultCommissionRate", { min: 0, max: 100, label: "기본 수수료율" }),
      supplyTerms: str(fd, "supplyTerms", 2000),
    };
    const image = await saveImage(fd.get("image") as File | null);
    if (image) data.imageUrl = image;
    data.imageCredit = str(fd, "imageCredit", 200);
    data.visualTheme = str(fd, "visualTheme", 20);
    const artisan = await saveImage(fd.get("artisanImage") as File | null);
    if (artisan) data.artisanImageUrl = artisan;
    else if (bool(fd, "removeArtisanImage")) data.artisanImageUrl = null;
    data.gallery = await breweryGallery(fd);
    const compliance = {
      businessName: str(fd, "businessName", 120),
      representative: str(fd, "representative", 60),
      businessNumber: str(fd, "businessNumber", 20),
      address: str(fd, "address", 300),
      contactPhone: str(fd, "contactPhone", 30),
      contactEmail: str(fd, "contactEmail", 120),
      mailOrderNumber: str(fd, "mailOrderNumber", 60),
      liquorLicenseNote: str(fd, "liquorLicenseNote", 1000),
      traditionalBasisNote: str(fd, "traditionalBasisNote", 1000),
      reviewNote: str(fd, "reviewNote", 1000),
      status: complianceStatus,
    };
    if (id) {
      const before = await prisma.brewery.findUniqueOrThrow({ where: { id }, include: { compliance: true } });
      const reviewed = before.compliance?.status !== complianceStatus ? { reviewedBy: user.email, reviewedAt: new Date() } : {};
      const after = await prisma.brewery.update({
        where: { id },
        data: { ...data, compliance: { upsert: { create: { ...compliance, ...reviewed }, update: { ...compliance, ...reviewed } } } },
      });
      await audit(user, "UPDATE", "Brewery", id, {
        ...diff(before, after, ["onboardingStatus", "salesEnabled", "defaultCommissionRate"]),
        ...(before.compliance?.status !== complianceStatus ? { complianceStatus: { from: before.compliance?.status, to: complianceStatus } } : {}),
      });
    } else {
      const created = await prisma.brewery.create({
        data: { ...(data as Prisma.BreweryUncheckedCreateInput), compliance: { create: compliance } },
      });
      id = created.id;
      await audit(user, "CREATE", "Brewery", id, { name });
    }
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "저장되었습니다.", redirectTo: `/admin/breweries/${id}?saved=1` };
}

// ─── 추천 슬롯 ─────────────────────────────────────────

const SLOTS = ["MAIN", "GIFT", "PROFIT", "LIMITED", "SEASONAL"] as const;

export async function addToSlot(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const slot = oneOf(fd, "slot", SLOTS, "MAIN");
  const ids = fd.getAll("productId").map(String).filter(Boolean);
  for (const productId of ids) {
    const max = await prisma.featuredSlot.aggregate({ where: { slot }, _max: { position: true } });
    await prisma.featuredSlot.upsert({
      where: { slot_productId: { slot, productId } },
      create: { slot, productId, position: (max._max.position ?? -1) + 1 },
      update: {},
    });
  }
  await audit(user, "ADD_SLOT", "FeaturedSlot", slot, { productIds: ids });
  revalidatePath("/", "layout");
}

export async function moveSlot(fd: FormData) {
  await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const id = reqStr(fd, "id", "id");
  const dir = fd.get("dir") === "up" ? -1 : 1;
  const cur = await prisma.featuredSlot.findUniqueOrThrow({ where: { id } });
  const list = await prisma.featuredSlot.findMany({ where: { slot: cur.slot }, orderBy: { position: "asc" } });
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await prisma.$transaction(list.map((x, pos) => prisma.featuredSlot.update({ where: { id: x.id }, data: { position: pos } })));
  revalidatePath("/", "layout");
}

export async function updateSlotPeriod(fd: FormData) {
  await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const id = reqStr(fd, "id", "id");
  const s = str(fd, "startsAt");
  const e = str(fd, "endsAt");
  await prisma.featuredSlot.update({ where: { id }, data: { startsAt: s ? new Date(s) : null, endsAt: e ? new Date(`${e}T23:59:59`) : null } });
  revalidatePath("/", "layout");
}

export async function removeSlot(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const id = reqStr(fd, "id", "id");
  await prisma.featuredSlot.delete({ where: { id } });
  await audit(user, "REMOVE_SLOT", "FeaturedSlot", id);
  revalidatePath("/", "layout");
}

// ─── 문의 ─────────────────────────────────────────────

export async function updateInquiry(fd: FormData) {
  await requireStaff();
  const id = reqStr(fd, "id", "id");
  await prisma.inquiry.update({
    where: { id },
    data: { status: oneOf(fd, "status", ["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"] as const, "NEW"), memo: str(fd, "memo", 2000) },
  });
  revalidatePath("/admin/inquiries");
}

// ─── 법적 고지 ──────────────────────────────────────────

const NOTICE_TYPES = ["HEALTH_WARNING", "YOUTH_NOTICE", "INTERMEDIARY", "TERMS", "PRIVACY", "SHIPPING_POLICY", "RETURN_POLICY"] as const;

export async function addNotice(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN"]);
  try {
    const eff = reqStr(fd, "effectiveFrom", "시행일");
    const n = await prisma.legalNotice.create({
      data: {
        type: oneOf(fd, "type", NOTICE_TYPES, "HEALTH_WARNING"),
        title: reqStr(fd, "title", "제목", 120),
        version: reqStr(fd, "version", "버전", 30),
        body: reqStr(fd, "body", "본문", 20000),
        effectiveFrom: new Date(`${eff}T00:00:00+09:00`),
        sourceNote: str(fd, "sourceNote", 500),
      },
    });
    await audit(user, "CREATE", "LegalNotice", n.id, { type: n.type, version: n.version, effectiveFrom: eff });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "새 버전이 등록되었습니다. 시행일 0시(KST)부터 자동 적용됩니다." };
}

export async function deleteNotice(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN"]);
  const id = reqStr(fd, "id", "id");
  const n = await prisma.legalNotice.findUniqueOrThrow({ where: { id } });
  // 이미 시행된 버전은 이력 보존을 위해 삭제 불가
  if (n.effectiveFrom <= new Date()) return;
  await prisma.legalNotice.delete({ where: { id } });
  await audit(user, "DELETE", "LegalNotice", id, { type: n.type, version: n.version });
  revalidatePath("/", "layout");
}

// ─── 시스템 설정 ─────────────────────────────────────────

export async function saveSystemSettings(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN"]);
  try {
    const before = await getSettings();
    const salesMode = oneOf(fd, "salesMode", ["SHOWCASE", "PRIVATE_TEST", "LIVE"] as const, before.salesMode) as SalesMode;
    const pgContractConfirmed = bool(fd, "pgContractConfirmed");
    const settlementStructureConfirmed = bool(fd, "settlementStructureConfirmed");
    if (salesMode === "LIVE" && before.salesMode !== "LIVE") {
      const r = await computeLiveReadiness({ pgContractConfirmed, settlementStructureConfirmed });
      if (!r.ready) throw new FormError("LIVE 전환 조건이 충족되지 않았습니다: " + r.items.filter((x) => !x.ok).map((x) => x.label).join(", "));
    }
    const tiers = (str(fd, "priceTiers") ?? "")
      .split(",")
      .map((x) => Number(x.trim().replace(/,/g, "")))
      .filter((x) => Number.isFinite(x) && x > 0)
      .sort((a, b) => a - b);
    if (!tiers.length) throw new FormError("가격 구간을 1개 이상 입력해 주세요.");
    const weights: Record<string, number> = {};
    for (const k of Object.keys(before.curationWeights)) weights[k] = num(fd, `w_${k}`, { min: 0, max: 10, label: "가중치" }) ?? 0;
    const patch = {
      brandName: reqStr(fd, "brandName", "브랜드명", 40),
      brandNameKo: reqStr(fd, "brandNameKo", "한글 브랜드명", 40),
      slogan: reqStr(fd, "slogan", "슬로건", 80),
      subCopy: reqStr(fd, "subCopy", "서브 카피", 160),
      heroImageUrl: (await saveImage(fd.get("heroImage") as File | null)) ?? (bool(fd, "removeHeroImage") ? null : before.heroImageUrl),
      heroImageAlt: str(fd, "heroImageAlt", 200) ?? "",
      salesMode,
      showReferencePrice: bool(fd, "showReferencePrice"),
      showDemoData: bool(fd, "showDemoData"),
      defaultCommissionRate: num(fd, "defaultCommissionRate", { min: 0, max: 100, label: "기본 수수료율" }) ?? 15,
      minListingPrice: int(fd, "minListingPrice", { min: 0, label: "입점 최소 가격" }) ?? 100000,
      priceTiers: tiers,
      curationWeights: weights,
      pgContractConfirmed,
      settlementStructureConfirmed,
      business: {
        companyName: str(fd, "b_companyName", 80) ?? "",
        representative: str(fd, "b_representative", 40) ?? "",
        businessNumber: str(fd, "b_businessNumber", 20) ?? "",
        mailOrderNumber: str(fd, "b_mailOrderNumber", 60) ?? "",
        address: str(fd, "b_address", 200) ?? "",
        email: str(fd, "b_email", 120) ?? "",
        phone: str(fd, "b_phone", 30) ?? "",
      },
    };
    await saveSettings(patch);
    await audit(user, "UPDATE", "Setting", null, diff(before as never, patch as never, Object.keys(patch)));
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "설정이 저장되었습니다." };
}

export async function computeLiveReadiness(confirm?: { pgContractConfirmed: boolean; settlementStructureConfirmed: boolean }) {
  const s = await getSettings();
  const now = new Date();
  const [verifiedSellerCount, verifiedProductCount, notices] = await Promise.all([
    prisma.brewery.count({ where: { isDemo: false, salesEnabled: true, compliance: { status: "APPROVED" } } }),
    prisma.product.count({ where: { isDemo: false, status: "PUBLISHED", eligibility: "VERIFIED", tradeModel: "COMMISSION", brewery: { salesEnabled: true } } }),
    Promise.all(REQUIRED_NOTICES.map((t) => prisma.legalNotice.count({ where: { type: t, effectiveFrom: { lte: now } } }))),
  ]);
  return liveReadiness({
    verifiedSellerCount,
    verifiedProductCount,
    ageProviderKeySet: !!process.env.AGE_VERIFICATION_SECRET,
    pgKeySet: !!process.env.PG_SECRET_KEY,
    pgContractConfirmed: confirm?.pgContractConfirmed ?? s.pgContractConfirmed,
    settlementStructureConfirmed: confirm?.settlementStructureConfirmed ?? s.settlementStructureConfirmed,
    requiredNoticesPublished: notices.every((n) => n > 0),
  });
}

export async function setDemoVisibility(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN"]);
  const show = fd.get("show") === "1";
  await saveSettings({ showDemoData: show });
  await audit(user, "UPDATE", "Setting", "showDemoData", { showDemoData: show });
  revalidatePath("/", "layout");
}

// ─── 계정 ─────────────────────────────────────────────

export async function createUser(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN"]);
  try {
    const role = oneOf(fd, "role", ["SUPER_ADMIN", "CURATOR", "FINANCE", "BREWERY_ADMIN"] as const, "CURATOR");
    const breweryId = str(fd, "breweryId");
    if (role === "BREWERY_ADMIN" && !breweryId) throw new FormError("양조장 관리자는 소속 양조장을 선택해야 합니다.");
    const password = reqStr(fd, "password", "비밀번호", 100);
    if (password.length < 10) throw new FormError("비밀번호는 10자 이상이어야 합니다.");
    const created = await prisma.user.create({
      data: {
        email: reqStr(fd, "email", "이메일", 120).toLowerCase(),
        name: reqStr(fd, "name", "이름", 60),
        role,
        breweryId: role === "BREWERY_ADMIN" ? breweryId : null,
        passwordHash: await hashPassword(password),
      },
    });
    await audit(user, "CREATE", "User", created.id, { email: created.email, role });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/users");
  return { ok: true, message: "계정이 생성되었습니다." };
}

export async function toggleUser(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN"]);
  const id = reqStr(fd, "id", "id");
  if (id === user.id) return;
  const u = await prisma.user.findUniqueOrThrow({ where: { id } });
  await prisma.user.update({ where: { id }, data: { active: !u.active } });
  await audit(user, u.active ? "DEACTIVATE" : "ACTIVATE", "User", id);
  revalidatePath("/admin/users");
}

export async function resetPassword(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff();
  try {
    const targetId = user.role === "SUPER_ADMIN" ? str(fd, "id") ?? user.id : user.id;
    const password = reqStr(fd, "password", "새 비밀번호", 100);
    if (password.length < 10) throw new FormError("비밀번호는 10자 이상이어야 합니다.");
    await prisma.user.update({ where: { id: targetId }, data: { passwordHash: await hashPassword(password) } });
    await audit(user, "RESET_PASSWORD", "User", targetId);
  } catch (e) {
    return fail(e);
  }
  return { ok: true, message: "비밀번호가 변경되었습니다." };
}

// ─── 매거진 ────────────────────────────────────────────

export async function saveArticle(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  let id = str(fd, "id");
  try {
    const title = reqStr(fd, "title", "제목", 160);
    const body = reqStr(fd, "body", "본문", 50000);
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED", "HIDDEN"] as const, "DRAFT");
    const checks = Object.fromEntries(AD_CHECKS.map((c) => [c.key, bool(fd, c.key)])) as Record<AdCheckKey, boolean>;
    if (status === "PUBLISHED") {
      const missing = missingAdChecks(checks);
      if (missing.length) throw new FormError(`게시 전 광고 기준 점검을 완료해 주세요: ${missing.join(" / ")}`);
    }
    const pub = str(fd, "publishedAt");
    const breweryId = str(fd, "breweryId");
    const data: Prisma.ArticleUncheckedUpdateInput = {
      title,
      slug: slugify(str(fd, "slug", 120) || title),
      subtitle: str(fd, "subtitle", 200),
      category: oneOf(fd, "category", ["STORY", "INTERVIEW", "GIFT_GUIDE", "PAIRING", "GUIDE", "TRAVEL"] as const, "STORY"),
      excerpt: str(fd, "excerpt", 400),
      body,
      coverImageAlt: str(fd, "coverImageAlt", 200),
      coverImageCredit: str(fd, "coverImageCredit", 200),
      coverTheme: str(fd, "coverTheme", 20),
      author: str(fd, "author", 60),
      readMinutes: estimateReadMinutes(body),
      breweryId: breweryId || null,
      status,
      publishedAt: pub ? new Date(`${pub}T00:00:00+09:00`) : status === "PUBLISHED" ? new Date() : null,
      metaTitle: str(fd, "metaTitle", 120),
      metaDescription: str(fd, "metaDescription", 300),
      ...checks,
    };
    const cover = await saveImage(fd.get("coverImage") as File | null);
    if (cover) data.coverImageUrl = cover;
    else if (bool(fd, "removeCover")) data.coverImageUrl = null;
    const productIds = fd.getAll("productIds").map(String).filter(Boolean).slice(0, 8);
    if (id) {
      await prisma.article.update({ where: { id }, data });
    } else {
      id = (await prisma.article.create({ data: data as Prisma.ArticleUncheckedCreateInput })).id;
    }
    await prisma.$transaction([
      prisma.articleProduct.deleteMany({ where: { articleId: id } }),
      prisma.articleProduct.createMany({ data: productIds.map((productId, position) => ({ articleId: id!, productId, position })) }),
    ]);
    await audit(user, "SAVE", "Article", id, { title, status });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "저장되었습니다.", redirectTo: `/admin/magazine/${id}?saved=1` };
}

export async function deleteArticle(fd: FormData) {
  const user = await requireStaff(["SUPER_ADMIN", "CURATOR"]);
  const id = reqStr(fd, "id", "id");
  await prisma.article.delete({ where: { id } });
  await audit(user, "DELETE", "Article", id);
  revalidatePath("/", "layout");
  redirect("/admin/magazine");
}
