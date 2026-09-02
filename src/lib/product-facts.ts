import type { ProductAttributeBrief } from "@/lib/medusa";

const BRAND_TYPE = "Marque";

/**
 * Types retenus pour la ligne de caractéristique d'une carte, par ordre de pertinence
 * commerciale. Un type absent de cette liste — ou absent du produit — n'apparaît pas :
 * la carte ne montre que ce qui existe réellement.
 */
const FEATURE_TYPES = [
  "Contenance",
  "Dosage PG/VG",
  "PG/VG",
  "Taux de nicotine",
  "Saveur",
  "Alimentation",
  "Autonomie",
  "Résistance",
  "Compatibilité",
  "Origine",
];

const MAX_FEATURES = 2;
const MAX_VALUES_PER_TYPE = 2;

export type ProductFacts = { brand: string | null; feature: string | null };

export function extractProductFacts(attributes: ProductAttributeBrief[] | undefined): ProductFacts {
  if (!attributes?.length) return { brand: null, feature: null };

  const byType = new Map<string, string[]>();
  for (const { type, value } of attributes) {
    const values = byType.get(type) ?? [];
    if (!values.includes(value)) values.push(value);
    byType.set(type, values);
  }

  const parts: string[] = [];
  for (const type of FEATURE_TYPES) {
    const values = byType.get(type);
    if (!values?.length) continue;
    parts.push(values.slice(0, MAX_VALUES_PER_TYPE).join(" / "));
    if (parts.length === MAX_FEATURES) break;
  }

  return {
    brand: byType.get(BRAND_TYPE)?.[0] ?? null,
    feature: parts.length ? parts.join(" · ") : null,
  };
}
