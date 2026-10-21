import { readFile } from "fs/promises";
import path from "path";
import { uploadDir } from "@/lib/uploads";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const name = path.basename(params.file);
  const ext = name.split(".").pop() ?? "";
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(uploadDir(), name));
    return new Response(buf, { headers: { "content-type": TYPES[ext], "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
