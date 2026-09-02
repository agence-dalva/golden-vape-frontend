import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";

export type MedusaOrderSummary = {
  id: string;
  display_id: number;
  status: string;
  total: number;
  currency_code: string;
  created_at: string;
};

const ORDER_LIST_FIELDS = "id,display_id,status,total,currency_code,created_at";

// `/store/orders` filtre côté Medusa sur le client authentifié par le jeton : impossible
// de lire les commandes d'un autre compte en jouant sur les paramètres.
export async function listCustomerOrders(token: string): Promise<MedusaOrderSummary[]> {
  const params = new URLSearchParams({
    fields: ORDER_LIST_FIELDS,
    order: "-created_at",
    limit: "20",
  });

  const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders?${params}`, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const { orders } = (await res.json()) as { orders: MedusaOrderSummary[] };
  return orders;
}
