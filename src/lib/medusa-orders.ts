import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";
import type { MedusaAddress } from "./medusa-cart";

/**
 * Statuts tels que Medusa les agrège à la lecture d'une commande.
 *
 * `status` est celui de la commande elle-même — elle n'est « annulée » que si le marchand
 * l'annule. `fulfillment_status` résume ses expéditions : une expédition annulée ramène
 * la commande à « à expédier », elle ne l'annule pas. Les deux se lisent ensemble.
 */
export type MedusaOrderStatus = "pending" | "completed" | "draft" | "archived" | "canceled" | "requires_action";
export type MedusaFulfillmentStatus =
  | "not_fulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "partially_shipped"
  | "shipped"
  | "partially_delivered"
  | "delivered"
  | "canceled";
export type MedusaPaymentStatus =
  | "not_paid"
  | "awaiting"
  | "authorized"
  | "partially_authorized"
  | "captured"
  | "partially_captured"
  | "partially_refunded"
  | "refunded"
  | "canceled"
  | "requires_action";

export type MedusaOrderSummary = {
  id: string;
  display_id: number;
  status: MedusaOrderStatus;
  fulfillment_status: MedusaFulfillmentStatus;
  payment_status: MedusaPaymentStatus;
  total: number;
  currency_code: string;
  created_at: string;
  items: { id: string; quantity: number }[];
};

export type MedusaOrderLineItem = {
  id: string;
  title: string;
  variant_title: string | null;
  product_handle: string | null;
  quantity: number;
  /** Hors taxes — c'est l'unité de Medusa. Le TTC de la ligne est `total`. */
  unit_price: number;
  total: number;
  thumbnail: string | null;
  variant: {
    images: { url: string }[];
    product: { images: { url: string }[] } | null;
  } | null;
};

export type MedusaFulfillmentLabel = {
  tracking_number: string;
  tracking_url: string;
};

export type MedusaFulfillment = {
  id: string;
  created_at: string;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  labels: MedusaFulfillmentLabel[];
};

export type MedusaOrderShippingMethod = {
  id: string;
  name: string;
  total: number;
  /** Ce que le tunnel a posé au choix du mode : point relais, transporteur. */
  data: {
    service_point_name?: string;
    service_point_carrier?: string;
    carrier_code?: string;
  } | null;
};

export type MedusaOrderDetail = Omit<MedusaOrderSummary, "items"> & {
  customer_id: string | null;
  email: string;
  item_total: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  items: MedusaOrderLineItem[];
  shipping_address: MedusaAddress | null;
  shipping_methods: MedusaOrderShippingMethod[];
  fulfillments: MedusaFulfillment[];
};

// Les lignes se demandent entières (`*items`), jamais champ par champ : Medusa recalcule
// les totaux à partir d'elles, et une ligne partielle — sans ses taxes — fait retomber
// `total` au seul port et `quantity` à rien. Mesuré sur la commande n°10 : 3,60 € au lieu
// de 17,76 €.
const ORDER_LIST_FIELDS =
  "id,display_id,status,fulfillment_status,payment_status,total,currency_code,created_at,*items";

// Les vignettes viennent des images de la variante, puis du produit : `thumbnail` n'est
// jamais renseigné sur ce catalogue, comme au panier.
const ORDER_DETAIL_FIELDS =
  "id,display_id,status,fulfillment_status,payment_status,customer_id,email,created_at,currency_code," +
  "total,item_total,shipping_total,tax_total,discount_total," +
  "*items,*items.tax_lines,*items.adjustments,items.variant.images.url,items.variant.product.images.url," +
  "*shipping_address,*shipping_methods,*shipping_methods.tax_lines,*shipping_methods.adjustments," +
  "*fulfillments,*fulfillments.labels";

function headers(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
  };
}

// `/store/orders` filtre côté Medusa sur le client authentifié par le jeton : impossible
// de lire les commandes d'un autre compte en jouant sur les paramètres.
export async function listCustomerOrders(token: string): Promise<MedusaOrderSummary[]> {
  const params = new URLSearchParams({
    fields: ORDER_LIST_FIELDS,
    order: "-created_at",
    limit: "20",
  });

  const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders?${params}`, {
    headers: headers(token),
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const { orders } = (await res.json()) as { orders: MedusaOrderSummary[] };
  return orders;
}

/**
 * Une commande du client connecté, avec tout ce que la page de suivi affiche.
 *
 * `/store/orders/:id` ne vérifie pas à qui appartient la commande — c'est ce qui permet à
 * la page de confirmation de l'afficher sans session. Ici on exige que le client en soit
 * le propriétaire : une commande d'un autre compte, ou passée en invité, est « introuvable ».
 */
export async function getCustomerOrder(
  token: string,
  customerId: string,
  orderId: string
): Promise<MedusaOrderDetail | null> {
  const params = new URLSearchParams({ fields: ORDER_DETAIL_FIELDS });

  const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${encodeURIComponent(orderId)}?${params}`, {
    headers: headers(token),
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const { order } = (await res.json()) as { order: MedusaOrderDetail };
  return order.customer_id === customerId ? order : null;
}

/** Image d'une ligne : celle de la variante, sinon du produit, sinon la vignette. */
export function getOrderItemImage(item: MedusaOrderLineItem): string | null {
  return item.variant?.images[0]?.url ?? item.variant?.product?.images[0]?.url ?? item.thumbnail ?? null;
}
