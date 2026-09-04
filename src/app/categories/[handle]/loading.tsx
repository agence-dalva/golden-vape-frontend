import ProductGridSkeleton from "@/components/category/product-grid-skeleton";

/**
 * Le squelette reprend les proportions exactes de la page rendue — image de 186px, deux
 * lignes de titre, prix, bouton — pour que l'arrivée des produits ne décale rien.
 */
const SKELETON_CARDS = 8;

export default function CategoryLoading() {
  return (
    <div className="gv-container pb-20" aria-hidden>
      <div className="py-[18px]">
        <div className="h-[18px] w-52 animate-pulse rounded bg-gv-100" />
      </div>

      <div className="grid grid-cols-1 items-center gap-6 border-b border-gv-border pb-7 pt-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:gap-10">
        <div>
          <div className="h-3.5 w-28 animate-pulse rounded bg-gv-100" />
          <div className="mt-3 h-9 w-72 max-w-full animate-pulse rounded bg-gv-100" />
          <div className="mt-4 h-4 w-full max-w-[520px] animate-pulse rounded bg-gv-100" />
          <div className="mt-2 h-4 w-2/3 max-w-[380px] animate-pulse rounded bg-gv-100" />
        </div>
        <div className="hidden justify-self-end sm:block">
          <div className="h-[150px] w-[240px] animate-pulse rounded-[14px] bg-gv-soft lg:h-[170px] lg:w-[300px]" />
        </div>
      </div>

      <div className="pt-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="h-8 w-64 animate-pulse rounded bg-gv-100" />
          <div className="h-11 w-48 animate-pulse rounded-[8px] bg-gv-100" />
        </div>

        <ProductGridSkeleton count={SKELETON_CARDS} />
      </div>
    </div>
  );
}
