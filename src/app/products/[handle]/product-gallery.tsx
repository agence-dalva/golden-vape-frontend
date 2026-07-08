"use client";

import Image from "next/image";
import type { MedusaProduct } from "@/lib/medusa";

export default function ProductGallery({
  product,
  selectedImageUrl,
}: {
  product: MedusaProduct;
  selectedImageUrl: string | null;
}) {
  const fallback = product.images[0]?.url ?? product.thumbnail;
  const displayedImage = selectedImageUrl ?? fallback;

  return (
    <div className="aspect-square w-full overflow-hidden rounded-lg bg-brand-cream border border-brand-chocolate/10">
      {displayedImage ? (
        <Image
          src={displayedImage}
          alt={product.title}
          width={600}
          height={600}
          className="h-full w-full object-cover"
          priority
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-sm text-brand-chocolate/40">
          Pas d&apos;image
        </div>
      )}
    </div>
  );
}
