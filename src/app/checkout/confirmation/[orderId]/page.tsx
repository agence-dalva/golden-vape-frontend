import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/medusa-checkout";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { formatPrice } from "@/lib/medusa";
import PageTransition from "@/components/page-transition";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const [order, customer] = await Promise.all([getOrder(orderId), getCurrentCustomer()]);

  if (!order) {
    notFound();
  }

  // Le suivi vit dans l'espace client : on n'y envoie que ceux qui peuvent y entrer, et
  // seulement vers leur propre commande.
  const suivi = customer && order.customer_id === customer.id ? `/compte/commandes/${order.id}` : null;

  return (
    <PageTransition>
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Merci pour votre commande !
      </h1>
      <p className="mb-8 text-sm text-brand-chocolate/70">
        Commande n°{order.display_id} — un email de confirmation a été envoyé à {order.email}.
      </p>

      <div className="rounded-xl bg-white shadow-gv-raised p-6 text-left">
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-chocolate/80">
                {item.title} × {item.quantity}
              </span>
              <span className="text-brand-chocolate">
                {formatPrice(item.total, order.currency_code)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-brand-chocolate/10 pt-4 text-base font-semibold text-brand-chocolate">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency_code)}</span>
        </div>

        {order.shipping_address && (
          <div className="mt-4 border-t border-brand-chocolate/10 pt-4 text-sm text-brand-chocolate/70">
            <p className="mb-1 font-medium text-brand-chocolate">Adresse de livraison</p>
            <p>
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            <p>{order.shipping_address.address_1}</p>
            {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
            <p>
              {order.shipping_address.postal_code} {order.shipping_address.city}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {suivi && (
          <Link
            href={suivi}
            className="inline-block rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream"
          >
            Suivre ma commande
          </Link>
        )}
        <Link
          href="/"
          className={
            suivi
              ? "inline-block rounded-lg border border-brand-chocolate/20 px-6 py-3 text-sm font-medium text-brand-chocolate"
              : "inline-block rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream"
          }
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
    </PageTransition>
  );
}
