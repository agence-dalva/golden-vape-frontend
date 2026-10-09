import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";
import type { MedusaShippingOption } from "./medusa-checkout";

/**
 * Retrait en boutique : le client paie en ligne et vient chercher sa commande au comptoir.
 *
 * Rien ne part par transporteur. Medusa le sait par le type de l'ensemble d'expédition de
 * l'option (« pickup ») : au panier, la liste des options le porte directement ; une
 * commande, elle, n'a que l'identifiant de son option, comparé à la liste que rend
 * `/store/retrait-boutique`.
 */

export type LieuRetrait = {
  nom: string | null;
  address_1: string | null;
  address_2?: string | null;
  postal_code: string | null;
  city: string | null;
};

export function estRetrait(option: MedusaShippingOption | null | undefined): boolean {
  return option?.service_zone?.fulfillment_set?.type === "pickup";
}

/** La boutique où retirer, telle que l'option la décrit au panier. */
export function lieuDeOption(option: MedusaShippingOption): LieuRetrait {
  const emplacement = option.service_zone?.fulfillment_set?.location;
  return {
    nom: emplacement?.name ?? null,
    address_1: emplacement?.address?.address_1 ?? null,
    address_2: emplacement?.address?.address_2 ?? null,
    postal_code: emplacement?.address?.postal_code ?? null,
    city: emplacement?.address?.city ?? null,
  };
}

/** « 18 Av. de la République, 70200 Lure » */
export function adresseLieu(lieu: LieuRetrait): string {
  return [lieu.address_1, [lieu.postal_code, lieu.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

/**
 * Les options de retrait, par identifiant.
 *
 * Cinq minutes de cache : l'adresse de la boutique ne change pas d'une commande à l'autre.
 * En cas d'échec, une liste vide — la commande s'affiche alors comme une livraison, ce qui
 * reste lisible, plutôt que de faire tomber la page.
 */
export async function getOptionsRetrait(): Promise<Map<string, LieuRetrait>> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/retrait-boutique`, {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return new Map();

    const { options } = (await res.json()) as { options: { id: string; lieu: LieuRetrait }[] };
    return new Map(options.map((o) => [o.id, o.lieu]));
  } catch {
    return new Map();
  }
}

/** Le lieu de retrait d'une commande, ou null si elle est livrée. */
export function lieuDeCommande(
  methodes: { shipping_option_id?: string | null }[] | null | undefined,
  options: Map<string, LieuRetrait>
): LieuRetrait | null {
  for (const methode of methodes ?? []) {
    const lieu = methode.shipping_option_id ? options.get(methode.shipping_option_id) : undefined;
    if (lieu) return lieu;
  }
  return null;
}
