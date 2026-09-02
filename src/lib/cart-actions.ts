"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createCart,
  getCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  applyPromoCode,
  removePromoCode,
  type MedusaCart,
} from "./medusa-cart";

const CART_COOKIE = "cart_id";

// Aucun code client ne lit ce cookie : le mettre hors de portée du JavaScript ferme la porte
// au vol d'identifiant par injection de script. Chez Medusa, qui détient l'identifiant d'un
// panier peut le lire et le modifier — l'opacité de la valeur ne suffit pas à s'en passer.
const CART_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

// Lit le panier courant (cookie cart_id), le recrée s'il est absent ou invalide (ex: expiré,
// supprimé côté serveur, ou déjà complété — un panier transformé en commande est verrouillé
// côté Medusa et ne doit plus jamais être réutilisé). Voir CART_COOKIE_OPTIONS
// pour les protections posées sur le cookie.
export async function getOrCreateCart(): Promise<MedusaCart> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(CART_COOKIE)?.value;

  if (existingId) {
    const cart = await getCart(existingId);
    if (cart && !cart.completed_at) return cart;
  }

  const cart = await createCart();
  cookieStore.set(CART_COOKIE, cart.id, CART_COOKIE_OPTIONS);
  return cart;
}

// Version lecture seule : ne crée jamais de panier (utile pour l'icône header / vérifier si
// une variante est déjà présente sans provoquer d'écriture de cookie hors Server Action).
// Un panier déjà complété est traité comme absent — sinon le header afficherait le contenu
// d'une commande déjà passée.
export async function getCurrentCart(): Promise<MedusaCart | null> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(CART_COOKIE)?.value;
  if (!existingId) return null;
  const cart = await getCart(existingId);
  return cart && !cart.completed_at ? cart : null;
}

// Identifiant brut du cookie, y compris si le panier vient d'être complété : le retour de
// paiement en a besoin pour retrouver la commande créée par la notification de Monetico.
export async function getCartIdCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

export async function addToCartAction(
  variantId: string,
  quantity: number
): Promise<{ error?: string }> {
  const cart = await getOrCreateCart();

  try {
    await addLineItem(cart.id, variantId, quantity);
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Impossible d'ajouter ce produit" };
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number
): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await updateLineItem(cart.id, lineId, quantity);
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    // Le stock fait autorité côté Medusa : le storefront ne le connaît pas sur une ligne
    // de panier et ne peut donc pas plafonner la quantité avant l'appel.
    return { error: e instanceof Error ? e.message : "Impossible de modifier la quantité" };
  }
}

export async function removeCartLineAction(lineId: string): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await removeLineItem(cart.id, lineId);
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Impossible de retirer cet article" };
  }
}

export async function applyPromoCodeAction(code: string): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  const trimmed = code.trim();
  if (!trimmed) return { error: "Saisissez un code" };

  try {
    const updated = await applyPromoCode(cart.id, trimmed);
    // Medusa n'échoue pas sur un code inconnu : il rend le panier inchangé. C'est donc
    // l'absence de la promotion dans la réponse qui signale le refus.
    const applied = updated.promotions?.some(
      (promotion) => promotion.code?.toLowerCase() === trimmed.toLowerCase()
    );

    if (!applied) return { error: "Ce code n'est pas valide ou ne s'applique pas à ce panier" };

    revalidatePath("/", "layout");
    return {};
  } catch {
    return { error: "Impossible d'appliquer ce code" };
  }
}

export async function removePromoCodeAction(code: string): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await removePromoCode(cart.id, code);
    revalidatePath("/", "layout");
    return {};
  } catch {
    return { error: "Impossible de retirer ce code" };
  }
}

// À appeler une fois un panier complété (transformé en commande) : le panier est verrouillé
// côté Medusa, le cookie doit être retiré pour qu'un nouveau panier soit créé au prochain ajout.
export async function clearCartCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}
