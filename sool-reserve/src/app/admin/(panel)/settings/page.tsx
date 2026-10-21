import { PageTitle, Pill } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { Check, F, Sel, Section } from "@/components/admin/Field";
import { computeLiveReadiness, saveSystemSettings } from "@/lib/admin-actions";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SCORE_FIELDS } from "@/lib/labels";

export default async function SettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const [s, readiness] = await Promise.all([getSettings(), computeLiveReadiness()]);
  return (
    <>
      <PageTitle title="시스템 설정" desc="브랜드·노출 기준·가격 필터·수수료·운영 모드를 코드 수정 없이 변경합니다." />
      <ActionForm action={saveSystemSettings} stickyFooter className="space-y-4">
        <Section title="운영 모드" desc="SHOWCASE: 구매 기능 UI·API 모두 차단 / PRIVATE_TEST: 관리자 로그인 시에만 장바구니·Mock 결제 / LIVE: 아래 조건 전부 충족 시에만 전환 가능">
          <Sel
            label="운영 모드"
            name="salesMode"
            defaultValue={s.salesMode}
            options={[
              ["SHOWCASE", "SHOWCASE · 소개 전용"],
              ["PRIVATE_TEST", "PRIVATE_TEST · 비공개 테스트"],
              ["LIVE", `LIVE · 판매${readiness.ready ? "" : " (조건 미충족)"}`],
            ]}
          />
          <div className="md:col-span-3">
            <p className="adm-label">LIVE 전환 조건</p>
            <ul className="grid gap-1 text-sm md:grid-cols-2">
              {readiness.items.map((i) => (
                <li key={i.label} className="flex items-center gap-2">
                  <Pill tone={i.ok ? "good" : "bad"}>{i.ok ? "충족" : "미충족"}</Pill>
                  <span className="text-xs">{i.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-5">
              <Check label="PG사 주류 가맹 심사 완료 확인" name="pgContractConfirmed" defaultChecked={s.pgContractConfirmed} />
              <Check label="판매자별 정산 구조 확인" name="settlementStructureConfirmed" defaultChecked={s.settlementStructureConfirmed} />
            </div>
          </div>
          <div className="flex flex-wrap gap-5 md:col-span-4">
            <Check label="판매 승인 전 '참고 소비자가' 표시" name="showReferencePrice" defaultChecked={s.showReferencePrice} />
            <Check label="데모 데이터 고객 화면 노출" name="showDemoData" defaultChecked={s.showDemoData} />
          </div>
        </Section>

        <Section title="브랜드">
          <F label="브랜드명" name="brandName" defaultValue={s.brandName} required />
          <F label="한글 브랜드명" name="brandNameKo" defaultValue={s.brandNameKo} required />
          <F label="메인 슬로건" name="slogan" defaultValue={s.slogan} required span={2} />
          <F label="서브 카피" name="subCopy" defaultValue={s.subCopy} required span={4} />
        </Section>

        <Section title="상품 노출 기준 · 가격 · 수수료">
          <F label="입점 기준 최소 판매가(원)" name="minListingPrice" type="number" defaultValue={s.minListingPrice} hint="상품 선별 기본 조건" />
          <F label="가격 컬렉션 구간(원, 쉼표 구분)" name="priceTiers" defaultValue={s.priceTiers.join(", ")} span={2} hint="메인 PRICE COLLECTION·가격 필터에 사용" />
          <F label="시스템 기본 수수료율(%)" name="defaultCommissionRate" type="number" step="0.1" defaultValue={s.defaultCommissionRate} />
        </Section>

        <Section title="상품 평가 가중치" desc="종합 선별 점수 = Σ(점수×가중치) ÷ Σ가중치 (미평가 항목 제외). 0이면 해당 기준 미반영.">
          {SCORE_FIELDS.map((f) => (
            <F key={f.key} label={f.label} name={`w_${f.key}`} type="number" step="0.1" min={0} max={10} defaultValue={s.curationWeights[f.key]} />
          ))}
        </Section>

        <Section title="운영사 사업자 정보 (푸터 표시)">
          <F label="상호" name="b_companyName" defaultValue={s.business.companyName} />
          <F label="대표자" name="b_representative" defaultValue={s.business.representative} />
          <F label="사업자등록번호" name="b_businessNumber" defaultValue={s.business.businessNumber} />
          <F label="통신판매업 신고번호" name="b_mailOrderNumber" defaultValue={s.business.mailOrderNumber} />
          <F label="주소" name="b_address" defaultValue={s.business.address} span={2} />
          <F label="이메일" name="b_email" defaultValue={s.business.email} />
          <F label="전화" name="b_phone" defaultValue={s.business.phone} />
        </Section>
      </ActionForm>
    </>
  );
}
