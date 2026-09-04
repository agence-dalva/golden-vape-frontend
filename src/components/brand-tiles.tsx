import Link from "next/link";
import Image from "next/image";
import type { CategoryBrand } from "@/lib/medusa";

/**
 * Repli lorsqu'une marque n'a pas encore de logo : un visuel, et non des initiales — du texte
 * ferait un trou dans la grille. Le nuage reprend le motif du logotype, en teinte sourde.
 *
 * Dessiné en ligne plutôt que servi comme fichier : `next/image` refuse les SVG tant que
 * `dangerouslyAllowSVG` n'est pas activé, et ce réglage vaudrait aussi pour les images
 * distantes — trop cher payé pour un visuel de repli.
 */
function LogoAbsent() {
  return (
    <svg viewBox="0 0 72 44" fill="none" aria-hidden className="h-full w-full p-0.5">
      <path
        d="M23 32h27a8.5 8.5 0 0 0 .8-16.96A12 12 0 0 0 27.6 12.4 9.8 9.8 0 0 0 23 32Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Grille de vignettes de marque, partagée par le menu de bureau et celui du mobile — sans
 * quoi les deux rendus divergeraient au premier ajustement.
 *
 * Fond blanc, à la différence des pastilles de rayon : beaucoup de logos portent un cadre
 * blanc incrusté dans l'image, qui ferait une tache sur de l'ivoire. Ce qui détache la
 * vignette du panneau reste l'ombre portée, non un filet — un trait coloré redécouperait le
 * panneau en autant de cases.
 */
export default function BrandTiles({
  brands,
  hrefFor,
  onNavigate,
  className = "grid-cols-6",
}: {
  brands: CategoryBrand[];
  hrefFor: (brand: CategoryBrand) => string;
  onNavigate?: () => void;
  /** Nombre de colonnes, à adapter à la largeur du panneau qui accueille la grille. */
  className?: string;
}) {
  return (
    <ul className={`grid gap-2 ${className}`}>
      {brands.map((brand) => (
        <li key={brand.value} className="min-w-0">
          <Link
            href={hrefFor(brand)}
            onClick={onNavigate}
            title={`${brand.value} — ${brand.count} produit${brand.count > 1 ? "s" : ""}`}
            className="flex flex-col items-center gap-1 rounded-[8px] bg-gv-card p-1.5 shadow-[0_1px_2px_rgb(68_54_46/0.10),0_1px_6px_rgb(68_54_46/0.06)] transition-shadow duration-150 hover:shadow-[0_2px_4px_rgb(68_54_46/0.14),0_4px_12px_rgb(68_54_46/0.10)]"
          >
            {/* Hauteur fixe et `contain` : les logos arrivent en formats très différents,
                seule une zone normalisée les aligne. */}
            <span className="relative flex h-9 w-full items-center justify-center overflow-hidden text-gv-300">
              {brand.image_url ? (
                <Image src={brand.image_url} alt="" fill sizes="88px" className="object-contain p-0.5" />
              ) : (
                <LogoAbsent />
              )}
            </span>
            <span className="w-full truncate text-center text-[11px] leading-tight text-gv-text-soft">
              {brand.value}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
