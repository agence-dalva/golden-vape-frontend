/**
 * Filtres de catalogue portés par l'adresse : `?f_marque=Pulp&f_contenance=10ml,50ml`.
 *
 * L'état vit dans l'URL et nulle part ailleurs. La page reste donc rendue par le serveur, une
 * sélection se partage et se met en favori, et le bouton « précédent » du navigateur défait un
 * filtre — ce qu'un état client aurait fallu réimplémenter.
 */

/** Préfixe des paramètres de filtre, pour ne pas heurter `tri` ni `page`. */
const PREFIX = "f_";

export type ActiveFilters = Record<string, string[]>;

/** « Dosage PG/VG » → « dosage-pg-vg ». Doit rester aligné sur `slugifyType` du backend. */
export function filterSlug(type: string): string {
  return type
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type RawParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Filtres actifs lus dans l'adresse, indexés par repère — la forme qu'attend la route. */
export function readFilters(params: RawParams): ActiveFilters {
  const filters: ActiveFilters = {};

  for (const [key, raw] of Object.entries(params)) {
    if (!key.startsWith(PREFIX)) continue;

    const values = firstValue(raw)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length > 0) {
      filters[key.slice(PREFIX.length)] = values;
    }
  }
  return filters;
}

export function countActive(filters: ActiveFilters): number {
  return Object.values(filters).reduce((total, values) => total + values.length, 0);
}

/**
 * Adresse obtenue en ajoutant ou retirant une valeur. La pagination est remise à la première
 * page : rester en page trois après avoir resserré la sélection afficherait le plus souvent
 * une page vide.
 */
export function toggleFilterHref(
  basePath: string,
  params: RawParams,
  slug: string,
  value: string
): string {
  const search = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (key === "page" || key.startsWith(PREFIX)) continue;
    const single = firstValue(raw);
    if (single) search.set(key, single);
  }

  const filters = readFilters(params);
  const current = filters[slug] ?? [];
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];

  const updated = { ...filters, [slug]: next };
  for (const [key, values] of Object.entries(updated)) {
    if (values.length > 0) {
      search.set(`${PREFIX}${key}`, values.join(","));
    }
  }

  const query = search.toString();
  return `${basePath}${query ? `?${query}` : ""}#produits`;
}

/** Adresse sans aucun filtre, les autres paramètres conservés. */
export function clearFiltersHref(basePath: string, params: RawParams): string {
  const search = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (key === "page" || key.startsWith(PREFIX)) continue;
    const single = firstValue(raw);
    if (single) search.set(key, single);
  }

  const query = search.toString();
  return `${basePath}${query ? `?${query}` : ""}#produits`;
}
