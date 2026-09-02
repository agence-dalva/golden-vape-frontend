import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import ProductCard from "@/components/product-card";
import Breadcrumbs, { type Crumb } from "@/components/breadcrumbs";
import EmptyState from "@/components/empty-state";
import CategoryIntro from "@/components/category/category-intro";
import SortSelect from "@/components/category/sort-select";
import ProductPagination from "@/components/category/product-pagination";
import {
  getCategoryByHandle,
  listProductsByCategory,
  listProductsByIds,
  listCategoryPriceIndex,
  listProductAttributesBulk,
  type MedusaProduct,
  type ProductAttributeBrief,
} from "@/lib/medusa";
import { resolveSort, DEFAULT_SORT } from "@/lib/catalog-sort";
import { extractProductFacts } from "@/lib/product-facts";

const PAGE_SIZE = 24;

type SearchParams = Promise<{ tri?: string; page?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const category = await getCategoryByHandle(handle).catch(() => null);
  if (!category) return { title: "Catégorie introuvable | Golden Vape" };

  return {
    title: `${category.name} | Golden Vape`,
    description:
      category.description?.trim() ||
      `Découvrez la sélection ${category.name.toLowerCase()} de Golden Vape.`,
    alternates: { canonical: `/categories/${category.handle}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: SearchParams;
}) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryByHandle(handle);

  if (!category) {
    notFound();
  }

  const sort = resolveSort(query.tri);
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  let products: MedusaProduct[];
  let count: number;

  if (sort.byPrice) {
    // Le prix n'est pas triable en base : on classe un index léger de la catégorie entière,
    // puis on ne charge en détail que les vingt-quatre produits de la page demandée.
    const index = await listCategoryPriceIndex(category.id);
    const direction = sort.byPrice === "asc" ? 1 : -1;
    const ranked = [...index].sort((a, b) => {
      // Un produit sans prix ne vaut pas zéro : il part en fin de liste dans les deux sens.
      if (a.price === null || b.price === null) {
        return a.price === b.price ? 0 : a.price === null ? 1 : -1;
      }
      return (a.price - b.price) * direction;
    });

    count = ranked.length;
    const ids = ranked.slice(offset, offset + PAGE_SIZE).map((entry) => entry.id);
    const fetched = ids.length ? (await listProductsByIds(ids, PAGE_SIZE)).products : [];
    // listProductsByIds rend les produits dans l'ordre de la base : on rétablit celui du tri.
    const byId = new Map(fetched.map((product) => [product.id, product]));
    products = ids
      .map((id) => byId.get(id))
      .filter((product): product is MedusaProduct => Boolean(product));
  } else {
    ({ products, count } = await listProductsByCategory(category.id, {
      limit: PAGE_SIZE,
      offset,
      order: sort.order,
    }));
  }

  // Marque et caractéristique principale : une seule requête pour toute la grille. Une panne
  // de cette route ne doit pas emporter la page, les cartes se contentent alors du titre.
  const attributes: Record<string, ProductAttributeBrief[]> = await listProductAttributesBulk(
    products.map((product) => product.id)
  ).catch(() => ({}));

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const children = category.category_children ?? [];

  const trail: Crumb[] = [
    { label: "Accueil", href: "/" },
    { label: "Catalogue", href: "/categories" },
    ...(category.parent_category
      ? [
          {
            label: category.parent_category.name,
            href: `/categories/${category.parent_category.handle}`,
          },
        ]
      : []),
    { label: category.name },
  ];

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (sort.value !== DEFAULT_SORT) params.set("tri", sort.value);
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return `/categories/${category.handle}${search ? `?${search}` : ""}#produits`;
  };

  return (
    <div className="gv-container pb-20">
      <Breadcrumbs trail={trail} />

      <CategoryIntro category={category} />

      <section id="produits" className="scroll-mt-8 pt-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-[26px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[32px]">
              Notre sélection
            </h2>
            <p aria-live="polite" className="text-[13px] text-gv-text-soft">
              {count} produit{count > 1 ? "s" : ""}
            </p>
          </div>

          {count > 0 && <SortSelect value={sort.value} />}
        </div>

        {/*
          Les sous-catégories restent joignables depuis la page sans colonne de filtres :
          des liens sobres, pas la rangée de cartes illustrées supprimée du haut de page.
        */}
        {children.length > 0 && (
          <nav aria-label="Sous-catégories" className="mb-7 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] text-gv-text-soft">Affiner :</span>
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.handle}`}
                className="inline-flex min-h-11 items-center rounded-[8px] border border-gv-border bg-gv-card px-4 text-[13px] font-medium text-gv-text transition-colors hover:border-gv-border-strong hover:bg-gv-50"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        )}

        {products.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => {
                const facts = extractProductFacts(attributes[product.id]);
                return (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      priority={index < 4}
                      brand={facts.brand}
                      feature={facts.feature}
                    />
                  </li>
                );
              })}
            </ul>

            <ProductPagination current={currentPage} total={totalPages} hrefFor={hrefFor} />
          </>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title={
              count > 0
                ? "Cette page ne contient aucun produit."
                : "Aucun produit n'est disponible dans cette catégorie pour le moment."
            }
            description={
              count > 0
                ? "Le numéro de page demandé dépasse la liste."
                : "Explorez les autres catégories du catalogue en attendant le réassort."
            }
            primary={
              count > 0
                ? { label: "Revenir au début", href: `/categories/${category.handle}` }
                : { label: "Voir tout le catalogue", href: "/categories" }
            }
          />
        )}
      </section>
    </div>
  );
}
