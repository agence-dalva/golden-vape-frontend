"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import type { MedusaCategory, MedusaBrand, CategoryBrand } from "@/lib/medusa";
import { categoryVisual, categoryNavIcon } from "@/lib/category-visuals";
import { filterSlug } from "@/lib/catalog-filters";
import BrandMenu from "./brand-menu";
import BrandTiles from "./brand-tiles";
import { menuPanelClasses } from "@/lib/use-hover-menu";

const BRANDS_SECTION_ID = "__brands__";

/** Trois colonnes tiennent sur un téléphone sans que le nom de la marque ne soit tronqué. */
const MAX_BRANDS = 9;

const MARQUE_SLUG = filterSlug("Marque");

export default function MobileCategoryMenu({
  categories,
  brands,
  categoryBrands,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
  /** Marques présentes dans chaque rubrique, indexées par handle. */
  categoryBrands: Record<string, CategoryBrand[]>;
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = () => setOpen((wasOpen) => !wasOpen);

  const close = () => {
    setOpen(false);
    setExpandedId(null);
  };

  return (
    <div className="contents lg:hidden">
      <button
        onClick={toggle}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center justify-center gap-1 text-white transition-colors hover:text-gv-200"
      >
        {open ? <X size={24} strokeWidth={1.6} /> : <Menu size={24} strokeWidth={1.6} />}
        <span className="hidden text-xs sm:block">Menu</span>
      </button>

      {/*
        Le panneau reste monté et s'anime en opacité, comme ceux du bureau. Monté au moment de
        l'ouverture, il naissait déjà opaque : le navigateur n'avait aucun état de départ à
        animer, et l'apparition était sèche là où la fermeture était fondue.
      */}
      <div
        className={`absolute left-0 right-0 top-full z-30 max-h-[calc(100vh-var(--gv-header-h,140px))] overflow-y-auto border-t border-gv-border bg-gv-soft shadow-gv-sm ${menuPanelClasses(open)}`}
      >
          {categories.map((category) => {
            const hasChildren = category.category_children.length > 0;
            const marques = (categoryBrands[category.handle] ?? []).slice(0, MAX_BRANDS);
            const isExpanded = expandedId === category.id;

            if (!hasChildren && marques.length === 0) {
              return (
                <div key={category.id} className="border-b border-brand-chocolate/10">
                  <Link
                    href={`/categories/${category.handle}`}
                    onClick={close}
                    className="block px-6 py-4 text-[15px] font-medium text-brand-chocolate"
                  >
                    {category.name}
                  </Link>
                </div>
              );
            }

            return (
              <div key={category.id} className="border-b border-brand-chocolate/10">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : category.id)}
                  aria-expanded={isExpanded}
                  className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-[15px] font-medium text-brand-chocolate"
                >
                  {category.name}
                  <ChevronDown
                    size={18}
                    className={`text-brand-chocolate/60 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="bg-gv-50 pb-2">
                    <Link
                      href={`/categories/${category.handle}`}
                      onClick={close}
                      className="block px-10 py-3 text-[15px] font-medium text-brand-chocolate"
                    >
                      Voir tout {category.name}
                    </Link>
                    {category.category_children.map((child) => {
                      const dessin = categoryNavIcon(child.name);
                      const { Icon } = categoryVisual(child.name);

                      return (
                        <Link
                          key={child.id}
                          href={`/categories/${child.handle}`}
                          onClick={close}
                          className="flex items-center gap-3 px-10 py-3 text-[15px] text-brand-chocolate/80"
                        >
                          {/* Même boîte normalisée que sur le bureau : les dessins vont du
                              flacon étroit au kit large. */}
                          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                            {dessin ? (
                              <Image src={dessin} alt="" fill sizes="28px" className="object-contain" />
                            ) : (
                              <Icon size={20} strokeWidth={1.6} aria-hidden className="text-gv-800" />
                            )}
                          </span>
                          {child.name}
                        </Link>
                      );
                    })}

                    {marques.length > 0 && (
                      <div className="mt-2 px-10">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
                          Marques
                        </p>
                        <BrandTiles
                          brands={marques}
                          className="grid-cols-3"
                          hrefFor={(brand) =>
                            `/categories/${category.handle}?f_${MARQUE_SLUG}=${encodeURIComponent(brand.value)}#produits`
                          }
                          onNavigate={close}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {brands.length > 0 && (
            <div className="border-b border-brand-chocolate/10">
              <button
                onClick={() => setExpandedId(expandedId === BRANDS_SECTION_ID ? null : BRANDS_SECTION_ID)}
                aria-expanded={expandedId === BRANDS_SECTION_ID}
                className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-[15px] font-medium text-brand-chocolate"
              >
                Nos marques
                <ChevronDown
                  size={18}
                  className={`text-brand-chocolate/60 transition-transform ${expandedId === BRANDS_SECTION_ID ? "rotate-180" : ""}`}
                />
              </button>

              {expandedId === BRANDS_SECTION_ID && (
                <div className="bg-gv-50 px-6 pb-4">
                  <Link
                    href="/marques"
                    onClick={close}
                    className="block py-3 text-[15px] font-medium text-brand-chocolate"
                  >
                    Voir toutes les marques
                  </Link>
                  <div onClick={close}>
                    <BrandMenu brands={brands} />
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
