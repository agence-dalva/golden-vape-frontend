"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";

export default function ProductGallery({
  product,
  origin,
}: {
  product: MedusaProduct;
  /** Affiché en badge seulement si l'origine existe réellement dans les attributs. */
  origin: string | null;
}) {
  // Les visuels de déclinaison complètent ceux du produit, sans doublon.
  const images = [
    ...product.images.map((image) => image.url),
    ...product.variants.flatMap((variant) => variant.images?.map((image) => image.url) ?? []),
  ].filter((url, index, all) => url && all.indexOf(url) === index);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? product.thumbnail;
  const hasThumbnails = images.length > 1;

  return (
    // La colonne de miniatures n'existe que s'il y a plusieurs visuels : sinon l'image
    // principale se retrouverait coincée dans une colonne de 78 pixels.
    <div
      className={`flex flex-col gap-[18px] ${
        hasThumbnails ? "lg:grid lg:grid-cols-[78px_minmax(0,1fr)]" : ""
      }`}
    >
      {hasThumbnails && (
        <ul className="order-2 flex gap-[18px] overflow-x-auto lg:order-none lg:flex-col lg:overflow-visible">
          {images.slice(0, 5).map((url, index) => (
            <li key={url} className="shrink-0">
              <button
                onClick={() => setActiveIndex(index)}
                aria-label={`Voir la photo ${index + 1} de ${product.title}`}
                aria-pressed={index === activeIndex}
                className={`relative h-[78px] w-[78px] cursor-pointer overflow-hidden rounded-lg border bg-white transition-colors ${
                  index === activeIndex ? "border-gv-800" : "border-transparent hover:border-gv-border-strong"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="78px"
                  loading="lazy"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative order-1 aspect-square w-full overflow-hidden rounded-xl border border-gv-border bg-white lg:order-none lg:aspect-[1.2/1] lg:min-h-[600px]">
        {active ? (
          <Image
            src={active}
            alt={product.title}
            fill
            // Plus grand élément visible de la fiche : chargé en priorité.
            priority
            sizes="(max-width: 1099px) 100vw, 680px"
            className="object-contain p-8"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-gv-text-muted">
            <ImageOff size={26} aria-hidden />
            <span className="text-sm">Image indisponible</span>
          </span>
        )}

        {origin && (
          <span className="absolute left-4 top-4 inline-flex h-8 items-center rounded-md bg-white/92 px-2.5 text-xs font-semibold text-gv-text shadow-gv-xs">
            Fabriqué en {origin}
          </span>
        )}
      </div>
    </div>
  );
}
