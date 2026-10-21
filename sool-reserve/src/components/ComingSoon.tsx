import Link from "next/link";

export default function ComingSoon({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h-display mt-4">{title}</h1>
      <div className="mx-auto my-8 h-px w-10 bg-gold" />
      <p className="max-w-md text-[15px] leading-relaxed text-charcoal/60">{desc}</p>
      <Link href="/collection" className="btn-ghost mt-10">
        컬렉션 둘러보기
      </Link>
    </div>
  );
}
