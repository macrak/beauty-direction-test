"use server";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { requirePartner } from "./auth";
import { audit, diff } from "./audit";
import { FormError, int, reqStr, str, type ActionState } from "./form";
import { AUDITED_PRODUCT_FIELDS, parseProductForm } from "./productForm";
import { MAX_GALLERY, saveImage, saveImages } from "./uploads";

// 양조장 관리자는 자기 brewery_id 데이터만 접근 — 모든 쿼리에 breweryId 조건을 서버에서 강제
function fail(e: unknown): ActionState {
  const err = e as { digest?: string; code?: string };
  if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e;
  if (e instanceof FormError) return { ok: false, message: e.message };
  if (err?.code === "P2002") return { ok: false, message: "이미 사용 중인 URL(slug)입니다." };
  if (e instanceof Error && /이미지/.test(e.message)) return { ok: false, message: e.message };
  console.error(e);
  return { ok: false, message: "저장 중 오류가 발생했습니다." };
}


// 상품 갤러리: 기존 사진 중 삭제 체크된 것 제외 + 새 업로드 추가 (최대 MAX_GALLERY장)
async function mergeGallery(fd: FormData, current: string[]): Promise<string[]> {
  const remove = new Set(fd.getAll("removeGallery").map(String));
  const added = await saveImages(fd.getAll("galleryImages"));
  const next = [...current.filter((u) => !remove.has(u)), ...added];
  if (next.length > MAX_GALLERY) throw new FormError(`추가 사진은 최대 ${MAX_GALLERY}장까지 등록할 수 있습니다.`);
  return next;
}

export async function savePartnerProduct(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePartner();
  let id = str(fd, "id");
  try {
    const data = parseProductForm(fd, { content: true, curation: false, economics: false });
    const image = await saveImage(fd.get("image") as File | null);
    if (image) data.imageUrl = image;
    if (id) {
      const before = await prisma.product.findFirst({ where: { id, breweryId: user.breweryId } });
      if (!before) throw new FormError("수정 권한이 없는 상품입니다.");
      data.gallery = await mergeGallery(fd, before.gallery);
      const after = await prisma.product.update({ where: { id: before.id }, data });
      await audit(user, "PARTNER_UPDATE", "Product", id, diff(before, after, AUDITED_PRODUCT_FIELDS));
    } else {
      data.gallery = await mergeGallery(fd, []);
      // 신규 등록은 항상 '검토 대기' + 적격 '미확인' — 플랫폼 검토 후 공개
      const created = await prisma.product.create({
        data: { ...(data as Prisma.ProductUncheckedCreateInput), breweryId: user.breweryId, status: "REVIEW", eligibility: "UNCHECKED" },
      });
      id = created.id;
      await audit(user, "PARTNER_CREATE", "Product", id, { name: created.name });
    }
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "저장되었습니다.", redirectTo: `/partner/products/${id}?saved=1` };
}

export async function updatePartnerStock(fd: FormData) {
  const user = await requirePartner();
  const id = reqStr(fd, "id", "id");
  const stock = int(fd, "stock", { min: 0, max: 1_000_000, label: "재고" }) ?? 0;
  const res = await prisma.product.updateMany({ where: { id, breweryId: user.breweryId }, data: { stock } });
  if (res.count === 1) await audit(user, "PARTNER_STOCK", "Product", id, { stock });
  revalidatePath("/partner");
}

export async function savePartnerProfile(_s: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePartner();
  try {
    const image = await saveImage(fd.get("image") as File | null);
    await prisma.brewery.update({
      where: { id: user.breweryId },
      data: {
        tagline: str(fd, "tagline", 120),
        history: str(fd, "history"),
        artisan: str(fd, "artisan"),
        ingredientOrigin: str(fd, "ingredientOrigin", 300),
        waterAndNuruk: str(fd, "waterAndNuruk", 300),
        method: str(fd, "method", 300),
        aging: str(fd, "aging", 300),
        philosophy: str(fd, "philosophy", 500),
        website: str(fd, "website", 300),
        videoUrl: str(fd, "videoUrl", 300),
        ...(image ? { imageUrl: image } : {}),
      },
    });
    await audit(user, "PARTNER_PROFILE", "Brewery", user.breweryId);
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "양조장 정보가 저장되었습니다." };
}
