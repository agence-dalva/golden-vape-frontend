/**
 * Squelette de la grille produit. Reprend les proportions exactes des cartes — image de
 * 186 pixels, deux lignes de titre, prix, bouton — pour que l'arrivée des produits ne décale
 * rien. Partagé par le chargement de la route et l'attente d'un changement de filtre.
 */
export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      aria-hidden
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="overflow-hidden rounded-xl border border-gv-border bg-gv-card">
          <div className="h-[186px] w-full animate-pulse bg-gv-image" />
          <div className="px-4 pb-4 pt-3.5">
            <div className="h-4 w-full animate-pulse rounded bg-gv-100" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gv-100" />
            <div className="mt-3.5 h-5 w-24 animate-pulse rounded bg-gv-100" />
            <div className="mt-3.5 h-[42px] w-full animate-pulse rounded-[7px] bg-gv-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}
