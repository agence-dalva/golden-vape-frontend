"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { MedusaCategory, CategoryBrand } from "@/lib/medusa";
import { useHoverMenu, menuPanelClasses } from "@/lib/use-hover-menu";
import { categoryVisual, categoryNavIcon } from "@/lib/category-visuals";
import { filterSlug } from "@/lib/catalog-filters";
import BrandTiles from "./brand-tiles";

/** Deux rangées de six : le quadrillage de `BrandTiles` en finition `bare` compte sur ce
    format, et au-delà le panneau devient plus haut qu'utile. */
const MAX_BRANDS = 12;

const MARQUE_SLUG = filterSlug("Marque");

export default function CategoryNavItem({
  category,
  brands,
}: {
  category: MedusaCategory;
  /** Marques présentes dans la rubrique ou sa descendance, les plus fournies d'abord. */
  brands: CategoryBrand[];
}) {
  const { open, openMenu, closeMenu, closeNow } = useHoverMenu();

  /*
    Le panneau occupe toute la largeur de la page, pas celle d'un menu accroché à son item.

    Il ne peut donc pas être positionné en CSS : il faut reculer du bord de l'item jusqu'à
    celui du gabarit, distance qui change d'un item à l'autre. Elle est mesurée à l'ouverture
    sur le conteneur du gabarit lui-même, plutôt que redéclarée ici — ses marges changent
    trois fois selon la largeur de l'écran.

    Avantage sur l'ancrage à gauche ou à droite d'avant : le panneau ne saute plus d'un côté
    à l'autre quand la souris passe d'une rubrique à la suivante, il reste exactement en
    place et seul son contenu change.
  */
  const conteneur = useRef<HTMLDivElement>(null);
  const [ancrage, setAncrage] = useState<{ left: number; width: number } | null>(null);

  const ouvrir = () => {
    const boite = conteneur.current?.getBoundingClientRect();
    const page = conteneur.current?.closest(".gv-container")?.getBoundingClientRect();
    if (boite && page) {
      setAncrage({ left: page.left - boite.left, width: page.width });
    }
    openMenu();
  };

  const children = category.category_children;
  const visibleBrands = brands.slice(0, MAX_BRANDS);
  const hasChildren = children.length > 0;
  const hasBrands = visibleBrands.length > 0;
  const hasPanel = hasChildren || hasBrands;

  const lienRubrique = `/categories/${category.handle}`;

  return (
    <div ref={conteneur} className="relative" onMouseEnter={ouvrir} onMouseLeave={closeMenu}>
      <Link
        href={lienRubrique}
        className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-white transition-colors duration-200 hover:text-gv-200"
      >
        {category.name}
        {hasPanel && (
          <ChevronDown
            size={14}
            aria-hidden
            className={`opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {hasPanel && (
        <div
          style={ancrage ? { left: ancrage.left, width: ancrage.width } : undefined}
          className={`absolute left-0 top-full z-100 pt-1 ${menuPanelClasses(open)}`}
        >
          {/*
            Fond ivoire et non blanc, filet à peine visible, ombre large et très diffuse : le
            panneau se pose sur la page au lieu de s'y découper. Ces trois valeurs sont
            littérales et non tirées des jetons — elles décrivent une surface flottante, que
            le reste du site n'a pas.

            Borné en hauteur : une rubrique à beaucoup de rayons passerait sous le bas de
            l'écran sur un portable.
          */}
          <div className="max-h-[min(72vh,660px)] overflow-y-auto overscroll-contain rounded-[14px] border border-[rgba(68,54,46,0.10)] bg-gv-soft p-6 shadow-[0_12px_30px_rgba(68,54,46,0.08)]">
            {hasChildren && (
              <>
                <p className="mb-3 flex items-baseline gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                  Rayons
                  <span className="font-semibold normal-case tracking-normal text-gv-text-soft">
                    {children.length}
                  </span>
                </p>
                {/* En grille et non en rangée libre : à cette largeur, des pastilles de
                    tailles inégales laissaient des trous en fin de ligne. */}
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-6">
                  {children.map((child) => {
                    const dessin = categoryNavIcon(child.name);
                    const { Icon } = categoryVisual(child.name);

                    return (
                      <Link
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        onClick={closeNow}
                        /* Fond plus clair que le panneau : `gv-50` s'en distinguait d'un
                           point, la pastille ne tenait que par son ombre. */
                        className="flex items-center gap-3 rounded-[10px] bg-gv-page p-3 text-[14px] font-medium text-gv-text shadow-gv-xs transition-shadow duration-150 hover:shadow-gv-raised"
                      >
                        {/* Boîte carrée et `contain` : les dessins vont du flacon très étroit
                            au kit large, seule une zone normalisée les aligne sur une même
                            ligne de base. */}
                        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                          {dessin ? (
                            <Image src={dessin} alt="" fill sizes="40px" unoptimized className="object-contain" />
                          ) : (
                            <Icon size={26} strokeWidth={1.5} aria-hidden className="text-gv-800" />
                          )}
                        </span>
                        {/* Deux lignes plutôt qu'une coupure : « Clearomiseurs et
                            reconstructible » ne rentre pas, et un rayon tronqué ne se
                            reconnaît plus. La rangée s'aligne sur la pastille la plus haute. */}
                        <span className="min-w-0 line-clamp-2 leading-snug">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {hasChildren && hasBrands && (
              <div className="my-[18px] h-px bg-[rgba(68,54,46,0.12)]" />
            )}

            {hasBrands && (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="flex items-baseline gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                    Marques
                    <span className="font-semibold normal-case tracking-normal text-gv-text-soft">
                      {brands.length}
                    </span>
                  </p>
                  {brands.length > visibleBrands.length && (
                    <Link
                      href={`${lienRubrique}#produits`}
                      onClick={closeNow}
                      className="text-[13px] font-medium text-gv-800 transition-colors hover:underline"
                    >
                      Les {brands.length} marques
                    </Link>
                  )}
                </div>

                {/*
                  Le lien mène à la rubrique filtrée, pas à la page de la marque : depuis
                  « Diy », cliquer « Pulp » doit montrer les concentrés Pulp, pas l'ensemble du
                  catalogue Pulp, e-liquides compris.
                */}
                <div className="mt-3">
                  <BrandTiles
                    brands={visibleBrands}
                    titleFor={(brand) =>
                      `${brand.value} — ${brand.count} produit${brand.count > 1 ? "s" : ""}`
                    }
                    finition="bare"
                    className="grid-cols-6"
                    hrefFor={(brand) =>
                      `${lienRubrique}?f_${MARQUE_SLUG}=${encodeURIComponent(brand.value)}#produits`
                    }
                    onNavigate={closeNow}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
