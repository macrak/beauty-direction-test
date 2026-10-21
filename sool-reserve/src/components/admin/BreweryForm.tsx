import type { Brewery, SellerCompliance } from "@prisma/client";
import ActionForm from "./ActionForm";
import { Check, F, Sel, Section, TA } from "./Field";
import type { ActionState } from "@/lib/form";
import { ONBOARDING_LABEL } from "@/lib/labels";
import { VISUAL_THEMES } from "@/components/BreweryVisual";

export default function BreweryForm({
  brewery,
  action,
  canEnableSales,
}: {
  brewery?: (Brewery & { compliance: SellerCompliance | null }) | null;
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  canEnableSales: boolean;
}) {
  const b = brewery;
  const c = b?.compliance;
  const gallery = (Array.isArray(b?.gallery) ? (b!.gallery as unknown as { url: string; caption?: string }[]) : []).filter((g) => g?.url);
  return (
    <ActionForm action={action} submitLabel={b ? "변경 사항 저장" : "양조장 등록"} stickyFooter className="space-y-4">
      {b && <input type="hidden" name="id" value={b.id} />}
      <Section title="입점 상태" desc="입점 신청 → 서류 확인 → 상품 검토 → 수익성 검토 → 계약 → 관리자 승인 → 상품 노출. '상품 노출' 상태여야 고객 화면에 표시됩니다.">
        <Sel label="입점 단계" name="onboardingStatus" options={Object.entries(ONBOARDING_LABEL)} defaultValue={b?.onboardingStatus ?? "APPLIED"} />
        <F label="기본 수수료율(%)" name="defaultCommissionRate" type="number" step="0.1" defaultValue={b?.defaultCommissionRate} hint="비우면 시스템 기본값" />
        <TA label="공급 조건 (내부 — 타 양조장·고객 비공개)" name="supplyTerms" defaultValue={b?.supplyTerms} span={2} rows={2} />
      </Section>

      <Section title="판매자 자격 서류" desc="판매 활성화는 서류 승인(APPROVED) 후 최고관리자만 가능합니다. 실제 서류 파일은 보안 저장소에 보관하고 여기에는 확인 결과만 기록하세요.">
        <F label="상호(사업자명)" name="businessName" defaultValue={c?.businessName} />
        <F label="대표자" name="representative" defaultValue={c?.representative} />
        <F label="사업자등록번호" name="businessNumber" defaultValue={c?.businessNumber} />
        <F label="통신판매업 신고번호" name="mailOrderNumber" defaultValue={c?.mailOrderNumber} />
        <F label="사업장 소재지" name="address" defaultValue={c?.address} span={2} />
        <F label="담당자 연락처" name="contactPhone" defaultValue={c?.contactPhone} />
        <F label="담당자 이메일" name="contactEmail" defaultValue={c?.contactEmail} />
        <TA label="주류 제조면허 확인 내용" name="liquorLicenseNote" defaultValue={c?.liquorLicenseNote} />
        <TA label="전통주(민속주/지역특산주) 근거 및 통신판매 승인 확인" name="traditionalBasisNote" defaultValue={c?.traditionalBasisNote} />
        <Sel
          label="서류 검토 결과"
          name="complianceStatus"
          options={[
            ["PENDING", "검토 대기"],
            ["APPROVED", "승인"],
            ["REJECTED", "반려"],
          ]}
          defaultValue={c?.status ?? "PENDING"}
        />
        <TA label="검토 메모" name="reviewNote" defaultValue={c?.reviewNote} rows={1} />
        <div className="md:col-span-1">
          <Check label="판매 활성 (판매자로 판매 허용)" name="salesEnabled" defaultChecked={b?.salesEnabled} />
          {!canEnableSales && <p className="mt-1 text-[11px] text-charcoal/45">최고관리자만 변경 가능</p>}
          {c?.reviewedAt && <p className="mt-1 text-[11px] text-charcoal/45">최종 검토: {c.reviewedBy} · {c.reviewedAt.toLocaleDateString("ko-KR")}</p>}
        </div>
      </Section>

      <Section title="기본 정보">
        <F label="양조장 이름" name="name" defaultValue={b?.name} required />
        <F label="영문명" name="nameEn" defaultValue={b?.nameEn} />
        <F label="URL(slug)" name="slug" defaultValue={b?.slug} hint="비우면 자동 생성" />
        <F label="지역" name="region" defaultValue={b?.region} required />
        <F label="설립연도" name="foundedYear" type="number" defaultValue={b?.foundedYear} />
        <F label="한 줄 소개" name="tagline" defaultValue={b?.tagline} span={2} />
        <F label="홈페이지" name="website" defaultValue={b?.website} />
        <label className="block md:col-span-2">
          <span className="adm-label">대표 이미지 (양조장·장인·제조 과정)</span>
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="adm-input" />
          {b?.imageUrl && <span className="mt-1 block text-[11px] text-charcoal/45">현재: {b.imageUrl}</span>}
        </label>
        <F label="대표 사진 출처/저작권" name="imageCredit" defaultValue={b?.imageCredit} />
        <Sel label="사진이 없을 때 일러스트 테마" name="visualTheme" options={Object.entries(VISUAL_THEMES)} defaultValue={b?.visualTheme} empty="자동" />
        <F label="영상 URL" name="videoUrl" defaultValue={b?.videoUrl} span={2} />
      </Section>

      <Section title="사진 (장인 · 제조 과정)" desc="실제 촬영본만 사용하세요. 제조 과정 사진이 없으면 6단계 공정 일러스트가 표시됩니다.">
        <label className="block md:col-span-2">
          <span className="adm-label">장인 사진 (세로형 권장)</span>
          <input type="file" name="artisanImage" accept="image/jpeg,image/png,image/webp" className="adm-input" />
          {b?.artisanImageUrl && (
            <span className="mt-1 flex items-center gap-3 text-[11px] text-charcoal/45">
              현재: {b.artisanImageUrl} <Check label="삭제" name="removeArtisanImage" />
            </span>
          )}
        </label>
        <div className="md:col-span-2" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const g = gallery[i];
          return (
            <div key={i} className="rounded border border-line p-3 md:col-span-2">
              <p className="adm-label">제조 과정 사진 #{i + 1}</p>
              {g?.url && (
                <div className="mb-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt="" className="h-14 w-20 rounded object-cover" />
                  <input type="hidden" name={`gallery_${i}_url`} value={g.url} />
                  <Check label="삭제" name={`gallery_${i}_remove`} />
                </div>
              )}
              <input type="file" name={`gallery_${i}_file`} accept="image/jpeg,image/png,image/webp" className="adm-input" />
              <input name={`gallery_${i}_caption`} defaultValue={g?.caption ?? ""} placeholder="캡션 (예: 고두밥을 식히는 새벽)" className="adm-input mt-2" />
            </div>
          );
        })}
      </Section>

      <Section title="스토리 (고객 화면 노출)">
        <TA label="양조장의 역사" name="history" defaultValue={b?.history} span={4} />
        <TA label="장인 또는 제조자 이야기" name="artisan" defaultValue={b?.artisan} span={4} />
        <F label="명인·장인 칭호 (검증된 경우만)" name="artisanTitle" defaultValue={b?.artisanTitle} span={2} />
        <F label="원료 생산 지역" name="ingredientOrigin" defaultValue={b?.ingredientOrigin} span={2} />
        <F label="물과 누룩의 특징" name="waterAndNuruk" defaultValue={b?.waterAndNuruk} span={2} />
        <F label="전통 제조 방법" name="method" defaultValue={b?.method} span={2} />
        <F label="숙성 과정" name="aging" defaultValue={b?.aging} span={2} />
        <F label="제조 철학" name="philosophy" defaultValue={b?.philosophy} span={2} />
        <TA label="수상 내역" name="awards" defaultValue={b?.awards} span={3} rows={2} />
        <div className="flex items-end">
          <Check label="수상 내역 검증됨 (검증 시에만 노출)" name="awardsVerified" defaultChecked={b?.awardsVerified} />
        </div>
      </Section>
    </ActionForm>
  );
}
