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

/*
  Deux finitions, pour deux surfaces qui n'ont rien à voir.

  `card` — le menu du mobile. Chaque marque est une vignette blanche posée sur l'ivoire :
  beaucoup de logos portent un cadre blanc incrusté dans l'image, qui ferait une tache sur un
  fond teinté. Ce qui détache la vignette reste l'ombre portée, non un filet.

  `bare` — le panneau déroulant du bureau. Les marques y sont assez nombreuses et assez
  grandes pour que quinze cartes blanches redécoupent le panneau en autant de boîtes. Elles
  reposent donc à même le fond, et ce sont de fins filets qui les séparent — le quadrillage
  se lit comme une grille, pas comme un tas de cases.
*/
type Finition = "card" | "bare";

export default function BrandTiles({
  brands,
  hrefFor,
  onNavigate,
  className = "grid-cols-6",
  finition = "card",
}: {
  brands: CategoryBrand[];
  hrefFor: (brand: CategoryBrand) => string;
  onNavigate?: () => void;
  /** Nombre de colonnes, à adapter à la largeur du panneau qui accueille la grille. */
  className?: string;
  finition?: Finition;
}) {
  const bare = finition === "bare";

  return (
    /* Aucun écart entre les cases en finition `bare` : les filets ne formeraient pas des
       lignes continues s'ils étaient séparés par une gouttière. */
    <ul className={`grid ${bare ? "" : "gap-2"} ${className}`}>
      {brands.map((brand) => (
        <li
          key={brand.value}
          className={
            bare
              /* Le quadrillage suppose six colonnes : pas de filet à droite de la sixième,
                 filet sous la première rangée seulement. Le panneau qui l'emploie doit donc
                 s'en tenir à six colonnes et douze marques. */
              ? "min-w-0 border-[rgba(68,54,46,0.10)] not-nth-[6n]:border-r nth-[-n+6]:border-b"
              : "min-w-0"
          }
        >
          <Link
            href={hrefFor(brand)}
            onClick={onNavigate}
            title={`${brand.value} — ${brand.count} produit${brand.count > 1 ? "s" : ""}`}
            className={
              bare
                ? "flex h-full min-h-[110px] flex-col items-center justify-center gap-2.5 rounded-[10px] px-2 transition-colors duration-150 hover:bg-white/60"
                : "flex flex-col items-center gap-1 rounded-lg bg-gv-card p-1.5 shadow-gv-raised transition-shadow duration-150 hover:shadow-gv-raised-strong"
            }
          >
            {/* Hauteur fixe et `contain` : les logos arrivent en formats très différents,
                seule une zone normalisée les aligne. */}
            <span
              className={`relative flex w-full items-center justify-center overflow-hidden text-gv-300 ${
                bare ? "h-[66px]" : "h-9"
              }`}
            >
              {brand.image_url ? (
                <Image
                  src={brand.image_url}
                  alt=""
                  fill
                  sizes={bare ? "200px" : "88px"}
                  className={`object-contain ${bare ? "p-1" : "p-0.5"}`}
                />
              ) : (
                <LogoAbsent />
              )}
            </span>
            <span
              className={`w-full truncate text-center font-semibold leading-tight text-gv-text ${
                bare ? "text-[13px]" : "text-[12px]"
              }`}
            >
              {brand.value}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
