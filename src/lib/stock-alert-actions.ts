"use server";

import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";

export type StockAlertResult =
  | { status: "enregistree" }
  | { status: "disponible" }
  | { status: "erreur"; message: string };

/**
 * « Prévenez-moi du retour en stock » : la demande part à Medusa, qui valide l'adresse et
 * n'enregistre qu'une demande par adresse et par déclinaison.
 */
export async function subscribeStockAlertAction(
  variantId: string,
  email: string,
  /** Champ piège, invisible pour un visiteur : seul un robot le remplit. */
  piege = ""
): Promise<StockAlertResult> {
  // Un robot reçoit la même réponse qu'un client, sans que rien ne soit enregistré : il n'a
  // aucun signal pour s'adapter.
  if (piege.trim()) return { status: "enregistree" };

  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/alertes-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      body: JSON.stringify({ email, variant_id: variantId }),
      cache: "no-store",
    });

    if (res.status === 400) {
      // Medusa répond 400 aussi bien pour une adresse invalide que pour un plafond atteint
      // (« Trop de demandes… ») : seul le type d'erreur les distingue.
      const corps = (await res.json().catch(() => ({}))) as { type?: string; message?: string };
      if (corps.type === "not_allowed" && corps.message) {
        return { status: "erreur", message: corps.message };
      }
      return { status: "erreur", message: "Cette adresse email ne semble pas valide." };
    }
    if (!res.ok) {
      return { status: "erreur", message: "La demande n'a pas pu être enregistrée. Réessayez dans un instant." };
    }

    const corps = (await res.json()) as { disponible?: boolean };
    return corps.disponible ? { status: "disponible" } : { status: "enregistree" };
  } catch {
    return { status: "erreur", message: "La demande n'a pas pu être enregistrée. Réessayez dans un instant." };
  }
}
