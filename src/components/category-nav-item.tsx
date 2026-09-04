"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { MedusaCategory, CategoryBrand } from "@/lib/medusa";
import { useHoverMenu, menuPanelClasses } from "@/lib/use-hover-menu";
import { categoryVisual } from "@/lib/category-visuals";
import { filterSlug } from "@/lib/catalog-filters";

/** Deux rangées de six vignettes : au-delà, le panneau devient plus haut qu'utile. */
const MAX_BRANDS = 12;

const MARQUE_SLUG = filterSlug("Marque");

/**
 * Repli lorsqu'une marque n'a pas encore de logo : un visuel, et non des initiales — du texte
 * ferait un trou dans la grille de vignettes. Le nuage reprend le motif du logotype, en teinte
 * sourde : il tient le rythme sans prétendre représenter la marque.
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

export default function CategoryNavItem({
  category,
  brands,
  alignRight = false,
}: {
  category: MedusaCategory;
  /** Marques présentes dans la rubrique ou sa descendance, les plus fournies d'abord. */
  brands: CategoryBrand[];
  /** Panneau ancré à droite : large, il déborderait de l'écran sur les derniers items. */
  alignRight?: boolean;
}) {
  const { open, closeNow, hoverProps } = useHoverMenu();

  const children = category.category_children;
  const visibleBrands = brands.slice(0, MAX_BRANDS);
  const hasChildren = children.length > 0;
  const hasBrands = visibleBrands.length > 0;
  const hasPanel = hasChildren || hasBrands;

  const lienRubrique = `/categories/${category.handle}`;

  return (
    <div className="relative" {...hoverProps}>
      <Link
        href={lienRubrique}
        className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-gv-text transition-colors duration-200 hover:text-gv-800"
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
          className={`absolute top-full z-100 pt-1 ${alignRight ? "right-0" : "left-0"} ${menuPanelClasses(open)}`}
        >
          <div className="w-[min(620px,calc(100vw-64px))] rounded-[10px] border border-gv-border bg-white p-4 shadow-gv-sm">
            {hasChildren && (
              <>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                  Rayons
                </p>
                {/* En rangée et non en colonne : quatre à six rayons tiennent sur une ligne, et
                    la hauteur reste disponible pour les marques. */}
                <div className="flex flex-wrap gap-2">
                  {children.map((child) => {
                    const { Icon } = categoryVisual(child.name);
                    return (
                      <Link
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        onClick={closeNow}
                        className="flex items-center gap-2 rounded-[8px] border border-gv-border bg-gv-card px-3 py-2 text-[13px] font-medium text-gv-text transition-colors duration-150 hover:border-gv-border-strong hover:bg-gv-soft"
                      >
                        <Icon size={15} strokeWidth={1.6} aria-hidden className="text-gv-800" />
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
                <ul className="mt-2.5 grid grid-cols-6 gap-2">
                  {visibleBrands.map((brand) => (
                    <li key={brand.value} className="min-w-0">
                      <Link
                        href={`${lienRubrique}?f_${MARQUE_SLUG}=${encodeURIComponent(brand.value)}#produits`}
                        onClick={closeNow}
                        title={`${brand.value} — ${brand.count} produit${brand.count > 1 ? "s" : ""}`}
                        className="group flex flex-col items-center gap-1 rounded-[8px] border border-gv-border bg-gv-card p-1.5 transition-colors duration-150 hover:border-gv-border-strong hover:bg-gv-soft"
                      >
                        {/* Hauteur fixe et `contain` : les logos arrivent en formats très
                            différents, seule une zone normalisée les aligne. */}
                        <span className="relative flex h-9 w-full items-center justify-center overflow-hidden text-gv-300">
                          {brand.image_url ? (
                            <Image
                              src={brand.image_url}
                              alt=""
                              fill
                              sizes="88px"
                              className="object-contain p-0.5"
                            />
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
