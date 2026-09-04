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
import FilterPanel from "@/components/category/filter-panel";
import {
  collectCategoryIds,
  getCategoryByHandle,
  listProductsByCategory,
  listProductsByIds,
  listCategoryPriceIndex,
  listCategoryFacets,
  listProductAttributesBulk,
  type MedusaProduct,
  type ProductAttributeBrief,
} from "@/lib/medusa";
import { resolveSort, DEFAULT_SORT } from "@/lib/catalog-sort";
import { readFilters, clearFiltersHref } from "@/lib/catalog-filters";
import { extractProductFacts } from "@/lib/product-facts";

const PAGE_SIZE = 24;

// Le prix est calculé après la requête et ne se trie pas en base : le classer suppose de
// connaître tout l'ensemble retenu, pas seulement une page. Aligné sur la borne de la route.
const MAX_FILTERED = 1000;

// Les filtres arrivent en `f_<repère>` : la signature reste ouverte plutôt que d'énumérer des
// clés que l'administration peut créer à tout moment.
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

  // Une rubrique de regroupement — « Cigarette électronique » — ne porte aucun produit en
  // propre : la page liste donc aussi ceux de ses sous-catégories, sans quoi elle serait vide.
  const categoryIds = collectCategoryIds(category);

  const sort = resolveSort(typeof query.tri === "string" ? query.tri : undefined);
  const requestedPage = Number.parseInt(
    typeof query.page === "string" ? query.page : "1",
    10
  );
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  /*
    Les facettes sont demandées dans tous les cas : le panneau doit s'afficher même sans
    filtre actif. Les identifiants qu'elles renvoient ne servent en revanche qu'une fois un
    filtre posé — sans filtre, les chemins de lecture existants restent inchangés.

    Une panne de la route ne doit pas emporter la page : le panneau disparaît, le catalogue
    reste consultable.
  */
  const activeFilters = readFilters(query);
  const filtering = Object.keys(activeFilters).length > 0;

  const facetting = await listCategoryFacets(category.handle, {
    filters: activeFilters,
    limit: sort.byPrice ? MAX_FILTERED : PAGE_SIZE,
    offset: sort.byPrice ? 0 : offset,
    order: sort.order === "-created_at" ? "-created_at" : "title",
  }).catch(() => null);

  let products: MedusaProduct[];
  let count: number;

  if (sort.byPrice) {
    // Le prix n'est pas triable en base : on classe un index léger de la catégorie entière,
    // puis on ne charge en détail que les vingt-quatre produits de la page demandée.
    const index = await listCategoryPriceIndex(categoryIds);
    // Les filtres restreignent l'ensemble avant le classement : trier puis filtrer donnerait
    // des pages trouées.
    const retenus = filtering && facetting ? new Set(facetting.product_ids) : null;
    const direction = sort.byPrice === "asc" ? 1 : -1;
    const ranked = index
      .filter((entry) => !retenus || retenus.has(entry.id))
      .sort((a, b) => {
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
  } else if (filtering && facetting) {
    count = facetting.total;
    const ids = facetting.product_ids;
    const fetched = ids.length ? (await listProductsByIds(ids, PAGE_SIZE)).products : [];
    const byId = new Map(fetched.map((product) => [product.id, product]));
    products = ids
      .map((id) => byId.get(id))
      .filter((product): product is MedusaProduct => Boolean(product));
  } else {
    ({ products, count } = await listProductsByCategory(categoryIds, {
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

  const basePath = `/categories/${category.handle}`;

  // Les filtres actifs sont reconduits d'une page à l'autre : les perdre au changement de page
  // renverrait sur un autre ensemble de produits que celui affiché.
  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (sort.value !== DEFAULT_SORT) params.set("tri", sort.value);
    for (const [slug, values] of Object.entries(activeFilters)) {
      params.set(`f_${slug}`, values.join(","));
    }
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return `${basePath}${search ? `?${search}` : ""}#produits`;
  };

  return (
    <div>
      <div className="gv-container">
        <Breadcrumbs trail={trail} />

        <CategoryIntro category={category} />

      </div>

      {/*
        Sol ivoire sous la grille, d'un bord à l'autre. Les cartes produit sont blanches : sur
        un fond de page à deux points du blanc, elles ne se détachaient de rien et la section se
        lisait comme un vide. Le même sol habille la grille du catalogue, pour que le passage de
        l'une à l'autre ne change pas de décor.

        Pas de filet haut : l'en-tête de catégorie en pose déjà un, les deux se doubleraient.
      */}
      <section id="produits" className="scroll-mt-8 border-b border-gv-border bg-gv-soft">
        <div className="gv-container pb-12 pt-8">
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

          <div className="grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <FilterPanel
              facets={facetting?.facets ?? []}
              filters={activeFilters}
              basePath={basePath}
              params={query}
            />

            <div className="min-w-0">
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
                  : filtering
                    ? "Aucun produit ne correspond à ces filtres."
                    : "Aucun produit n'est disponible dans cette catégorie pour le moment."
              }
              description={
                count > 0
                  ? "Le numéro de page demandé dépasse la liste."
                  : filtering
                    ? "Élargissez votre sélection en retirant un critère."
                    : "Explorez les autres catégories du catalogue en attendant le réassort."
              }
              primary={
                count > 0
                  ? { label: "Revenir au début", href: basePath }
                  : filtering
                    ? { label: "Effacer les filtres", href: clearFiltersHref(basePath, query) }
                    : { label: "Voir tout le catalogue", href: "/categories" }
              }
            />
          )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
