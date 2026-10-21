import type { NoticeType } from "@prisma/client";
import { notFound } from "next/navigation";
import { getCurrentNotice } from "@/lib/legal";
import { dateKo } from "@/lib/format";

const MAP: Record<string, NoticeType> = {
  terms: "TERMS",
  privacy: "PRIVACY",
  shipping: "SHIPPING_POLICY",
  returns: "RETURN_POLICY",
};

export default async function LegalPage({ params }: { params: { type: string } }) {
  const t = MAP[params.type];
  if (!t) notFound();
  const n = await getCurrentNotice(t);
  if (!n) notFound();
  return (
    <div className="container-site max-w-3xl pt-12 md:pt-20">
      <h1 className="h-display">{n.title}</h1>
      <p className="mt-4 text-xs text-charcoal/50">
        버전 {n.version} · 시행일 {dateKo(n.effectiveFrom)}
      </p>
      <div className="mt-10 whitespace-pre-line border-t border-line pt-8 text-[15px] leading-loose text-charcoal/75">{n.body}</div>
    </div>
  );
}
