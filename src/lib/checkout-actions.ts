"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCart, clearCartCookie } from "./cart-actions";
import {
  updateCartAddresses,
  addShippingMethod,
  createPaymentCollectionAndSession,
  completeCart,
  type CompleteCartResult,
} from "./medusa-checkout";
import type { MedusaAddress } from "./medusa-cart";

export async function setAddressesAction(
  email: string,
  shippingAddress: MedusaAddress,
  billingAddress: MedusaAddress
): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await updateCartAddresses(cart.id, {
      email,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
    });
    revalidatePath("/checkout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'enregistrement de l'adresse" };
  }
}

export async function setShippingMethodAction(optionId: string): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await addShippingMethod(cart.id, optionId);
    revalidatePath("/checkout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de la sélection du transporteur" };
  }
}

export async function completeCheckoutAction(): Promise<
  { error: string } | { orderId: string }
> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await createPaymentCollectionAndSession(cart.id);
    const result: CompleteCartResult = await completeCart(cart.id);

    if (result.type === "order") {
      // Le panier est désormais verrouillé côté Medusa (completed_at) — on retire le cookie
      // immédiatement pour qu'un nouveau panier soit créé au prochain ajout, plutôt que
      // d'attendre que getCurrentCart() le détecte a posteriori.
      await clearCartCookie();
      revalidatePath("/", "layout");
      return { orderId: result.order.id };
    }
    return { error: result.error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de la validation de la commande" };
  }
}
