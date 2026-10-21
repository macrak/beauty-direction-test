import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_UPLOAD = 5 * 1024 * 1024;

export function uploadDir() {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

// 업로드 이미지 저장 → /api/uploads/<파일명> 으로 제공. 형식·용량 검증 실패 시 예외
export async function saveImage(file: File | null): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.");
  if (file.size > MAX_UPLOAD) throw new Error("이미지는 5MB 이하만 업로드할 수 있습니다.");
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}

export async function saveImages(files: FormDataEntryValue[]): Promise<string[]> {
  const out: string[] = [];
  for (const f of files) {
    const url = await saveImage(f as File);
    if (url) out.push(url);
  }
  return out;
}

export const MAX_GALLERY = 8;
