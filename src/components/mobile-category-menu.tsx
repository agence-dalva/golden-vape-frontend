"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import type { MedusaCategory, MedusaBrand } from "@/lib/medusa";
import BrandMenu from "./brand-menu";

const BRANDS_SECTION_ID = "__brands__";
const FADE_DURATION_MS = 150;

export default function MobileCategoryMenu({
  categories,
  brands,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
}) {
  const [open, setOpen] = useState(false);
  // Reste monté pendant l'animation de sortie (fade), démonté seulement une fois le fade terminé.
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setExpandedId(null);
  };

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timeout = setTimeout(() => setMounted(false), FADE_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  return (
    <div className="contents lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex cursor-pointer items-center justify-center p-2 text-brand-chocolate"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mounted && (
        <div
          className={`absolute left-0 right-0 top-full z-30 border-t border-brand-chocolate/10 bg-brand-cream transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0"}`}
        >
          {categories.map((category) => {
            const hasChildren = category.category_children.length > 0;
            const isExpanded = expandedId === category.id;

            if (!hasChildren) {
              return (
                <div key={category.id} className="border-b border-brand-chocolate/10">
                  <Link
                    href={`/categories/${category.handle}`}
                    onClick={close}
                    className="block px-6 py-3 text-sm font-medium text-brand-chocolate"
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
                  className="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm font-medium text-brand-chocolate"
                >
                  {category.name}
                  <ChevronDown
                    size={16}
                    className={`text-brand-chocolate/60 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="bg-white pb-2">
                    <Link
                      href={`/categories/${category.handle}`}
                      onClick={close}
                      className="block px-10 py-2 text-sm font-medium text-brand-chocolate"
                    >
                      Voir tout {category.name}
                    </Link>
                    {category.category_children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        onClick={close}
                        className="block px-10 py-2 text-sm text-brand-chocolate/80"
                      >
                        {child.name}
                      </Link>
                    ))}
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
                className="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm font-medium text-brand-chocolate"
              >
                Nos marques
                <ChevronDown
                  size={16}
                  className={`text-brand-chocolate/60 transition-transform ${expandedId === BRANDS_SECTION_ID ? "rotate-180" : ""}`}
                />
              </button>

              {expandedId === BRANDS_SECTION_ID && (
                <div className="bg-white px-6 pb-4">
                  <Link
                    href="/marques"
                    onClick={close}
                    className="block py-2 text-sm font-medium text-brand-chocolate"
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
      )}
    </div>
  );
}
