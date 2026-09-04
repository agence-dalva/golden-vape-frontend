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

/** Deux rangées de six vignettes : au-delà, le panneau devient plus haut qu'utile. */
const MAX_BRANDS = 12;

/** Doit suivre la largeur déclarée sur le panneau : elle sert à décider de son ancrage. */
const PANEL_WIDTH = 620;
const MARGE = 16;

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
    L'ancrage est décidé à l'ouverture, en mesurant. Un rang dans la barre ne dit rien de
    fiable : les libellés ont des largeurs très différentes, si bien qu'un item du milieu peut
    déjà être trop à droite pour un panneau de 620 pixels — ce qui arrivait à « Diy ».
  */
  const conteneur = useRef<HTMLDivElement>(null);
  const [ancreADroite, setAncreADroite] = useState(false);

  const ouvrir = () => {
    const boite = conteneur.current?.getBoundingClientRect();
    if (boite) {
      setAncreADroite(boite.left + PANEL_WIDTH > window.innerWidth - MARGE);
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
          className={`absolute top-full z-100 pt-1 ${ancreADroite ? "right-0" : "left-0"} ${menuPanelClasses(open)}`}
        >
          <div className="w-[min(620px,calc(100vw-64px))] rounded-[10px] border border-gv-border bg-gv-soft p-4 shadow-gv-sm">
            {hasChildren && (
              <>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                  Rayons
                </p>
                {/* En rangée et non en colonne : quatre à six rayons tiennent sur une ligne, et
                    la hauteur reste disponible pour les marques. */}
                <div className="flex flex-wrap gap-2">
                  {children.map((child) => {
                    const dessin = categoryNavIcon(child.name);
                    const { Icon } = categoryVisual(child.name);

                    return (
                      <Link
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        onClick={closeNow}
                        className="flex items-center gap-2 rounded-[8px] bg-gv-50 py-2 pl-2.5 pr-3 text-[13px] font-medium text-gv-text shadow-gv-raised transition-shadow duration-150 hover:shadow-gv-raised-strong"
                      >
                        {/* Boîte carrée et `contain` : les dessins vont du flacon très étroit
                            au kit large, seule une zone normalisée les aligne sur une même
                            ligne de base. */}
                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                          {dessin ? (
                            <Image src={dessin} alt="" fill sizes="20px" className="object-contain" />
                          ) : (
                            <Icon size={15} strokeWidth={1.6} aria-hidden className="text-gv-800" />
                          )}
                        </span>
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {hasBrands && (
              <>
                <div
                  className={`flex items-baseline justify-between gap-4 ${
                    hasChildren ? "mt-4 border-t border-gv-border pt-4" : ""
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                    Marques
                  </p>
                  {brands.length > visibleBrands.length && (
                    <Link
                      href={`${lienRubrique}#produits`}
                      onClick={closeNow}
                      className="text-[12px] font-medium text-gv-800 transition-colors hover:underline"
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
                <div className="mt-2.5">
                  <BrandTiles
                    brands={visibleBrands}
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
