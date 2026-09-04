import { notFound } from "next/navigation";
import ProductCard from "@/components/product-card";
import ProductPagination from "@/components/category/product-pagination";
import { listBrands, listProductsByBrand } from "@/lib/medusa";

const PAGE_SIZE = 24;

type SearchParams = Promise<{ page?: string }>;

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

  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  // La page ne demandait aucune pagination : elle retombait donc sur la limite par défaut et
  // n'affichait que les vingt-quatre premiers produits d'une marque, sans que rien ne signale
  // les suivants. `count` porte le total réellement disponible en boutique — les produits
  // rattachés à la marque mais non publiés n'y figurent pas.
  const { products, count } = await listProductsByBrand(
    brand.value,
    brand.attribute_type_id,
    PAGE_SIZE,
    (currentPage - 1) * PAGE_SIZE
  );

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hrefFor = (page: number) =>
    `/marques/${encodeURIComponent(brand.value)}${page > 1 ? `?page=${page}` : ""}#produits`;

  return (
    <div className="gv-container py-10">
      <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate">
          {brand.value}
        </h1>
        {count > 0 && (
          <p aria-live="polite" className="text-[13px] text-gv-text-soft">
            {count} produit{count > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <>
          <div
            id="produits"
            className="grid scroll-mt-8 grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index === 0} />
            ))}
          </div>

          <ProductPagination current={currentPage} total={totalPages} hrefFor={hrefFor} />
        </>
      ) : (
        <p className="text-sm text-brand-chocolate/60">
          {count > 0
            ? "Le numéro de page demandé dépasse la liste."
            : "Aucun produit pour cette marque."}
        </p>
      )}
    </div>
  );
}
