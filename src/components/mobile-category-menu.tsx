"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import type { MedusaCategory } from "@/lib/medusa";

export default function MobileCategoryMenu({ categories }: { categories: MedusaCategory[] }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setExpandedId(null);
  };

  return (
    <div className="contents lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex items-center justify-center p-2 text-brand-chocolate"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 border-t border-brand-chocolate/10 bg-brand-cream">
          {categories.map((category) => {
            const hasChildren = category.category_children.length > 0;
            const isExpanded = expandedId === category.id;

            return (
              <div key={category.id} className="border-b border-brand-chocolate/10">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/categories/${category.handle}`}
                    onClick={close}
                    className="flex-1 px-6 py-3 text-sm font-medium text-brand-chocolate"
                  >
                    {category.name}
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : category.id)}
                      aria-label={`Afficher les sous-catégories de ${category.name}`}
                      aria-expanded={isExpanded}
                      className="px-6 py-3 text-brand-chocolate/60"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="bg-white pb-2">
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
        </div>
      )}
    </div>
  );
}
