import Link from "next/link";
import Image from "next/image";

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
 * Le minimum dont une vignette a besoin. Les deux sources de marques du site le satisfont :
 * celles du catalogue, qui comptent leurs produits, et celles de l'index, qui ne les comptent
 * pas — d'où le générique, qui laisse ce supplément au `titleFor` de l'appelant.
 */
type Vignette = { value: string; image_url: string | null };

/*
  Deux finitions, pour deux surfaces qui n'ont rien à voir.

  `card` — le menu du mobile. Chaque marque est une vignette blanche posée sur l'ivoire :
  beaucoup de logos portent un cadre blanc incrusté dans l'image, qui ferait une tache sur un
  fond teinté. Ce qui détache la vignette reste l'ombre portée, non un filet.

  `bare` — les panneaux déroulants du bureau. Les marques y sont assez nombreuses et assez
  grandes pour qu'autant de cartes blanches redécoupent le panneau en boîtes. Elles reposent
  donc à même le fond, et de fins filets les séparent : le quadrillage se lit comme une
  grille, pas comme un tas de cases.
*/
type Finition = "card" | "bare";

/*
  Le quadrillage ne trace que ses lignes intérieures, quels que soient le nombre de colonnes
  et le nombre de marques.

  Chaque case porte un filet à droite et en dessous ; la grille remonte d'un pixel à droite et
  en bas, et son conteneur rogne ce qui dépasse — ce qui efface d'un coup la colonne de droite
  et la rangée du bas, sans avoir à les compter. Reste le cas d'une dernière rangée
  incomplète, où le filet droit de la toute dernière case pendrait dans le vide : `last:` le
  retire.
*/
const CASE_BARE = "border-b border-r border-[rgba(68,54,46,0.10)] last:border-r-0";

export default function BrandTiles<T extends Vignette>({
  brands,
  hrefFor,
  titleFor,
  onNavigate,
  className = "grid-cols-6",
  finition = "card",
}: {
  brands: T[];
  hrefFor: (brand: T) => string;
  /** Infobulle facultative : seules les marques du catalogue savent compter leurs produits. */
  titleFor?: (brand: T) => string;
  onNavigate?: () => void;
  /** Nombre de colonnes, à adapter à la largeur du panneau qui accueille la grille. */
  className?: string;
  finition?: Finition;
}) {
  const bare = finition === "bare";

  const grille = (
    /* Aucune gouttière en finition `bare` : les filets ne formeraient pas des lignes
       continues s'ils étaient séparés par un écart. */
    <ul className={`grid ${bare ? "-mb-px -mr-px" : "gap-2"} ${className}`}>
      {brands.map((brand) => (
        <li key={brand.value} className={`min-w-0 ${bare ? CASE_BARE : ""}`}>
          <Link
            href={hrefFor(brand)}
            onClick={onNavigate}
            title={titleFor?.(brand)}
            /* Pas de coin arrondi sur le fond de survol en finition `bare` : les filets
               dessinent des cases carrées, un fond arrondi y laissait quatre encoches. */
            className={
              bare
                ? "flex h-full min-h-[110px] flex-col items-center justify-center gap-2.5 px-2 transition-colors duration-150 hover:bg-white/60"
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

  // Le conteneur qui rogne le pixel de trop : voir `CASE_BARE`.
  return bare ? <div className="overflow-hidden">{grille}</div> : grille;
}
