import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import ProductCard from "@/components/product-card";
import EmptyState from "@/components/empty-state";
import Breadcrumbs from "@/components/breadcrumbs";
import FilterPanel from "@/components/category/filter-panel";
import { FilterTransition } from "@/components/category/filter-transition";
import PendingGrid from "@/components/category/pending-grid";
import ProductPagination from "@/components/category/product-pagination";
import SortSelect from "@/components/category/sort-select";
import type { MedusaProduct, ProductAttributeBrief } from "@/lib/medusa";
import {
  listBrandFacets,
  listBrands,
  listPriceIndexByIds,
  listProductAttributesBulk,
  listProductsByIds,
} from "@/lib/medusa";
import { readFilters } from "@/lib/catalog-filters";
import { resolveSort, DEFAULT_SORT } from "@/lib/catalog-sort";
import { extractProductFacts } from "@/lib/product-facts";

const PAGE_SIZE = 24;
// Le tri par prix classe la marque entière avant de découper la page : il lui faut tous les
// identifiants d'un coup. La plus fournie du catalogue en compte moins de deux cents.
const MAX_FILTERED = 1000;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ value: string }>;
  searchParams: SearchParams;
}) {
  const [{ value }, query] = await Promise.all([params, searchParams]);
  const decodedValue = decodeURIComponent(value);

  const brands = await listBrands();
  const brand = brands.find((b) => b.value === decodedValue);

  if (!brand) {
    notFound();
  }

  const sort = resolveSort(typeof query.tri === "string" ? query.tri : undefined);
  const requestedPage = Number.parseInt(
    typeof query.page === "string" ? query.page : "1",
    10
  );
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const activeFilters = readFilters(query);
  const filtering = Object.keys(activeFilters).length > 0;

  /*
    Une seule lecture porte tout : les critères de filtrage disponibles, leur comptage, et la
    page d'identifiants déjà classée. Une panne de cette route ne doit pas emporter la page —
    le panneau disparaît, la grille reste.
  */
  const facetting = await listBrandFacets(brand.value, {
    filters: activeFilters,
    limit: sort.byPrice ? MAX_FILTERED : PAGE_SIZE,
    offset: sort.byPrice ? 0 : offset,
    order: sort.order === "-created_at" ? "-created_at" : "title",
  }).catch(() => null);

  let products: MedusaProduct[] = [];
  let count = 0;

  if (facetting && sort.byPrice) {
    // Le prix n'est pas triable en base : on classe l'index de la marque entière, puis on ne
    // charge en détail que les vingt-quatre produits de la page demandée.
    const index = await listPriceIndexByIds(facetting.product_ids);
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
    const byId = new Map(fetched.map((product) => [product.id, product]));
    products = ids
      .map((id) => byId.get(id))
      .filter((product): product is MedusaProduct => Boolean(product));
  } else if (facetting) {
    count = facetting.total;
    const ids = facetting.product_ids;
    const fetched = ids.length ? (await listProductsByIds(ids, PAGE_SIZE)).products : [];
    // listProductsByIds rend les produits dans l'ordre de la base : on rétablit celui du tri.
    const byId = new Map(fetched.map((product) => [product.id, product]));
    products = ids
      .map((id) => byId.get(id))
      .filter((product): product is MedusaProduct => Boolean(product));
  }

  // Marque et caractéristique principale : une seule requête pour toute la grille. Une panne
  // de cette route ne doit pas emporter la page, les cartes se contentent alors du titre.
  const attributes: Record<string, ProductAttributeBrief[]> = await listProductAttributesBulk(
    products.map((product) => product.id)
  ).catch(() => ({}));

  const basePath = `/marques/${encodeURIComponent(brand.value)}`;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (sort.value !== DEFAULT_SORT) params.set("tri", sort.value);
    for (const [slug, values] of Object.entries(activeFilters)) {
      if (values.length > 0) params.set(`f_${slug}`, values.join(","));
    }
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return `${basePath}${search ? `?${search}` : ""}#produits`;
  };

  /*
    La marque est retirée du panneau : elle est le sujet de la page, la proposer en filtre
    reviendrait à demander au client de cocher ce sur quoi il vient de cliquer. Les produits
    en portant parfois plusieurs, la facette n'est pas non plus à valeur unique — la masquer
    est donc un choix, pas une conséquence.
  */
  const facets = (facetting?.facets ?? []).filter((facet) => facet.type !== "Marque");
  const showFilters = facets.length > 0;

  return (
    <div>
      <div className="gv-container">
        <Breadcrumbs
          trail={[
            { label: "Accueil", href: "/" },
            { label: "Nos marques", href: "/marques" },
            { label: brand.value },
          ]}
        />
      </div>

      {/* Même sol ivoire que les rubriques : passer de l'une à l'autre ne change pas de décor. */}
      <section id="produits" className="scroll-mt-8 border-b border-gv-border bg-gv-soft">
        <div className="gv-container pb-12 pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-display text-[26px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[32px]">
                {brand.value}
              </h1>
              <p aria-live="polite" className="text-[13px] text-gv-text-soft">
                {count} produit{count > 1 ? "s" : ""}
              </p>
            </div>

            {count > 0 && <SortSelect value={sort.value} />}
          </div>

          <FilterTransition>
            <div
              className={
                showFilters
                  ? "grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-8"
                  : ""
              }
            >
              <FilterPanel
                facets={facets}
                filters={activeFilters}
                basePath={basePath}
                params={query}
              />

              <div className="min-w-0">
                <PendingGrid count={Math.max(products.length, 4)}>
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

                      <ProductPagination
                        current={currentPage}
                        total={totalPages}
                        hrefFor={hrefFor}
                      />
                    </>
                  ) : (
                    <EmptyState
                      icon={PackageSearch}
                      title={
                        count > 0
                          ? "Cette page ne contient aucun produit."
                          : filtering
                            ? "Aucun produit ne correspond à ces filtres."
                            : "Aucun produit pour cette marque pour le moment."
                      }
                      description={
                        count > 0
                          ? "Le numéro de page demandé dépasse la liste."
                          : filtering
                            ? "Élargissez la sélection en retirant un critère."
                            : "Explorez les autres marques du catalogue en attendant le réassort."
                      }
                      primary={{ label: "Voir toutes les marques", href: "/marques" }}
                    />
                  )}
                </PendingGrid>
              </div>
            </div>
          </FilterTransition>
        </div>
      </section>
    </div>
  );
}
