"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCart, getCartIdCookie, clearCartCookie } from "./cart-actions";
import {
  updateCartAddresses,
  addShippingMethod,
  createMoneticoPaymentSession,
  getMoneticoPaymentForm,
  completeCart,
  type MoneticoPaymentForm,
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

/**
 * Rattache un transporteur au panier.
 *
 * `data` porte le choix du client jusqu'au provider. Pour une livraison en point relais,
 * Medusa refuse la methode tant qu'aucun point n'y figure : c'est voulu, un colis sans
 * destination ne s'affranchit pas — et mieux vaut le refus ici qu'apres le debit.
 */
export async function setShippingMethodAction(
  optionId: string,
  data?: Record<string, unknown>
): Promise<{ error?: string }> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await addShippingMethod(cart.id, optionId, data);
    revalidatePath("/checkout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de la sélection du transporteur" };
  }
}

// Ouvre une session Monetico et renvoie le formulaire scellé que le navigateur doit poster
// vers la page de paiement. La commande n'est créée qu'au retour de Monetico.
export async function startMoneticoPaymentAction(): Promise<
  { error: string } | { form: MoneticoPaymentForm }
> {
  const cart = await getCurrentCart();
  if (!cart) return { error: "Aucun panier actif" };

  try {
    await createMoneticoPaymentSession(cart.id);
    return { form: await getMoneticoPaymentForm(cart.id) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'ouverture du paiement" };
  }
}

// Appelé à l'arrivée sur la page de retour. Monetico notifie Medusa de serveur à serveur
// avant de renvoyer le navigateur, et cette notification finalise déjà le panier : l'appel
// ci-dessous est idempotent et rend la commande existante. On laisse quelques essais au cas
// où le navigateur reviendrait le premier.
export async function finalizeMoneticoPaymentAction(): Promise<
  { error: string } | { orderId: string }
> {
  const cartId = await getCartIdCookie();
  if (!cartId) return { error: "Aucun panier actif" };

  let lastError = "Le paiement n'a pas encore été confirmé par Monetico";

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    try {
      const result: CompleteCartResult = await completeCart(cartId);

      if (result.type === "order") {
        await clearCartCookie();
        revalidatePath("/", "layout");
        return { orderId: result.order.id };
      }

      lastError = result.error.message;
    } catch (e) {
      lastError = e instanceof Error ? e.message : lastError;
    }
  }

  return { error: lastError };
}
