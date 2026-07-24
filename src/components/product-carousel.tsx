"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { MedusaProduct } from "@/lib/medusa";
import ProductCard from "./product-card";

export default function ProductCarousel({ products }: { products: MedusaProduct[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  return (
    <div className="bg-brand-cream">
      <div className="mx-auto max-w-6xl overflow-hidden px-6 py-10" ref={emblaRef}>
        <div className="flex">
          {products.map((product, index) => (
            <div key={product.id} className="min-w-0 flex-[0_0_50%] px-3 sm:flex-[0_0_33.333%] lg:flex-[0_0_25%]">
              <ProductCard product={product} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
