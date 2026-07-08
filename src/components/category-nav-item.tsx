"use client";

import { useState } from "react";
import Link from "next/link";
import type { MedusaCategory } from "@/lib/medusa";
import { ChevronDown } from "lucide-react";

export default function CategoryNavItem({ category }: { category: MedusaCategory }) {
  const [open, setOpen] = useState(false);
  const hasChildren = category.category_children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={`/categories/${category.handle}`}
        className="flex items-center gap-1 py-3 text-sm font-medium text-brand-chocolate hover:text-brand-gold-dark transition-colors whitespace-nowrap"
      >
        {category.name}
        {hasChildren && <ChevronDown size={14} className="opacity-60" />}
      </Link>

      {hasChildren && open && (
        <div className="absolute left-0 top-full z-100 min-w-48 rounded-lg border border-brand-chocolate/10 bg-white py-2 shadow-lg">
          {category.category_children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.handle}`}
              className="block px-4 py-2 text-sm text-brand-chocolate/80 hover:bg-brand-cream hover:text-brand-chocolate"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
