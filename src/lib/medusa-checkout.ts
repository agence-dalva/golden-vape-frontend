import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";
import type { MedusaCart, MedusaAddress } from "./medusa-cart";

export type MedusaShippingOption = {
  id: string;
  name: string;
  price_type: string;
  calculated_price: { calculated_amount: number } | null;
  /**
   * Donnees deposees par le provider de fulfillment a la creation de l'option.
   * Pour Sendcloud : le code du service, et le drapeau qui dit si un point relais doit
   * etre choisi avant de pouvoir payer.
   */
  data?: {
    shipping_option_code?: string;
    carrier_code?: string;
    is_service_point_required?: boolean;
  } | null;
};

export type MedusaOrder = {
  id: string;
  display_id: number;
  email: string;
  currency_code: string;
  total: number;
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  shipping_address: MedusaAddress | null;
};

const CART_FIELDS =
  "id,currency_code,region_id,customer_id,email,total,item_total,shipping_total,*items,*items.total,*items.subtotal,*items.thumbnail,*items.variant.images.url,*items.product.images.url,*shipping_address,*billing_address,*shipping_methods,*shipping_methods.shipping_option,payment_collection.id,*payment_collection.payment_sessions";

const ORDER_FIELDS =
  "id,display_id,email,currency_code,total,*items,*items.total,*shipping_address";

async function checkoutFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medusa store API a répondu ${res.status} sur ${path}: ${body}`);
  }

  return res.json();
}

function withFields(path: string, fields: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}fields=${encodeURIComponent(fields)}`;
}

export async function updateCartAddresses(
  cartId: string,
  data: { email?: string; shipping_address: MedusaAddress; billing_address: MedusaAddress }
): Promise<MedusaCart> {
  const { cart } = await checkoutFetch<{ cart: MedusaCart }>(
    withFields(`/store/carts/${cartId}`, CART_FIELDS),
    { method: "POST", body: JSON.stringify(data) }
  );
  return cart;
}

export async function listShippingOptionsForCart(cartId: string): Promise<MedusaShippingOption[]> {
  const { shipping_options } = await checkoutFetch<{ shipping_options: MedusaShippingOption[] }>(
    `/store/shipping-options?cart_id=${cartId}&fields=id,name,price_type,*calculated_price,data`
  );

  // Une option a tarif calcule revient sans prix : la liste ne declenche pas le calcul,
  // qui passe par une route dediee, une option a la fois. C'est elle qui interroge le
  // transporteur — d'ou un appel par option, menes de front.
  const aCalculer = shipping_options.filter((o) => o.price_type === "calculated");

  if (aCalculer.length === 0) {
    return shipping_options;
  }

  const prix = await Promise.all(
    aCalculer.map(async (option) => {
      try {
        const { shipping_option } = await checkoutFetch<{
          shipping_option: { calculated_price?: { calculated_amount: number } | null };
        }>(`/store/shipping-options/${option.id}/calculate`, {
          method: "POST",
          body: JSON.stringify({ cart_id: cartId, data: {} }),
        });
        return { id: option.id, prix: shipping_option?.calculated_price ?? null };
      } catch {
        // Un service indisponible pour cette destination ou ce poids ne doit pas vider
        // toute la liste : l'option s'affichera sans prix, les autres restent utilisables.
        return { id: option.id, prix: null };
      }
    })
  );

  const parId = new Map(prix.map((p) => [p.id, p.prix]));

  return shipping_options.map((option) =>
    parId.has(option.id)
      ? { ...option, calculated_price: parId.get(option.id) ?? null }
      : option
  );
}

/**
 * Rattache une methode de livraison au panier.
 *
 * `data` transporte le choix du client jusqu'au provider : pour une livraison en point
 * relais, l'identifiant du point retenu, que Medusa valide avant d'accepter la methode.
 */
export async function addShippingMethod(
  cartId: string,
  optionId: string,
  data?: Record<string, unknown>
): Promise<MedusaCart> {
  const { cart } = await checkoutFetch<{ cart: MedusaCart }>(
    withFields(`/store/carts/${cartId}/shipping-methods`, CART_FIELDS),
    { method: "POST", body: JSON.stringify({ option_id: optionId, data }) }
  );
  return cart;
}

export const MONETICO_PROVIDER_ID = "pp_monetico_monetico";

// Formulaire scellé à poster vers Monetico, construit côté Medusa.
export type MoneticoPaymentForm = {
  actionUrl: string;
  fields: Record<string, string>;
};

/**
 * Ouvre une session Monetico sur le panier, en réutilisant sa collection de paiement.
 *
 * Medusa refuse d'en créer une seconde — `validateExistingPaymentCollectionStep` lève
 * « Cart … already has a payment collection ». Sans cette réutilisation, un paiement
 * abandonné ou refusé rendrait le panier définitivement impayable : le client ne pourrait
 * plus que le vider et tout ressaisir.
 *
 * Rejouer l'appel sur une collection existante remplace bien la session : la tentative
 * suivante repart sur une référence neuve.
 */
export async function createMoneticoPaymentSession(cartId: string): Promise<void> {
  const { cart } = await checkoutFetch<{ cart: MedusaCart }>(
    withFields(`/store/carts/${cartId}`, CART_FIELDS)
  );

  const collectionId =
    cart.payment_collection?.id ??
    (
      await checkoutFetch<{ payment_collection: { id: string } }>("/store/payment-collections", {
        method: "POST",
        body: JSON.stringify({ cart_id: cartId }),
      })
    ).payment_collection.id;

  await checkoutFetch(`/store/payment-collections/${collectionId}/payment-sessions`, {
    method: "POST",
    body: JSON.stringify({ provider_id: MONETICO_PROVIDER_ID }),
  });
}

// Le montant et la référence viennent de la session de paiement, jamais du navigateur.
export async function getMoneticoPaymentForm(cartId: string): Promise<MoneticoPaymentForm> {
  return checkoutFetch<MoneticoPaymentForm>("/store/monetico/payment-form", {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
  });
}

export type CompleteCartResult =
  | { type: "order"; order: MedusaOrder }
  | { type: "cart"; cart: MedusaCart; error: { message: string; name: string; type: string } };

export async function completeCart(cartId: string): Promise<CompleteCartResult> {
  return checkoutFetch<CompleteCartResult>(withFields(`/store/carts/${cartId}/complete`, ORDER_FIELDS), {
    method: "POST",
  });
}

export async function getOrder(orderId: string): Promise<MedusaOrder | null> {
  try {
    const { order } = await checkoutFetch<{ order: MedusaOrder }>(
      withFields(`/store/orders/${orderId}`, ORDER_FIELDS)
    );
    return order;
  } catch {
    return null;
  }
}
