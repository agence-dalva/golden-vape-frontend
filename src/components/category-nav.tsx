"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { MedusaCategory, MedusaBrand, CategoryBrand } from "@/lib/medusa";
import { useHoverMenu, menuPanelClasses } from "@/lib/use-hover-menu";
import CategoryNavItem from "./category-nav-item";
import BrandMenu from "./brand-menu";

/**
 * Nombre de catégories tenant sur une ligne à 1100px, largeur la plus étroite où cette
 * navigation reste affichée. Au-delà, les items déborderaient hors de l'écran : le surplus
 * bascule dans un menu « Plus ». L'ordre suit le rang défini dans l'administration, à
 * condition de le demander explicitement à l'API — cf. `listCategories`.
 */
const MAX_VISIBLE = 7;

export default function CategoryNav({
  categories,
  brands,
  categoryBrands,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
  /** Marques présentes dans chaque rubrique, indexées par handle. */
  categoryBrands: Record<string, CategoryBrand[]>;
}) {
  const brandsMenu = useHoverMenu();
  const moreMenu = useHoverMenu();

  /*
    Le panneau reste monté pour pouvoir être animé, mais son contenu — dont dix-huit logos —
    n'est construit qu'au premier survol : sinon chaque page du site paierait ces images
    sans que personne n'ouvre le menu.
  */
  const [brandsRendered, setBrandsRendered] = useState(false);
  const openBrands = () => {
    setBrandsRendered(true);
    brandsMenu.openMenu();
  };
  const brandsHoverProps = { onMouseEnter: openBrands, onMouseLeave: brandsMenu.closeMenu };

  const visible = categories.slice(0, MAX_VISIBLE);
  const overflow = categories.slice(MAX_VISIBLE);

  return (
    <nav
      aria-label="Catégories"
      /*
        `overflow-x: clip` et non `hidden` : il borne la largeur sans transformer l'axe
        vertical en zone de défilement, donc les panneaux continuent de descendre sous la
        barre. Sans lui, les panneaux fermés — invisibles mais toujours dans le flux de
        défilement — étendent le document et font apparaître une barre horizontale dès le
        chargement, avant tout survol.
      */
      className="relative z-20 hidden overflow-x-clip border-b border-white/10 bg-gv-800 lg:block"
    >
      <div className="gv-container flex min-h-12 items-center justify-between gap-x-4">
        {/*
          En tête de barre, et non en fin : à droite, « Nos marques » se trouvait sur le
          trajet de la souris entre l'icône du panier et le bouton de commande, et son grand
          panneau s'ouvrait à chaque passage.
        */}
        <div {...brandsHoverProps}>
          <Link
            href="/marques"
            className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-white transition-colors duration-200 hover:text-gv-200"
          >
            Nos marques
          </Link>
        </div>

        {visible.map((category) => (
          <CategoryNavItem
            key={category.id}
            category={category}
            brands={categoryBrands[category.handle] ?? []}
          />
        ))}

        {overflow.length > 0 && (
          <div className="relative" {...moreMenu.hoverProps}>
            <button
              onClick={moreMenu.toggle}
              aria-expanded={moreMenu.open}
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-white transition-colors duration-200 hover:text-gv-200"
            >
              Plus
              <ChevronDown
                size={14}
                aria-hidden
                className={`opacity-60 transition-transform duration-200 ${moreMenu.open ? "rotate-180" : ""}`}
              />
            </button>

            {/*
              Aligné à droite : « Plus » ferme la barre, un panneau
              ouvert vers la droite dépassait du document et faisait apparaître une barre de
              défilement horizontale de trois pixels — le panneau reste monté pour être animé,
              donc il compte dans la largeur même fermé.
            */}
            <div className={`absolute right-0 top-full z-100 min-w-52 pt-1 ${menuPanelClasses(moreMenu.open)}`}>
              <div className="rounded-[10px] border border-gv-border bg-gv-soft py-2 shadow-gv-sm">
                {overflow.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    onClick={moreMenu.closeNow}
                    className="block px-4 py-2 text-sm text-gv-text-soft transition-colors duration-150 hover:bg-gv-soft hover:text-gv-text"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {brands.length > 0 && (
        <div
          className={`absolute left-0 right-0 top-full z-100 border-t border-gv-border bg-gv-soft shadow-gv-sm ${menuPanelClasses(brandsMenu.open)}`}
          {...brandsHoverProps}
        >
          <div className="gv-container py-6">{brandsRendered && <BrandMenu brands={brands} />}</div>
        </div>
      )}
    </nav>
  );
}
