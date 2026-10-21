import { PageTitle, Pill } from "@/components/admin/AdminShell";
import { addToSlot, moveSlot, removeSlot, updateSlotPeriod } from "@/lib/admin-actions";
import { prisma } from "@/lib/db";
import { SLOT_LABEL } from "@/lib/labels";

const WHERE = {
  MAIN: "메인 · THE COLLECTION (최대 8개 노출)",
  GIFT: "프리미엄 기프트 페이지 추천",
  PROFIT: "내부 관리용 고수익 리스트",
  LIMITED: "메인 · LIMITED EDITION",
  SEASONAL: "시즌 기획전 (노출 기간 설정)",
};

export default async function Featured() {
  const [slots, products] = await Promise.all([
    prisma.featuredSlot.findMany({ include: { product: { include: { brewery: true } } }, orderBy: [{ slot: "asc" }, { position: "asc" }] }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, status: true } }),
  ]);
  const d = (v: Date | null) => (v ? v.toISOString().slice(0, 10) : "");
  return (
    <>
      <PageTitle title="추천 상품 설정" desc="슬롯별로 상품을 선택하고 순서·노출 기간을 지정합니다. 고객에게 수익 정보는 노출되지 않습니다." />
      <div className="grid gap-4 lg:grid-cols-2">
        {(Object.keys(SLOT_LABEL) as (keyof typeof SLOT_LABEL)[]).map((slot) => {
          const list = slots.filter((s) => s.slot === slot);
          return (
            <section key={slot} className="adm-card">
              <h2 className="text-sm font-semibold">{SLOT_LABEL[slot]}</h2>
              <p className="text-xs text-charcoal/50">{WHERE[slot]}</p>
              <ul className="mt-3 divide-y divide-line">
                {list.map((s, i) => (
                  <li key={s.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        <span className="mr-2 text-charcoal/40">{i + 1}</span>
                        {s.product.name} {s.product.status !== "PUBLISHED" && <Pill tone="warn">비공개</Pill>}
                      </span>
                      <span className="flex gap-1">
                        {(["up", "down"] as const).map((dir) => (
                          <form key={dir} action={moveSlot}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="dir" value={dir} />
                            <button className="adm-btn-ghost px-2 py-0.5 text-xs" aria-label={dir === "up" ? "위로" : "아래로"}>
                              {dir === "up" ? "↑" : "↓"}
                            </button>
                          </form>
                        ))}
                        <form action={removeSlot}>
                          <input type="hidden" name="id" value={s.id} />
                          <button className="adm-btn-ghost px-2 py-0.5 text-xs text-[#9B1C1C]">삭제</button>
                        </form>
                      </span>
                    </div>
                    {slot === "SEASONAL" && (
                      <form action={updateSlotPeriod} className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="date" name="startsAt" defaultValue={d(s.startsAt)} className="adm-input w-36 py-0.5 text-xs" aria-label="시작일" />
                        ~
                        <input type="date" name="endsAt" defaultValue={d(s.endsAt)} className="adm-input w-36 py-0.5 text-xs" aria-label="종료일" />
                        <button className="adm-btn-ghost px-2 py-0.5 text-xs">기간 저장</button>
                      </form>
                    )}
                  </li>
                ))}
                {list.length === 0 && <li className="py-2 text-sm text-charcoal/45">비어 있음</li>}
              </ul>
              <form action={addToSlot} className="mt-3 flex gap-2">
                <input type="hidden" name="slot" value={slot} />
                <select name="productId" className="adm-input py-1.5" required defaultValue="">
                  <option value="" disabled>
                    상품 선택
                  </option>
                  {products
                    .filter((p) => !list.some((s) => s.productId === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
                <button className="adm-btn py-1.5">추가</button>
              </form>
            </section>
          );
        })}
      </div>
    </>
  );
}
