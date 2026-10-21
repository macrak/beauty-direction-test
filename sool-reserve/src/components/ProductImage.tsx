import BottleArt from "./BottleArt";

export default function ProductImage({
  product,
  className = "",
  sizes = "lg",
}: {
  product: { name: string; liquorType: string; imageUrl: string | null; imageAlt: string | null };
  className?: string;
  sizes?: "sm" | "lg";
}) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-beige ${className}`}>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={product.imageAlt ?? product.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <BottleArt
          type={product.liquorType as never}
          label={product.name}
          className={sizes === "lg" ? "h-[78%] w-auto drop-shadow-sm" : "h-[72%] w-auto"}
        />
      )}
    </div>
  );
}
