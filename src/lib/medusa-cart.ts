import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, DEFAULT_REGION_ID } from "./medusa";

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

export type MedusaCart = {
  id: string;
  currency_code: string;
  region_id: string;
  items: MedusaCartLineItem[];
  item_total: number;
  total: number;
};

// Champs demandés explicitement : par défaut, le store API ne renvoie PAS item.total/subtotal
// (juste unit_price/quantity bruts) — sans ce paramètre, le prix par ligne affiché est NaN.
// Idem pour les images : item.thumbnail est toujours vide sur ce catalogue, il faut remonter
// l'image de la variante puis celle du produit (même priorité que la fiche produit).
const CART_FIELDS =
  "id,currency_code,region_id,total,item_total,*items,*items.total,*items.subtotal,*items.thumbnail,*items.variant.images.url,*items.product.images.url"

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
    body: JSON.stringify({ region_id: DEFAULT_REGION_ID }),
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
