import type { MedusaCategory } from "@/lib/medusa";
import CategoryNavItem from "./category-nav-item";

export default function CategoryNav({ categories }: { categories: MedusaCategory[] }) {
  return (
    <nav className="relative z-20 hidden border-b border-brand-chocolate/10 bg-brand-cream lg:block">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6">
        {categories.map((category) => (
          <CategoryNavItem key={category.id} category={category} />
        ))}
      </div>
    </nav>
  );
}
