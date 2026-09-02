import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentCustomer, getMyOrders } from "@/lib/customer-actions";
import { formatPrice } from "@/lib/medusa";

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En cours de traitement",
  completed: "Terminée",
  draft: "Brouillon",
  archived: "Archivée",
  canceled: "Annulée",
  requires_action: "Action requise",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/compte/connexion?redirect=/compte");
  }

  const orders = await getMyOrders();
  const defaultAddress =
    customer.addresses?.find((a) => a.is_default_shipping) ?? customer.addresses?.[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Mon compte
      </h1>
      <p className="mb-10 text-sm text-brand-chocolate/70">
        {customer.first_name
          ? `Bonjour ${customer.first_name}, ravi de vous revoir.`
          : customer.email}
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">Mes commandes</h2>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-brand-chocolate/10 bg-white p-6 text-center">
            <p className="mb-4 text-sm text-brand-chocolate/70">
              Vous n&apos;avez pas encore passé de commande.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-brand-chocolate px-6 py-2.5 text-sm font-medium text-brand-cream"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/checkout/confirmation/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-brand-chocolate/10 bg-white px-5 py-4 transition-colors hover:border-brand-gold-dark"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-brand-chocolate">
                      Commande n°{order.display_id}
                    </span>
                    <span className="text-xs text-brand-chocolate/60">
                      {formatDate(order.created_at)} —{" "}
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-brand-chocolate">
                    {formatPrice(order.total, order.currency_code)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">
          Adresse de livraison
        </h2>
        <div className="rounded-xl border border-brand-chocolate/10 bg-white p-5 text-sm text-brand-chocolate/80">
          {defaultAddress ? (
            <>
              <p className="font-medium text-brand-chocolate">
                {defaultAddress.first_name} {defaultAddress.last_name}
              </p>
              <p>{defaultAddress.address_1}</p>
              {defaultAddress.address_2 && <p>{defaultAddress.address_2}</p>}
              <p>
                {defaultAddress.postal_code} {defaultAddress.city}
              </p>
              {defaultAddress.phone && <p>{defaultAddress.phone}</p>}
            </>
          ) : (
            <p className="text-brand-chocolate/60">
              Aucune adresse enregistrée. Celle de votre prochaine commande sera conservée.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
