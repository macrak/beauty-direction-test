import type { Article } from "@prisma/client";
import ActionForm from "./ActionForm";
import { Check, F, Sel, Section, TA } from "./Field";
import type { ActionState } from "@/lib/form";
import { AD_CHECKS, ARTICLE_CATEGORY } from "@/lib/magazine";
import { VISUAL_THEMES } from "@/components/BreweryVisual";

export default function ArticleForm({
  article,
  productIds = [],
  products,
  breweries,
  action,
}: {
  article?: Article | null;
  productIds?: string[];
  products: { id: string; name: string; brewery: { name: string } }[];
  breweries: { id: string; name: string }[];
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const a = article;
  return (
    <ActionForm action={action} submitLabel={a ? "변경 사항 저장" : "글 저장"} stickyFooter className="space-y-4">
      {a && <input type="hidden" name="id" value={a.id} />}
      <Section title="기본">
        <Sel label="카테고리" name="category" options={Object.entries(ARTICLE_CATEGORY).map(([k, v]) => [k, v.label])} defaultValue={a?.category ?? "STORY"} />
        <Sel
          label="상태"
          name="status"
          options={[
            ["DRAFT", "작성 중"],
            ["PUBLISHED", "게시"],
            ["HIDDEN", "숨김"],
          ]}
          defaultValue={a?.status ?? "DRAFT"}
        />
        <F label="게시일 (예약 가능)" name="publishedAt" type="date" defaultValue={a?.publishedAt ? a.publishedAt.toISOString().slice(0, 10) : ""} />
        <F label="글쓴이" name="author" defaultValue={a?.author} placeholder="SOOL RESERVE 편집부" />
        <F label="제목" name="title" defaultValue={a?.title} required span={2} />
        <F label="부제 (영문/짧은 문장)" name="subtitle" defaultValue={a?.subtitle} span={2} />
        <F label="URL(slug)" name="slug" defaultValue={a?.slug} hint="비우면 제목으로 자동 생성" span={2} />
        <Sel label="관련 양조장" name="breweryId" options={breweries.map((b) => [b.id, b.name])} defaultValue={a?.breweryId} empty="없음" span={2} />
        <TA label="요약 (목록·검색 결과 노출)" name="excerpt" defaultValue={a?.excerpt} span={4} rows={2} />
        <TA
          label="본문"
          name="body"
          defaultValue={a?.body}
          span={4}
          rows={18}
          hint="빈 줄로 문단 구분 · '## ' 소제목 · '> ' 인용 · '- ' 목록. HTML은 사용할 수 없습니다."
        />
      </Section>

      <Section title="커버 이미지">
        <label className="block md:col-span-2">
          <span className="adm-label">커버 사진 (가로형 권장)</span>
          <input type="file" name="coverImage" accept="image/jpeg,image/png,image/webp" className="adm-input" />
          {a?.coverImageUrl && (
            <span className="mt-1 flex items-center gap-3 text-[11px] text-charcoal/45">
              현재: {a.coverImageUrl} <Check label="삭제" name="removeCover" />
            </span>
          )}
        </label>
        <F label="대체 텍스트" name="coverImageAlt" defaultValue={a?.coverImageAlt} />
        <F label="사진 출처" name="coverImageCredit" defaultValue={a?.coverImageCredit} />
        <Sel label="사진이 없을 때 일러스트" name="coverTheme" options={Object.entries(VISUAL_THEMES)} defaultValue={a?.coverTheme} empty="카테고리 기본" />
      </Section>

      <section className="adm-card">
        <h2 className="text-sm font-semibold">이야기 속의 술 (최대 8개)</h2>
        <div className="mt-3 grid max-h-64 gap-1.5 overflow-y-auto text-sm md:grid-cols-3">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input type="checkbox" name="productIds" value={p.id} defaultChecked={productIds.includes(p.id)} className="accent-burgundy" />
              {p.name} <span className="text-xs text-charcoal/45">{p.brewery.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="adm-card border-burgundy/30">
        <h2 className="text-sm font-semibold">주류 광고 기준 점검 (게시 필수)</h2>
        <p className="mt-0.5 text-xs text-charcoal/50">국민건강증진법 등 주류 광고 관련 기준에 따른 자체 점검입니다. 모든 항목을 확인해야 '게시' 상태로 저장할 수 있습니다.</p>
        <div className="mt-3 space-y-2">
          {AD_CHECKS.map((c) => (
            <Check key={c.key} label={c.label} name={c.key} defaultChecked={a?.[c.key]} />
          ))}
        </div>
      </section>

      <Section title="SEO">
        <F label="메타 타이틀" name="metaTitle" defaultValue={a?.metaTitle} span={2} />
        <F label="메타 설명" name="metaDescription" defaultValue={a?.metaDescription} span={2} />
      </Section>
    </ActionForm>
  );
}
