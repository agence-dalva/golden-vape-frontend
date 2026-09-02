"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { MedusaCategory, MedusaBrand } from "@/lib/medusa";
import CategoryNavItem from "./category-nav-item";
import BrandMenu from "./brand-menu";

/**
 * Nombre de catégories tenant sur une ligne à 1100px, largeur la plus étroite où cette
 * navigation reste affichée. Au-delà, les items déborderaient hors de l'écran : le surplus
 * bascule dans un menu « Plus ». L'ordre suit le rang défini dans l'administration Medusa.
 */
const MAX_VISIBLE = 7;

export default function CategoryNav({
  categories,
  brands,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
}) {
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const visible = categories.slice(0, MAX_VISIBLE);
  const overflow = categories.slice(MAX_VISIBLE);

  return (
    <nav
      aria-label="Catégories"
      // Dégradé chaud très léger : la navigation se détache du header sans trait marqué.
      className="relative z-20 hidden border-b border-gv-border bg-gradient-to-b from-white to-gv-50 lg:block"
    >
      <div className="gv-container flex min-h-12 items-center justify-between gap-x-4">
        {visible.map((category) => (
          <CategoryNavItem key={category.id} category={category} />
        ))}

        {overflow.length > 0 && (
          <div
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              className="flex cursor-pointer items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-gv-text transition-colors hover:text-gv-800"
            >
              Plus
              <ChevronDown size={14} aria-hidden className="opacity-60" />
            </button>

            {moreOpen && (
              <div className="absolute left-0 top-full z-100 min-w-52 rounded-[10px] border border-gv-border bg-white py-2 shadow-gv-sm">
                {overflow.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-gv-text-soft hover:bg-gv-soft hover:text-gv-text"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          onMouseEnter={() => setBrandsOpen(true)}
          onMouseLeave={() => setBrandsOpen(false)}
        >
          <Link
            href="/marques"
            className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-gv-text transition-colors hover:text-gv-800"
          >
            Nos marques
          </Link>
        </div>
      </div>

      {brandsOpen && brands.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-100 border-t border-gv-border bg-white shadow-gv-sm"
          onMouseEnter={() => setBrandsOpen(true)}
          onMouseLeave={() => setBrandsOpen(false)}
        >
          <div className="gv-container py-6">
            <BrandMenu brands={brands} />
          </div>
        </div>
      )}
    </nav>
  );
}
