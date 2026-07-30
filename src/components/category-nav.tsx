"use client";

import { useState } from "react";
import Link from "next/link";
import type { MedusaCategory, MedusaBrand } from "@/lib/medusa";
import CategoryNavItem from "./category-nav-item";
import BrandMenu from "./brand-menu";

export default function CategoryNav({
  categories,
  brands,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
}) {
  const [brandsOpen, setBrandsOpen] = useState(false);

  return (
    <nav className="relative z-20 hidden border-b border-brand-chocolate/10 bg-brand-cream lg:block">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6">
        {categories.map((category) => (
          <CategoryNavItem key={category.id} category={category} />
        ))}
        <div
          onMouseEnter={() => setBrandsOpen(true)}
          onMouseLeave={() => setBrandsOpen(false)}
        >
          <Link
            href="/marques"
            className="flex items-center gap-1 py-3 text-sm font-medium text-brand-chocolate hover:text-brand-gold-dark transition-colors whitespace-nowrap"
          >
            Nos marques
          </Link>
        </div>
      </div>

      {brandsOpen && brands.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-100 border-t border-brand-chocolate/10 bg-white shadow-lg"
          onMouseEnter={() => setBrandsOpen(true)}
          onMouseLeave={() => setBrandsOpen(false)}
        >
          <div className="mx-auto max-w-6xl px-6 py-6">
            <BrandMenu brands={brands} />
          </div>
        </div>
      )}
    </nav>
  );
}
