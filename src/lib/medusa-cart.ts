import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, getDefaultRegionId } from "./medusa";

export type MedusaCartLineItem = {
  id: string;
  variant_id: string;
  product_id: string;
  product_title: string;
  variant_title: string | null;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant: { images: { url: string }[] } | null;
  product: { images: { url: string }[] } | null;
};

// Image à afficher pour une ligne de panier : celle de la variante en priorité (comme sur la
// fiche produit), sinon la première image du produit, sinon le thumbnail (jamais peuplé
// aujourd'hui sur ce catalogue, mais gardé en dernier repli si un jour renseigné).
export function getLineItemImage(item: MedusaCartLineItem): string | null {
  return item.variant?.images[0]?.url ?? item.product?.images[0]?.url ?? item.thumbnail ?? null;
}

export type MedusaAddress = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  company?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  country_code?: string | null;
  province?: string | null;
  postal_code?: string | null;
};

export type MedusaShippingMethod = {
  id: string;
  name: string;
  amount: number;
  shipping_option_id: string;
};

export type MedusaPaymentSession = {
  id: string;
  provider_id: string;
  status: string;
};

export type MedusaPaymentCollection = {
  id: string;
  amount: number;
  payment_sessions: MedusaPaymentSession[] | null;
};

export type MedusaCart = {
  id: string;
  currency_code: string;
  region_id: string;
  customer_id: string | null;
  email: string | null;
  completed_at: string | null;
  items: MedusaCartLineItem[];
  item_total: number;
  shipping_total: number;
  total: number;
  shipping_address: MedusaAddress | null;
  billing_address: MedusaAddress | null;
  shipping_methods: MedusaShippingMethod[];
  payment_collection: MedusaPaymentCollection | null;
};

// Champs demandés explicitement : par défaut, le store API ne renvoie PAS item.total/subtotal
// (juste unit_price/quantity bruts) — sans ce paramètre, le prix par ligne affiché est NaN.
// Idem pour les images : item.thumbnail est toujours vide sur ce catalogue, il faut remonter
// l'image de la variante puis celle du produit (même priorité que la fiche produit).
// Champs checkout (adresses, shipping_methods, payment_collection) inclus systématiquement :
// le panier est relu à chaque étape du checkout, plus simple qu'un second jeu de champs dédié.
const CART_FIELDS =
  "id,currency_code,region_id,customer_id,email,completed_at,total,item_total,shipping_total,*items,*items.total,*items.subtotal,*items.thumbnail,*items.variant.images.url,*items.product.images.url,*shipping_address,*billing_address,*shipping_methods,*shipping_methods.shipping_option,*payment_collection.payment_sessions"

async function cartFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new Error(`Medusa store API a répondu ${res.status} sur ${path}`);
  }

  return res.json();
}

function withFields(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}fields=${encodeURIComponent(CART_FIELDS)}`;
}

export async function createCart(): Promise<MedusaCart> {
  const { cart } = await cartFetch<{ cart: MedusaCart }>(withFields("/store/carts"), {
    method: "POST",
    body: JSON.stringify({ region_id: await getDefaultRegionId() }),
  });
  return cart;
}

export async function getCart(cartId: string): Promise<MedusaCart | null> {
  try {
    const { cart } = await cartFetch<{ cart: MedusaCart }>(withFields(`/store/carts/${cartId}`));
    return cart;
  } catch {
    return null;
  }
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<MedusaCart> {
  const { cart } = await cartFetch<{ cart: MedusaCart }>(
    withFields(`/store/carts/${cartId}/line-items`),
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    }
  );
  return cart;
}

export async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<MedusaCart> {
  const { cart } = await cartFetch<{ cart: MedusaCart }>(
    withFields(`/store/carts/${cartId}/line-items/${lineId}`),
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }
  );
  return cart;
}

export async function removeLineItem(cartId: string, lineId: string): Promise<void> {
  await cartFetch(`/store/carts/${cartId}/line-items/${lineId}`, { method: "DELETE" });
}
