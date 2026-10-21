// 관리자 폼 필드 (서버 컴포넌트에서 사용 가능한 순수 마크업)
type Opt = string | [string, string];

export function F({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
  placeholder,
  span = 1,
  step,
  min,
  max,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  span?: 1 | 2 | 3 | 4;
  step?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <label className={spanCls(span)}>
      <span className="adm-label">
        {label}
        {required && <span className="text-burgundy"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        className="adm-input disabled:bg-[#F4F1EC] disabled:text-charcoal/50"
      />
      {hint && <span className="mt-1 block text-[11px] text-charcoal/45">{hint}</span>}
    </label>
  );
}

export function TA({ label, name, defaultValue, rows = 3, span = 2, hint }: { label: string; name: string; defaultValue?: string | null; rows?: number; span?: 1 | 2 | 3 | 4; hint?: string }) {
  return (
    <label className={spanCls(span)}>
      <span className="adm-label">{label}</span>
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={rows} className="adm-input" />
      {hint && <span className="mt-1 block text-[11px] text-charcoal/45">{hint}</span>}
    </label>
  );
}

export function Sel({
  label,
  name,
  options,
  defaultValue,
  span = 1,
  hint,
  empty,
}: {
  label: string;
  name: string;
  options: Opt[];
  defaultValue?: string | null;
  span?: 1 | 2 | 3 | 4;
  hint?: string;
  empty?: string;
}) {
  return (
    <label className={spanCls(span)}>
      <span className="adm-label">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} className="adm-input">
        {empty !== undefined && <option value="">{empty}</option>}
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      {hint && <span className="mt-1 block text-[11px] text-charcoal/45">{hint}</span>}
    </label>
  );
}

export function Check({ label, name, defaultChecked, value }: { label: string; name: string; defaultChecked?: boolean; value?: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value={value ?? "on"} defaultChecked={defaultChecked} className="accent-burgundy" />
      {label}
    </label>
  );
}

export function Checks({ label, name, options, values }: { label: string; name: string; options: readonly string[]; values: string[] }) {
  return (
    <fieldset className="md:col-span-4">
      <legend className="adm-label">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => (
          <Check key={o} label={o} name={name} value={o} defaultChecked={values.includes(o)} />
        ))}
      </div>
    </fieldset>
  );
}

export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="adm-card">
      <h2 className="text-sm font-semibold">{title}</h2>
      {desc && <p className="mt-0.5 text-xs text-charcoal/50">{desc}</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-4">{children}</div>
    </section>
  );
}

function spanCls(span: number) {
  return { 1: "block", 2: "block md:col-span-2", 3: "block md:col-span-3", 4: "block md:col-span-4" }[span];
}
