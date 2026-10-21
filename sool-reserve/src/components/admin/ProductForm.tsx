import type { Brewery, Product, Supplier } from "@prisma/client";
import ActionForm from "./ActionForm";
import LiveEconomics from "./LiveEconomics";
import { Check, Checks, F, Sel, Section, TA } from "./Field";
import type { ActionState } from "@/lib/form";
import type { ProductScopes } from "@/lib/productForm";
import {
  ELIGIBILITY_LABEL,
  GIFT_PURPOSES,
  LEGAL_CLASS_LABEL,
  LIQUOR_TYPE_LABEL,
  OCCASIONS,
  PAIRING_CATEGORIES,
  PRODUCT_STATUS_LABEL,
  SCORE_FIELDS,
  SHIP_DAYS,
  TASTE_AXES,
  TASTE_SOURCE_LABEL,
} from "@/lib/labels";

interface Pairing {
  category: string;
  name: string;
  description?: string;
  recipe?: string;
}

const entries = <T extends Record<string, string>>(o: T) => Object.entries(o) as [string, string][];

export default function ProductForm({
  product,
  breweries,
  scopes,
  action,
  systemRate,
  suppliers = [],
}: {
  suppliers?: Pick<Supplier, "id" | "name" | "licenseVerified">[];
  product?: Product | null;
  breweries?: Pick<Brewery, "id" | "name" | "defaultCommissionRate">[];
  scopes: ProductScopes;
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  systemRate?: number;
}) {
  const p = product;
  const pairings = (Array.isArray(p?.pairings) ? (p!.pairings as unknown as Pairing[]) : []) as Pairing[];
  const d = (v: Date | null | undefined) => (v ? new Date(v).toISOString().slice(0, 10) : "");
  return (
    <ActionForm action={action} submitLabel={p ? "변경 사항 저장" : "상품 등록"} stickyFooter className="space-y-4">
      {p && <input type="hidden" name="id" value={p.id} />}
      {scopes.content && (
        <>
          <Section title="A. 기본 정보">
            {breweries && (
              <Sel label="입점 양조장(판매자)" name="breweryId" options={breweries.map((b) => [b.id, b.name])} defaultValue={p?.breweryId} span={2} />
            )}
            <Sel label="주종" name="liquorType" options={entries(LIQUOR_TYPE_LABEL)} defaultValue={p?.liquorType ?? "YAKJU"} />
            <F label="제조 지역" name="region" defaultValue={p?.region} />
            <F label="상품명" name="name" defaultValue={p?.name} required span={2} />
            <F label="영문 상품명" name="nameEn" defaultValue={p?.nameEn} span={2} />
            <F label="URL(slug)" name="slug" defaultValue={p?.slug} hint="비우면 영문명/상품명으로 자동 생성. 예: cheongun-45" span={2} />
            <F label="카드 한 줄 특징" name="summary" defaultValue={p?.summary} span={2} />
            <TA label="상품 설명" name="description" defaultValue={p?.description} span={4} rows={4} />
            <F label="알코올 도수(%)" name="abv" type="number" step="0.1" defaultValue={p?.abv} required />
            <F label="용량(ml)" name="volumeMl" type="number" defaultValue={p?.volumeMl} required />
            <F label="판매가(원, VAT 포함)" name="price" type="number" step="1000" defaultValue={p?.price} required />
            <F label="재고(병)" name="stock" type="number" defaultValue={p?.stock ?? 0} />
            <TA label="원재료 및 함량" name="ingredients" defaultValue={p?.ingredients} span={2} rows={2} />
            <TA label="주요 원산지" name="origin" defaultValue={p?.origin} span={2} rows={2} />
            <F label="제조 방식" name="productionMethod" defaultValue={p?.productionMethod} span={2} />
            <F label="숙성 방식" name="agingMethod" defaultValue={p?.agingMethod} />
            <F label="숙성 기간" name="agingPeriod" defaultValue={p?.agingPeriod} />
            <F label="유통기한 / 품질유지기한" name="shelfLife" defaultValue={p?.shelfLife} span={2} />
            <F label="권장 보관 조건" name="storageGuide" defaultValue={p?.storageGuide} span={2} />
            <label className="block md:col-span-2">
              <span className="adm-label">상품 이미지 (JPG/PNG/WEBP, 5MB 이하)</span>
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="adm-input" />
              <span className="mt-1 block text-[11px] text-charcoal/45">
                {p?.imageUrl ? `현재: ${p.imageUrl}` : "이미지가 없으면 주종별 병 일러스트가 표시됩니다. 실존 타사 상품 사진 사용 금지."}
              </span>
            </label>
            <F label="이미지 대체 텍스트" name="imageAlt" defaultValue={p?.imageAlt} />
            <F label="이미지 출처/저작권" name="imageCredit" defaultValue={p?.imageCredit} />
            {p?.imageUrl && <Check label="현재 이미지 삭제" name="removeImage" />}
            <label className="block md:col-span-4">
              <span className="adm-label">추가 사진 (병 디테일·패키지·선물 구성 등, 여러 장 선택 가능 · 최대 8장)</span>
              <input type="file" name="galleryImages" multiple accept="image/jpeg,image/png,image/webp" className="adm-input" />
            </label>
            {p && p.gallery.length > 0 && (
              <div className="flex flex-wrap gap-3 md:col-span-4">
                {p.gallery.map((u) => (
                  <label key={u} className="w-24 text-center text-[11px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="aspect-square w-24 rounded border border-line object-cover" />
                    <span className="mt-1 inline-flex items-center gap-1">
                      <input type="checkbox" name="removeGallery" value={u} className="accent-burgundy" /> 삭제
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Section>

          <Section title="B. 맛 프로필" desc="1~5점. 확인되지 않은 항목은 비워 두세요(해당 없음/미평가). 임의 점수 입력 금지.">
            {TASTE_AXES.map((a) => (
              <F key={a.key} label={a.label} name={a.key} type="number" min={1} max={5} defaultValue={p?.[a.key]} />
            ))}
            <Sel label="정보 출처" name="tasteSource" options={entries(TASTE_SOURCE_LABEL)} defaultValue={p?.tasteSource ?? "NONE"} />
            <F label="평가자" name="tasteEvaluator" defaultValue={p?.tasteEvaluator} />
            <F label="평가일" name="tasteEvaluatedAt" type="date" defaultValue={d(p?.tasteEvaluatedAt)} />
            <TA label="테이스팅 노트" name="tasteNotes" defaultValue={p?.tasteNotes} />
          </Section>

          <Section title="D. 음용 가이드">
            <F label="권장 음용 온도 (확인값)" name="servingTemp" defaultValue={p?.servingTemp} />
            <F label="적합한 술잔" name="glassware" defaultValue={p?.glassware} />
            <Sel
              label="냉장 후 음용"
              name="chillBeforeServing"
              options={[
                ["true", "권장"],
                ["false", "상온 권장"],
              ]}
              empty="미확인"
              defaultValue={p?.chillBeforeServing === null || p?.chillBeforeServing === undefined ? "" : String(p.chillBeforeServing)}
            />
            <F label="개봉 후 보관" name="afterOpening" defaultValue={p?.afterOpening} />
            <TA label="향과 특징" name="aromaNotes" defaultValue={p?.aromaNotes} span={4} />
          </Section>

          <Section title="E. 음식 페어링" desc="최대 6개. 카테고리와 음식명을 입력한 행만 저장됩니다.">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid gap-2 md:col-span-4 md:grid-cols-12">
                <div className="md:col-span-2">
                  <Sel label={`#${i + 1} 카테고리`} name={`pairing_${i}_category`} options={[...PAIRING_CATEGORIES]} empty="-" defaultValue={pairings[i]?.category} />
                </div>
                <div className="md:col-span-3">
                  <F label="음식명" name={`pairing_${i}_name`} defaultValue={pairings[i]?.name} />
                </div>
                <div className="md:col-span-4">
                  <F label="조합 설명" name={`pairing_${i}_description`} defaultValue={pairings[i]?.description} />
                </div>
                <div className="md:col-span-3">
                  <F label="간단 레시피(선택)" name={`pairing_${i}_recipe`} defaultValue={pairings[i]?.recipe} />
                </div>
              </div>
            ))}
          </Section>

          <Section title="F. 선물 정보">
            <F label="선물 추천 대상" name="giftRecommendFor" defaultValue={p?.giftRecommendFor} span={2} />
            <F label="선물 상자 구성" name="giftBoxContents" defaultValue={p?.giftBoxContents} span={2} />
            <F label="포장 옵션" name="giftWrapOptions" defaultValue={p?.giftWrapOptions} span={2} />
            <div className="flex items-end gap-5 md:col-span-2">
              <Check label="쇼핑백 제공" name="shoppingBag" defaultChecked={p?.shoppingBag} />
              <Check label="메시지 카드 지원" name="messageCard" defaultChecked={p?.messageCard} />
            </div>
          </Section>

          <Section title="배송 · 보관">
            <Sel
              label="배송 유형"
              name="storageType"
              options={[
                ["AMBIENT", "일반(상온) 배송"],
                ["REFRIGERATED", "냉장 배송"],
              ]}
              defaultValue={p?.storageType ?? "AMBIENT"}
            />
            <F label="권장 보관 온도" name="storageTemp" defaultValue={p?.storageTemp} />
            <F label="보냉 포장" name="coldPackaging" defaultValue={p?.coldPackaging} />
            <F label="배송비(고객 부담, 원)" name="shippingFee" type="number" defaultValue={p?.shippingFee ?? 0} />
            <Checks label="출고 가능 요일" name="shipDays" options={SHIP_DAYS} values={p?.shipDays ?? []} />
            <div className="flex flex-wrap gap-5 md:col-span-4">
              <Check label="냉장 배송 필수" name="coldChainRequired" defaultChecked={p?.coldChainRequired} />
              <Check label="주말·공휴일 전 출고 제한" name="noShipBeforeHoliday" defaultChecked={p?.noShipBeforeHoliday} />
            </div>
            <F label="배송 가능 지역" name="shipRegions" defaultValue={p?.shipRegions} />
            <F label="택배사" name="carrier" defaultValue={p?.carrier} />
            <F label="파손 방지 포장" name="protectivePackaging" defaultValue={p?.protectivePackaging} span={2} />
            <TA label="파손 접수·처리 기준" name="damagePolicy" defaultValue={p?.damagePolicy} span={4} rows={2} />
          </Section>

          <Section title="SEO">
            <F label="메타 타이틀" name="metaTitle" defaultValue={p?.metaTitle} span={2} />
            <F label="메타 설명" name="metaDescription" defaultValue={p?.metaDescription} span={2} />
          </Section>
        </>
      )}

      {scopes.curation && (
        <>
          <Section title="노출 · 판매 적격" desc="통신판매 적격은 근거 서류 확인 후 VERIFIED로 변경하세요. 부적격 상품은 '소개 전용'으로 구매가 영구 차단됩니다.">
            <Sel label="노출 상태" name="status" options={entries(PRODUCT_STATUS_LABEL)} defaultValue={p?.status ?? "DRAFT"} />
            <Sel label="법적 분류" name="legalClass" options={entries(LEGAL_CLASS_LABEL)} defaultValue={p?.legalClass ?? "UNKNOWN"} />
            <Sel label="통신판매 적격" name="eligibility" options={entries(ELIGIBILITY_LABEL)} defaultValue={p?.eligibility ?? "UNCHECKED"} />
            <F label="정렬 순서" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} />
            <TA label="적격 판단 근거 메모" name="eligibilityNote" defaultValue={p?.eligibilityNote} span={4} rows={2} />
            <div className="flex flex-wrap gap-5 md:col-span-4">
              <Check label="명인주" name="isMaster" defaultChecked={p?.isMaster} />
              <Check label="명인·장인 여부 검증됨" name="masterVerified" defaultChecked={p?.masterVerified} />
              <Check label="한정판" name="isLimited" defaultChecked={p?.isLimited} />
              <Check label="한정 생산 검증됨" name="limitedVerified" defaultChecked={p?.limitedVerified} />
              <Check label="선물 배송 가능 (법적 조건 확인 후)" name="giftDelivery" defaultChecked={p?.giftDelivery} />
            </div>
            <F label="한정 생산 수량 (검증된 경우만)" name="productionCount" type="number" defaultValue={p?.productionCount} />
            <Checks label="맛 태그 (필터용)" name="flavorTags" options={["부드러운"]} values={p?.flavorTags ?? []} />
            <Checks label="상황별" name="occasions" options={OCCASIONS} values={p?.occasions ?? []} />
            <Checks label="선물 목적별" name="giftPurposes" options={GIFT_PURPOSES.map((g) => g.key)} values={p?.giftPurposes ?? []} />
          </Section>

          <Section title="상품 선별 평가 (1~5점)" desc="검증 자료 또는 관리자 판단으로만 입력. 비워 두면 '미평가'이며 0점으로 취급되지 않습니다.">
            {SCORE_FIELDS.map((f) => (
              <F key={f.key} label={f.label} name={f.key} type="number" min={1} max={5} defaultValue={p?.[f.key]} />
            ))}
            <TA label="평가 근거" name="scoreNote" defaultValue={p?.scoreNote} span={2} rows={2} />
          </Section>
        </>
      )}

      {scopes.economics && (
        <Section title="수익 구조 (내부 전용 — 고객 미노출)" desc="중개형: 양조장이 판매자, 플랫폼 수익 = 기준금액 × 수수료율. 매입형: 운영사가 도매상에서 매입해 직접 판매, 수익 = 판매가 − 매입가(VAT 제외 기준) − 비용.">
          <Sel
            label="거래 모델"
            name="tradeModel"
            options={[
              ["COMMISSION", "중개 (양조장 판매 · 수수료)"],
              ["WHOLESALE", "매입 (도매상에서 매입 · 직접 판매)"],
            ]}
            defaultValue={p?.tradeModel ?? "COMMISSION"}
          />
          <Sel
            label="공급처 (매입형)"
            name="supplierId"
            options={suppliers.map((x) => [x.id, `${x.name}${x.licenseVerified ? "" : " (면허 미확인)"}`])}
            empty="선택 안 함"
            defaultValue={p?.supplierId}
          />
          <Sel
            label="수수료 기준금액"
            name="vatBasis"
            options={[
              ["INCLUSIVE", "판매가(VAT 포함)"],
              ["EXCLUSIVE", "VAT 제외 금액"],
            ]}
            defaultValue={p?.vatBasis ?? "INCLUSIVE"}
          />
          <F label="수수료율(%) · 중개형" name="commissionRate" type="number" step="0.1" defaultValue={p?.commissionRate} hint={`비우면 양조장 기본값 → 시스템 기본값(${systemRate}%)`} />
          <F label="결제 수수료율(%)" name="pgRate" type="number" step="0.1" defaultValue={p?.pgRate ?? 3.3} />
          <Sel
            label="결제비 부담"
            name="pgBearer"
            options={[
              ["PLATFORM", "플랫폼"],
              ["SELLER", "판매자"],
            ]}
            defaultValue={p?.pgBearer ?? "PLATFORM"}
          />
          <F label="플랫폼 부담 포장·배송비(원)" name="platformShippingCost" type="number" defaultValue={p?.platformShippingCost ?? 0} />
          <F label="플랫폼 부담 할인·프로모션(원)" name="platformPromoCost" type="number" defaultValue={p?.platformPromoCost ?? 0} />
          <F label="기타 변동비(원)" name="otherVariableCost" type="number" defaultValue={p?.otherVariableCost ?? 0} />
          <F label="매입가(VAT 포함) · 매입형" name="wholesaleCost" type="number" step="100" defaultValue={p?.wholesaleCost} hint="입고 처리 시 발주 단가로 자동 갱신" />
          <F label="예상 월 판매량(병)" name="expectedMonthlyUnits" type="number" defaultValue={p?.expectedMonthlyUnits ?? 0} hint="대시보드 추정치에 사용" />
          {systemRate !== undefined && (
            <LiveEconomics
              systemRate={systemRate}
              breweryRates={Object.fromEntries((breweries ?? []).map((b) => [b.id, b.defaultCommissionRate]))}
              initial={{
                breweryId: p?.breweryId ?? breweries?.[0]?.id ?? "",
                price: String(p?.price ?? ""),
                vatBasis: p?.vatBasis ?? "INCLUSIVE",
                commissionRate: p?.commissionRate === null || p?.commissionRate === undefined ? "" : String(p.commissionRate),
                pgRate: String(p?.pgRate ?? 3.3),
                pgBearer: p?.pgBearer ?? "PLATFORM",
                platformShippingCost: String(p?.platformShippingCost ?? 0),
                platformPromoCost: String(p?.platformPromoCost ?? 0),
                otherVariableCost: String(p?.otherVariableCost ?? 0),
                expectedMonthlyUnits: String(p?.expectedMonthlyUnits ?? 0),
                tradeModel: p?.tradeModel ?? "COMMISSION",
                wholesaleCost: p?.wholesaleCost == null ? "" : String(p.wholesaleCost),
              }}
            />
          )}
        </Section>
      )}
      {!scopes.content && p && (
        <>
          {/* 경제성만 수정하는 권한일 때 계산에 필요한 판매가를 숨김 필드로 전달 */}
          <input type="hidden" name="price" value={p.price} />
          <input type="hidden" name="breweryId" value={p.breweryId} />
        </>
      )}
    </ActionForm>
  );
}
