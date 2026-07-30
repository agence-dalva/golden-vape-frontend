import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { getCategoryByHandle, listProductsByCategory } from "@/lib/medusa";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const category = await getCategoryByHandle(handle);

  if (!category) {
    notFound();
  }

  const { products } = await listProductsByCategory(category.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {category.parent_category && (
        <Link
          href={`/categories/${category.parent_category.handle}`}
          className="text-sm text-brand-chocolate/60 hover:text-brand-chocolate mb-2 inline-block"
        >
          ← {category.parent_category.name}
        </Link>
      )}

      <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate mb-8">
        {category.name}
      </h1>

      {category.category_children.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          {category.category_children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.handle}`}
              className="flex items-center gap-1 rounded-full border border-brand-chocolate/15 px-4 py-2 text-sm text-brand-chocolate hover:border-brand-gold-dark hover:text-brand-gold-dark transition-colors"
            >
              {child.name}
              <ChevronRight size={14} />
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      ) : (
        category.category_children.length === 0 && (
          <p className="text-sm text-brand-chocolate/60">Aucun produit dans cette catégorie.</p>
        )
      )}
    </div>
  );
}
