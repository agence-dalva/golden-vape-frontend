"use client";

import Link from "next/link";
import type { MedusaCategory, CategoryBrand } from "@/lib/medusa";
import { ChevronDown } from "lucide-react";
import { useHoverMenu, menuPanelClasses } from "@/lib/use-hover-menu";
import { filterSlug } from "@/lib/catalog-filters";

/**
 * Au-delà, le menu déroulant s'allonge plus que la page : les marques restantes se retrouvent
 * derrière le lien vers la rubrique, où le filtre les propose toutes.
 */
const MAX_BRANDS = 8;

export default function CategoryNavItem({
  category,
  brands,
}: {
  category: MedusaCategory;
  /** Marques présentes dans la rubrique ou sa descendance, les plus fournies d'abord. */
  brands: CategoryBrand[];
}) {
  const { open, closeNow, hoverProps } = useHoverMenu();
  const hasChildren = category.category_children.length > 0;
  const visibleBrands = brands.slice(0, MAX_BRANDS);
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
        <div className={`absolute left-0 top-full z-100 pt-1 ${menuPanelClasses(open)}`}>
          <div
            /*
              `flex` et non `grid` : le panneau est en position absolue, sa largeur s'ajuste à
              son contenu. Des pistes `minmax(0, 1fr)` peuvent alors tomber à zéro et les deux
              colonnes se superposent — ce qui arrivait. En flex, chaque colonne fait au moins
              la largeur qu'elle réclame.
            */
            className={`rounded-[10px] border border-gv-border bg-white py-2 shadow-gv-sm ${
              hasChildren && hasBrands ? "flex divide-x divide-gv-border" : ""
            }`}
          >
            {hasChildren && (
              <div className="min-w-48">
                {hasBrands && (
                  <p className="px-4 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                    Rayons
                  </p>
                )}
                {category.category_children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    onClick={closeNow}
                    className="block px-4 py-2 text-sm text-gv-text-soft transition-colors duration-150 hover:bg-gv-soft hover:text-gv-text"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}

            {hasBrands && (
              <div className="min-w-52">
                {hasChildren && (
                  <p className="px-4 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                    Marques
                  </p>
                )}
                {/*
                  Le lien mène à la rubrique filtrée, et non à la page de la marque : depuis
                  « Diy », cliquer « Pulp » doit montrer les concentrés Pulp, pas l'ensemble du
                  catalogue Pulp — e-liquides compris.
                */}
                {visibleBrands.map((brand) => (
                  <Link
                    key={brand.value}
                    href={`${lienRubrique}?f_${filterSlug("Marque")}=${encodeURIComponent(brand.value)}#produits`}
                    onClick={closeNow}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gv-text-soft transition-colors duration-150 hover:bg-gv-soft hover:text-gv-text"
                  >
                    <span className="min-w-0 flex-1 truncate">{brand.value}</span>
                    <span className="shrink-0 text-[12px] text-gv-text-muted">{brand.count}</span>
                  </Link>
                ))}

                {brands.length > visibleBrands.length && (
                  <Link
                    href={`${lienRubrique}#produits`}
                    onClick={closeNow}
                    className="block px-4 pb-1 pt-2 text-[12px] font-medium text-gv-800 transition-colors hover:underline"
                  >
                    Les {brands.length} marques
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
