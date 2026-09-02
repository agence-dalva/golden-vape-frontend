import type { MedusaBrand } from "./medusa";

// Tri français : insensible à la casse et aux accents, « Élikuid » se range donc avec les E.
const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

/** Écarte les doublons — la valeur fait office d'identifiant — puis trie. */
export function sortBrands(brands: MedusaBrand[]): MedusaBrand[] {
  const unique = Array.from(new Map(brands.map((brand) => [brand.value, brand])).values());
  return unique.sort((a, b) => collator.compare(a.value, b.value));
}

/** Lettre de regroupement : les noms commençant par un chiffre vont dans « 0-9 ». */
export function brandGroupKey(name: string): string {
  const first = name.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "0-9";
}
