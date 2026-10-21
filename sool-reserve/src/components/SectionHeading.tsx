export default function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "left",
  action,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <div className={`mb-10 flex flex-col gap-4 md:mb-14 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h-section mt-3">{title}</h2>
        {desc && <p className="mt-4 text-sm leading-relaxed text-charcoal/60 md:text-[15px]">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
