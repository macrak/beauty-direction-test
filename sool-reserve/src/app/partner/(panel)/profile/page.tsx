import { PageTitle } from "@/components/admin/AdminShell";
import ActionForm from "@/components/admin/ActionForm";
import { F, Section, TA } from "@/components/admin/Field";
import { requirePartner } from "@/lib/auth";
import { savePartnerProfile } from "@/lib/partner-actions";
import { prisma } from "@/lib/db";

export default async function PartnerProfile() {
  const user = await requirePartner();
  const b = await prisma.brewery.findUniqueOrThrow({ where: { id: user.breweryId } });
  return (
    <>
      <PageTitle title="양조장 정보" desc="고객 화면의 양조장 스토리에 표시됩니다. 수상 내역·명인 칭호는 SOOL RESERVE 검증 후 반영됩니다." />
      <ActionForm action={savePartnerProfile} stickyFooter>
        <Section title="스토리">
          <F label="한 줄 소개" name="tagline" defaultValue={b.tagline} span={2} />
          <F label="홈페이지" name="website" defaultValue={b.website} />
          <F label="영상 URL" name="videoUrl" defaultValue={b.videoUrl} />
          <TA label="양조장의 역사" name="history" defaultValue={b.history} span={4} />
          <TA label="장인 이야기" name="artisan" defaultValue={b.artisan} span={4} />
          <F label="원료 생산 지역" name="ingredientOrigin" defaultValue={b.ingredientOrigin} span={2} />
          <F label="물과 누룩" name="waterAndNuruk" defaultValue={b.waterAndNuruk} span={2} />
          <F label="제조 방법" name="method" defaultValue={b.method} span={2} />
          <F label="숙성" name="aging" defaultValue={b.aging} span={2} />
          <F label="제조 철학" name="philosophy" defaultValue={b.philosophy} span={4} />
          <label className="block md:col-span-2">
            <span className="adm-label">대표 이미지</span>
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="adm-input" />
          </label>
        </Section>
      </ActionForm>
    </>
  );
}
