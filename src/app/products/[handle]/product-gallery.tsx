"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";

const ARROW_CLASSES =
  "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/92 text-gv-text shadow-gv-raised transition-shadow hover:shadow-gv-raised-strong";

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

  // Les flèches font boucler la galerie : sur dix-huit visuels, s'arrêter aux extrémités
  // obligerait à traverser toute la bande pour revenir à la photo voisine.
  const step = (delta: number) =>
    setActiveIndex((current) => (current + delta + images.length) % images.length);

  // La bande de miniatures ne suit pas d'elle-même : passé les premières photos, la vignette
  // active sortirait du cadre et les flèches sembleraient ne rien sélectionner. Le premier
  // rendu est ignoré, pour ne pas déplacer la page à l'ouverture de la fiche.
  const thumbnailsRef = useRef<HTMLUListElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    thumbnailsRef.current?.children[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeIndex]);

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white shadow-gv-raised lg:aspect-[1.2/1] lg:min-h-[600px]">
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

        {hasThumbnails && (
          <>
            <button
              onClick={() => step(-1)}
              aria-label="Photo précédente"
              className={`${ARROW_CLASSES} left-3`}
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Photo suivante"
              className={`${ARROW_CLASSES} right-3`}
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </>
        )}
      </div>

      {/*
        Toutes les miniatures, quel qu'en soit le nombre : certaines fiches en comptent
        dix-huit, et n'afficher que les premières les rendait carrément inatteignables — sans
        bouton, `activeIndex` ne pouvait pas les désigner.

        En rangée sous l'image plutôt qu'en colonne à gauche : le surplus défile
        horizontalement, sans imposer de hauteur à la fiche ni voler de largeur à l'image.
      */}
      {hasThumbnails && (
        <ul ref={thumbnailsRef} className="flex gap-[18px] overflow-x-auto pb-1">
          {images.map((url, index) => (
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
    </div>
  );
}
