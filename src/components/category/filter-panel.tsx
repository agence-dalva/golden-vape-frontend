"use client";

import Link from "next/link";
import { Check, SlidersHorizontal, X } from "lucide-react";
import type { CatalogFacet } from "@/lib/medusa";
import {
  clearFiltersHref,
  countActive,
  filterSlug,
  toggleFilterHref,
  type ActiveFilters,
} from "@/lib/catalog-filters";
import { shouldIntercept, useFilterTransition } from "./filter-transition";

/**
 * Panneau de filtres d'une catégorie.
 *
 * Chaque valeur est un lien, pas une case à cocher pilotée par du JavaScript : l'état vit dans
 * l'adresse, la page reste rendue par le serveur, et le bouton « précédent » du navigateur
 * défait un filtre. Les listes longues — une vingtaine de marques — défilent dans leur cadre
 * plutôt que d'allonger la colonne indéfiniment.
 */
export default function FilterPanel({
  facets,
  filters,
  basePath,
  params,
}: {
  facets: CatalogFacet[];
  filters: ActiveFilters;
  basePath: string;
  params: Record<string, string | string[] | undefined>;
}) {
  // Avant tout retour anticipé : un hook doit être appelé dans le même ordre à chaque rendu.
  const { naviguer } = useFilterTransition();

  if (facets.length === 0) {
    return null;
  }

  const active = countActive(filters);

  const groupes = facets.map((facet) => {
    const slug = filterSlug(facet.type);
    const retenues = filters[slug] ?? [];

    return (
      <div key={facet.type} className="border-t border-gv-border pt-4 first:border-t-0 first:pt-0">
        <p className="mb-2.5 text-[13px] font-semibold text-gv-text">{facet.type}</p>

        {/* Les valeurs cochées passent devant : le serveur classe par effectif décroissant, une
            sélection tombée à zéro se retrouverait sinon au fond d'une liste défilante. Le tri
            étant stable, l'ordre du serveur est conservé à l'intérieur de chaque groupe. */}
        <ul className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {[...facet.values]
            .sort(
              (a, b) =>
                Number(retenues.includes(b.value)) - Number(retenues.includes(a.value))
            )
            .map(({ value, count }) => {
            const choisie = retenues.includes(value);

            return (
              <li key={value}>
                <Link
                  href={toggleFilterHref(basePath, params, slug, value)}
                  scroll={false}
                  onClick={(event) => {
                    if (!shouldIntercept(event)) return;
                    event.preventDefault();
                    naviguer(toggleFilterHref(basePath, params, slug, value));
                  }}
                  aria-pressed={choisie}
                  className={`flex min-h-9 items-center gap-2.5 rounded-[7px] px-2 py-1 text-[13px] transition-colors ${
                    choisie ? "bg-gv-800/[0.07] text-gv-text" : "text-gv-text-soft hover:bg-gv-card"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border ${
                      choisie ? "border-gv-800 bg-gv-800 text-white" : "border-gv-border-strong bg-white"
                    }`}
                  >
                    {choisie && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{value}</span>
                  <span className="shrink-0 text-[12px] text-gv-text-muted">{count}</span>
                </Link>
                </li>
              );
            })}
        </ul>
      </div>
    );
  });

  const contenu = (
    <div className="flex flex-col gap-4 rounded-xl bg-gv-card p-4 shadow-gv-raised">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-gv-text">
          <SlidersHorizontal size={16} aria-hidden className="text-gv-800" />
          Filtrer
        </p>
        {active > 0 && (
          <Link
            href={clearFiltersHref(basePath, params)}
            scroll={false}
            onClick={(event) => {
              if (!shouldIntercept(event)) return;
              event.preventDefault();
              naviguer(clearFiltersHref(basePath, params));
            }}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-gv-text-soft transition-colors hover:text-gv-800"
          >
            <X size={13} aria-hidden />
            Tout effacer
          </Link>
        )}
      </div>
      {groupes}
    </div>
  );

  return (
    <>
      {/* Sous `lg`, le panneau se replie : déplié, il repousserait la grille sous la ligne de
          flottaison sur tous les téléphones. */}
      <details className="lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl bg-gv-card px-4 text-sm font-semibold text-gv-text shadow-gv-raised">
          <SlidersHorizontal size={16} aria-hidden className="text-gv-800" />
          Filtrer
          {active > 0 && (
            <span className="ml-auto rounded-full bg-gv-800 px-2 py-0.5 text-[11px] font-bold text-white">
              {active}
            </span>
          )}
        </summary>
        <div className="mt-3">{contenu}</div>
      </details>

      {/* Collé en haut : la grille fait plusieurs écrans de haut, le panneau doit rester à
          portée sans remonter. La grille parente aligne ses éléments en haut, sans quoi la
          colonne s'étirerait sur toute la hauteur et `sticky` n'aurait rien à quoi s'accrocher. */}
      <div className="hidden lg:sticky lg:top-6 lg:block">{contenu}</div>
    </>
  );
}
