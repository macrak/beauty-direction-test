import type { Supplier } from "@prisma/client";
import ActionForm from "./ActionForm";
import { Check, F, Section, TA } from "./Field";
import { saveSupplier } from "@/lib/commerce-actions";

export default function SupplierForm({ s }: { s?: Supplier | null }) {
  return (
    <ActionForm action={saveSupplier} submitLabel={s ? "변경 사항 저장" : "공급처 등록"} stickyFooter className="space-y-4">
      {s && <input type="hidden" name="id" value={s.id} />}
      <Section title="기본 정보">
        <F label="공급처명" name="name" defaultValue={s?.name} required span={2} />
        <F label="사업자등록번호" name="businessNumber" defaultValue={s?.businessNumber} />
        <div className="flex items-end">
          <Check label="거래 중" name="active" defaultChecked={s?.active ?? true} />
        </div>
        <F label="담당자" name="contactName" defaultValue={s?.contactName} />
        <F label="연락처" name="phone" defaultValue={s?.phone} />
        <F label="이메일" name="email" defaultValue={s?.email} />
        <F label="입고 소요일" name="leadTimeDays" type="number" defaultValue={s?.leadTimeDays} hint="발주 후 입고까지 평균 일수" />
        <F label="주소" name="address" defaultValue={s?.address} span={4} />
      </Section>
      <Section title="주류 판매 면허" desc="도매 면허(종합주류도매업·특정주류도매업 등)를 확인한 공급처에서만 매입하세요. 면허증 사본은 별도 보관합니다.">
        <F label="면허 종류" name="licenseType" defaultValue={s?.licenseType} placeholder="예: 종합주류도매업" />
        <F label="면허 번호" name="licenseNumber" defaultValue={s?.licenseNumber} />
        <div className="flex items-end md:col-span-2">
          <Check label="면허 확인 완료" name="licenseVerified" defaultChecked={s?.licenseVerified} />
        </div>
      </Section>
      <Section title="거래 조건">
        <F label="결제 조건" name="paymentTerms" defaultValue={s?.paymentTerms} placeholder="예: 월말 마감 익월 10일 결제" span={2} />
        <TA label="메모" name="note" defaultValue={s?.note} span={4} />
      </Section>
    </ActionForm>
  );
}
