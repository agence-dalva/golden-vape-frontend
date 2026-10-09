import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";

export type ImageBanniere = { id: string; url: string; largeur: number; hauteur: number };

/**
 * Images de la bannière d'accueil, réglées dans l'administration (« Bannière d'accueil »).
 *
 * Une minute de cache : un changement fait dans l'administration se voit sur le site dans la
 * minute. Liste vide en cas d'échec — l'accueil retombe sur son visuel par défaut plutôt que
 * d'afficher une bannière nue.
 */
export async function getImagesBanniere(): Promise<ImageBanniere[]> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/banniere`, {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { images } = (await res.json()) as { images: ImageBanniere[] };
    return images;
  } catch {
    return [];
  }
}
