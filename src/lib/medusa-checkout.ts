import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";
import type { MedusaCart, MedusaAddress } from "./medusa-cart";

export type MedusaShippingOption = {
  id: string;
  name: string;
  price_type: string;
  calculated_price: { calculated_amount: number } | null;
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
  "id,currency_code,region_id,customer_id,email,total,item_total,shipping_total,*items,*items.total,*items.subtotal,*items.thumbnail,*items.variant.images.url,*items.product.images.url,*shipping_address,*billing_address,*shipping_methods,*shipping_methods.shipping_option,*payment_collection.payment_sessions";

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
    `/store/shipping-options?cart_id=${cartId}&fields=id,name,price_type,*calculated_price`
  );
  return shipping_options;
}

export async function addShippingMethod(cartId: string, optionId: string): Promise<MedusaCart> {
  const { cart } = await checkoutFetch<{ cart: MedusaCart }>(
    withFields(`/store/carts/${cartId}/shipping-methods`, CART_FIELDS),
    { method: "POST", body: JSON.stringify({ option_id: optionId }) }
  );
  return cart;
}

export const MONETICO_PROVIDER_ID = "pp_monetico_monetico";

// Formulaire scellé à poster vers Monetico, construit côté Medusa.
export type MoneticoPaymentForm = {
  actionUrl: string;
  fields: Record<string, string>;
};

// Crée la payment collection puis ouvre une session Monetico. Rejouer cet appel remplace la
// session existante : une nouvelle tentative de paiement repart donc sur une référence neuve.
export async function createMoneticoPaymentSession(cartId: string): Promise<void> {
  const { payment_collection } = await checkoutFetch<{ payment_collection: { id: string } }>(
    "/store/payment-collections",
    { method: "POST", body: JSON.stringify({ cart_id: cartId }) }
  );
  await checkoutFetch(`/store/payment-collections/${payment_collection.id}/payment-sessions`, {
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
