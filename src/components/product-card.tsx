import Link from "next/link";
import Image from "next/image";
import type { MedusaProduct } from "@/lib/medusa";
import { formatPrice, getDisplayAmount } from "@/lib/medusa";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: MedusaProduct;
  priority?: boolean;
}) {
  const price = product.variants[0]?.calculated_price;
  const imageUrl = product.images[0]?.url ?? product.thumbnail;

  return (
    <Link href={`/products/${product.handle}`} className="group flex shrink-0 flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-cream border border-brand-chocolate/10">
        {price && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-brand-gold px-3 py-1 text-xs font-semibold text-brand-chocolate shadow-sm">
            {formatPrice(getDisplayAmount(price), price.currency_code)}
          </span>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-brand-chocolate/40">
            Pas d&apos;image
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-brand-chocolate">{product.title}</p>
    </Link>
  );
}
