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
        className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-gv-text transition-colors hover:text-gv-800"
      >
        {category.name}
        {hasChildren && <ChevronDown size={14} className="opacity-60" />}
      </Link>

      {hasChildren && open && (
        <div className="absolute left-0 top-full z-100 min-w-48 rounded-[10px] border border-gv-border bg-white py-2 shadow-gv-sm">
          {category.category_children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.handle}`}
              className="block px-4 py-2 text-sm text-gv-text-soft hover:bg-gv-soft hover:text-gv-text"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
