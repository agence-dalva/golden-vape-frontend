import Link from "next/link";
import { listCategories } from "@/lib/medusa";
import SectionHeading from "@/components/section-heading";

export const metadata = {
  title: "Catalogue — Golden Vape",
  description: "Toutes les catégories de produits Golden Vape.",
};

// Destination du lien « Parcourir le catalogue » de l'accueil : sans cette page, le lien
// pointait sur une route inexistante.
export default async function CatalogPage() {
  const categories = await listCategories();

  return (
    <div className="gv-container py-12 sm:py-16">
      <SectionHeading eyebrow="Catalogue" title="Toutes nos catégories" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <section
            key={category.id}
            className="rounded-xl border border-gv-border bg-gv-card p-6 shadow-gv-xs"
          >
            <h2 className="font-display text-[22px] font-medium leading-tight text-gv-text">
              <Link href={`/categories/${category.handle}`} className="hover:text-gv-800">
                {category.name}
              </Link>
            </h2>

            {category.category_children.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {category.category_children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.handle}`}
                      className="text-sm text-gv-text-soft transition-colors hover:text-gv-800"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
