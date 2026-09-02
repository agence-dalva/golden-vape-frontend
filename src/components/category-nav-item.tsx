"use client";

import Link from "next/link";
import type { MedusaCategory } from "@/lib/medusa";
import { ChevronDown } from "lucide-react";
import { useHoverMenu, menuPanelClasses } from "@/lib/use-hover-menu";

export default function CategoryNavItem({ category }: { category: MedusaCategory }) {
  const { open, closeNow, hoverProps } = useHoverMenu();
  const hasChildren = category.category_children.length > 0;

  return (
    <div className="relative" {...hoverProps}>
      <Link
        href={`/categories/${category.handle}`}
        className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium tracking-[-0.01em] text-gv-text transition-colors duration-200 hover:text-gv-800"
      >
        {category.name}
        {hasChildren && (
          <ChevronDown
            size={14}
            aria-hidden
            className={`opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {hasChildren && (
        <div className={`absolute left-0 top-full z-100 min-w-48 pt-1 ${menuPanelClasses(open)}`}>
          <div className="rounded-[10px] border border-gv-border bg-white py-2 shadow-gv-sm">
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
        </div>
      )}
    </div>
  );
}
