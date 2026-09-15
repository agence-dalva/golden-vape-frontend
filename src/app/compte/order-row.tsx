import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MedusaOrderSummary } from "@/lib/medusa-orders";
import { describeOrder, formatOrderDate } from "@/lib/order-status";
import { formatPrice } from "@/lib/medusa";
import OrderStatusBadge from "./order-status-badge";

/** Une commande dans une liste : numéro, date, nombre d'articles, statut, total. */
export default function OrderRow({ order }: { order: MedusaOrderSummary }) {
  const etat = describeOrder(order);
  const articles = (order.items ?? []).reduce((somme, item) => somme + Number(item.quantity ?? 0), 0);

  return (
    <Link
      href={`/compte/commandes/${order.id}`}
      className="grid grid-cols-1 items-center gap-3 rounded-[10px] border border-gv-border bg-gv-card px-5 py-[18px] transition-colors hover:border-gv-border-strong sm:grid-cols-[1fr_auto_auto] sm:gap-6"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gv-text">Commande n°{order.display_id}</span>
        <span className="block text-xs text-gv-text-soft">
          {formatOrderDate(order.created_at)}
          {articles > 0 && ` · ${articles} article${articles > 1 ? "s" : ""}`}
        </span>
      </span>

      <OrderStatusBadge label={etat.label} tone={etat.tone} />

      <span className="flex items-center gap-4 justify-self-end">
        <span className="text-sm font-semibold tabular-nums text-gv-text">
          {formatPrice(order.total, order.currency_code)}
        </span>
        <ArrowRight size={16} aria-hidden className="text-gv-text-muted" />
      </span>
    </Link>
  );
}
