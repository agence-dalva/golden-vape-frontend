"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createCart,
  getCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  type MedusaCart,
} from "./medusa-cart";

const CART_COOKIE = "cart_id";

// Lit le panier courant (cookie cart_id), le recrée s'il est absent ou invalide (ex: expiré,
// supprimé côté serveur, ou déjà complété — un panier transformé en commande est verrouillé
// côté Medusa et ne doit plus jamais être réutilisé). Le cookie n'a pas besoin d'être httpOnly :
// il ne contient qu'un identifiant opaque, aucune donnée sensible.
export async function getOrCreateCart(): Promise<MedusaCart> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(CART_COOKIE)?.value;

  if (existingId) {
    const cart = await getCart(existingId);
    if (cart && !cart.completed_at) return cart;
  }

  const cart = await createCart();
  cookieStore.set(CART_COOKIE, cart.id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
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

export async function addToCartAction(variantId: string, quantity: number) {
  const cart = await getOrCreateCart();
  const updated = await addLineItem(cart.id, variantId, quantity);
  revalidatePath("/", "layout");
  return updated;
}

export async function updateCartLineAction(lineId: string, quantity: number) {
  const cart = await getCurrentCart();
  if (!cart) throw new Error("Aucun panier actif");
  const updated = await updateLineItem(cart.id, lineId, quantity);
  revalidatePath("/", "layout");
  return updated;
}

export async function removeCartLineAction(lineId: string) {
  const cart = await getCurrentCart();
  if (!cart) throw new Error("Aucun panier actif");
  await removeLineItem(cart.id, lineId);
  revalidatePath("/", "layout");
}

// À appeler une fois un panier complété (transformé en commande) : le panier est verrouillé
// côté Medusa, le cookie doit être retiré pour qu'un nouveau panier soit créé au prochain ajout.
export async function clearCartCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}
