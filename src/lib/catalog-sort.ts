/**
 * Tris proposés sur les pages de catégorie.
 *
 * `order` porte la valeur envoyée à Medusa ; `byPrice` marque les tris que l'API ne sait pas
 * faire — le prix est calculé après la requête, `order=variants.calculated_price` renvoie une
 * erreur. Ceux-là sont classés à partir d'un index de prix construit côté serveur.
 */
export const SORT_OPTIONS = [
  { value: "pertinence", label: "Pertinence", order: undefined, byPrice: null },
  { value: "nouveautes", label: "Nouveautés", order: "-created_at", byPrice: null },
  { value: "prix-croissant", label: "Prix croissant", order: undefined, byPrice: "asc" },
  { value: "prix-decroissant", label: "Prix décroissant", order: undefined, byPrice: "desc" },
  { value: "nom", label: "Nom A–Z", order: "title", byPrice: null },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]["value"]

export const DEFAULT_SORT: SortValue = "pertinence"

/** Liste blanche : un paramètre inconnu retombe sur le tri par défaut au lieu de casser la page. */
export function resolveSort(value: string | undefined) {
  return SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0]
}
