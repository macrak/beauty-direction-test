import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="font-serif text-sm tracking-[0.32em]">SOOL RESERVE</p>
      <h1 className="mt-8 font-kserif text-3xl font-light">페이지를 찾을 수 없습니다.</h1>
      <Link href="/" className="btn-ghost mt-10">
        홈으로
      </Link>
    </div>
  );
}
