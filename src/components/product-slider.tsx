"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";
import ProductCard from "./product-card";

export default function ProductSlider({
  products,
  label,
}: {
  products: MedusaProduct[];
  /** Nom accessible du carrousel, pour distinguer plusieurs sliders d'une même page. */
  label: string;
}) {
  // Pas de défilement automatique : une rangée qui bouge seule gêne la lecture et déplace
  // la cible au moment du clic.
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", update).on("reInit", update);
    // Différé d'une frame : poser l'état dans le corps de l'effet déclencherait un rendu
    // en cascade, ce que la règle React du projet proscrit.
    const frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", update).off("reInit", update);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const arrowClass =
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gv-border-strong bg-white text-gv-text transition-colors duration-200 hover:border-gv-800 hover:text-gv-800 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-gv-border-strong disabled:hover:text-gv-text";

  return (
    <div className="relative" role="group" aria-roledescription="carrousel" aria-label={label}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_46%] lg:flex-[0_0_calc(25%-18px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {(canScrollPrev || canScrollNext) && (
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={scrollPrev} disabled={!canScrollPrev} aria-label="Produits précédents" className={arrowClass}>
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button onClick={scrollNext} disabled={!canScrollNext} aria-label="Produits suivants" className={arrowClass}>
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
