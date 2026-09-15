import type {
  MedusaFulfillment,
  MedusaOrderDetail,
  MedusaOrderSummary,
  MedusaPaymentStatus,
} from "./medusa-orders";

/** Les quatre jalons que le client suit, dans l'ordre. */
export const ORDER_STAGES = ["ordered", "prepared", "shipped", "delivered"] as const;
export type OrderStage = (typeof ORDER_STAGES)[number];

export const STAGE_LABELS: Record<OrderStage, string> = {
  ordered: "Commandée",
  prepared: "Préparée",
  shipped: "Expédiée",
  delivered: "Livrée",
};

export type OrderTone = "neutral" | "progress" | "success" | "danger";

export type OrderOutlook = {
  /** Ce qu'on écrit dans la pastille de statut. */
  label: string;
  tone: OrderTone;
  /** Dernier jalon atteint ; absent quand la commande est annulée. */
  stage: OrderStage | null;
  /** La commande elle-même est annulée — rien ne partira. */
  canceled: boolean;
  /**
   * Une expédition a été annulée et aucune autre n'est en cours : le colis n'est pas
   * parti, une nouvelle expédition sera préparée. À ne pas confondre avec `canceled`.
   */
  shipmentCanceled: boolean;
};

/**
 * Lecture client des statuts que Medusa agrège.
 *
 * Deux statuts se combinent : celui de la commande — annulée ou non — et celui de ses
 * expéditions. Une expédition annulée ne change rien à la commande : Medusa la ramène à
 * « à expédier », et le marchand en prépare une autre. Le client ne voit donc pas
 * « annulée » tant que la commande ne l'est pas vraiment.
 */
export function describeOrder(order: Pick<MedusaOrderSummary, "status" | "fulfillment_status">): OrderOutlook {
  if (order.status === "canceled") {
    return { label: "Annulée", tone: "danger", stage: null, canceled: true, shipmentCanceled: false };
  }

  switch (order.fulfillment_status) {
    case "delivered":
    case "partially_delivered":
      return { label: "Livrée", tone: "success", stage: "delivered", canceled: false, shipmentCanceled: false };
    case "shipped":
    case "partially_shipped":
      return { label: "Expédiée", tone: "progress", stage: "shipped", canceled: false, shipmentCanceled: false };
    case "fulfilled":
    case "partially_fulfilled":
      return { label: "En préparation", tone: "progress", stage: "prepared", canceled: false, shipmentCanceled: false };
    case "canceled":
      return {
        label: "En cours de traitement",
        tone: "neutral",
        stage: "ordered",
        canceled: false,
        shipmentCanceled: true,
      };
    default:
      return { label: "En cours de traitement", tone: "neutral", stage: "ordered", canceled: false, shipmentCanceled: false };
  }
}

export function describePayment(status: MedusaPaymentStatus): { label: string; tone: OrderTone } {
  switch (status) {
    case "captured":
    case "partially_captured":
    case "authorized":
    case "partially_authorized":
      return { label: "Payée", tone: "success" };
    case "refunded":
      return { label: "Remboursée", tone: "neutral" };
    case "partially_refunded":
      return { label: "Partiellement remboursée", tone: "neutral" };
    case "canceled":
      return { label: "Paiement annulé", tone: "danger" };
    case "requires_action":
      return { label: "Action requise", tone: "danger" };
    default:
      return { label: "En attente de paiement", tone: "neutral" };
  }
}

/** L'expédition qui compte : la plus récente non annulée, sinon la dernière annulée. */
export function activeFulfillment(order: Pick<MedusaOrderDetail, "fulfillments">): MedusaFulfillment | null {
  const parDate = [...(order.fulfillments ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return parDate.find((f) => !f.canceled_at) ?? parDate[0] ?? null;
}

/** Date à laquelle chaque jalon a été franchi, quand elle est connue. */
export function stageDates(order: Pick<MedusaOrderDetail, "created_at" | "fulfillments">): Partial<Record<OrderStage, string>> {
  const expedition = activeFulfillment(order);

  if (!expedition || expedition.canceled_at) {
    return { ordered: order.created_at };
  }

  return {
    ordered: order.created_at,
    prepared: expedition.packed_at ?? expedition.created_at,
    shipped: expedition.shipped_at ?? undefined,
    delivered: expedition.delivered_at ?? undefined,
  };
}

export function formatOrderDate(iso: string, withTime = false): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
}
