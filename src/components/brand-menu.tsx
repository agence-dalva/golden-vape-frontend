import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { MedusaBrand } from "@/lib/medusa";
import { sortBrands } from "@/lib/brands";

// Au-delà, le panneau deviendrait plus haut que l'écran. Le lien de bas de panneau mène à
// l'index complet.
const MAX_VISIBLE = 18;

export default function BrandMenu({ brands }: { brands: MedusaBrand[] }) {
  const sorted = sortBrands(brands);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - visible.length;

  /*
    Colonne bornée par le panneau qui l'accueille : l'en-tête et le pied restent en place, et
    c'est la grille qui défile. Sans cela, sur un écran de portable, le lien vers l'index
    complet passait sous le bas de l'écran — le seul chemin vers les marques non montrées.
  */
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex shrink-0 items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Nos marques</p>
          <p className="mt-1 font-display text-2xl font-normal text-gv-text">
            Les marques qui font la différence
          </p>
        </div>
        <p className="text-[13px] text-gv-text-soft">
          {sorted.length} marque{sorted.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Cinq colonnes et non six : à quinze marques, la grille tombe juste en trois rangées,
          et la vignette gagne cinquante pixels de large — ce qui profite aux logotypes
          allongés autant que la hauteur profite aux autres. */}
      {/* `content-start` : sans lui, la grille étirée par le flex répartirait la place libre
          entre ses rangées et grandirait les vignettes au-delà de leur taille voulue. */}
      <ul className="grid min-h-0 flex-1 content-start grid-cols-3 gap-3.5 overflow-y-auto overscroll-contain sm:grid-cols-4 lg:grid-cols-5">
        {visible.map((brand) => (
          <li key={brand.value} className="min-w-0">
            <Link
              href={`/marques/${encodeURIComponent(brand.value)}`}
              className="group flex h-full flex-col overflow-hidden rounded-[10px] bg-gv-card shadow-gv-raised transition-shadow duration-200 hover:shadow-[0_10px_24px_rgba(68,54,46,0.10)]"
            >
              {/* Zone normalisée : `contain` préserve proportions et couleurs officielles. */}
              <span className="relative flex h-[128px] items-center justify-center">
                {brand.image_url ? (
                  <Image
                    src={brand.image_url}
                    alt={brand.value}
                    fill
                    sizes="280px"
                    className="object-contain p-5"
                  />
                ) : (
                  <span className="px-3 text-center font-display text-lg text-gv-text-soft">
                    {brand.value}
                  </span>
                )}
              </span>
              <span className="truncate px-3 pb-3.5 text-center text-[13px] font-semibold text-gv-text">
                {brand.value}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex shrink-0 justify-end border-t border-gv-border pt-4">
        <Link
          href="/marques"
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-gv-800"
        >
          {remaining > 0 ? `Voir les ${sorted.length} marques` : "Voir toutes les marques"}
          <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]" />
        </Link>
      </div>
    </div>
  );
}
