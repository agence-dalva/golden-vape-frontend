import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { getCurrentCustomer, getMyOrders } from "@/lib/customer-actions";
import { formatPrice } from "@/lib/medusa";
import Breadcrumbs from "@/components/breadcrumbs";
import EmptyState from "@/components/empty-state";
import AccountSidebar from "./account-sidebar";
import AddressManager from "./address-manager";
import LogoutButton from "./logout-button";

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En cours de traitement",
  completed: "Terminée",
  draft: "Brouillon",
  archived: "Archivée",
  canceled: "Annulée",
  requires_action: "Action requise",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(iso)
  );
}

/** Initiales dérivées du profil, sans photo inventée. */
function initialsOf(first: string | null, last: string | null, email: string): string {
  const letters = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.trim();
  return (letters || email[0] || "?").toUpperCase();
}

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/compte/connexion?redirect=/compte");
  }

  const orders = await getMyOrders();
  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();

  return (
    <div className="gv-container pb-16">
      <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Mon compte" }]} />

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[36px] font-medium leading-none tracking-[-0.025em] text-gv-text lg:text-[44px]">
            Mon compte
          </h1>
          <p className="mt-2 text-sm text-gv-text-soft">
            {customer.first_name
              ? `Bonjour ${customer.first_name}, ravi de vous revoir.`
              : "Bonjour, ravi de vous revoir."}
          </p>
        </div>

        <LogoutButton />
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
        <div className="lg:sticky lg:top-6">
          <AccountSidebar
            fullName={fullName || customer.email}
            initials={initialsOf(customer.first_name, customer.last_name, customer.email)}
          />
        </div>

        <div id="vue-ensemble" className="flex flex-col gap-12">
          <section id="commandes" className="scroll-mt-24">
            <h2 className="mb-[18px] font-display text-2xl font-medium text-gv-text sm:text-[28px]">
              Mes commandes
            </h2>

            {orders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Aucune commande pour le moment"
                description="Vos prochaines commandes apparaîtront ici."
                primary={{ label: "Découvrir la boutique", href: "/categories" }}
                secondary={{ label: "Voir les nouveautés", href: "/" }}
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/checkout/confirmation/${order.id}`}
                      className="grid grid-cols-1 items-center gap-3 rounded-[10px] border border-gv-border bg-gv-card px-5 py-[18px] transition-colors hover:border-gv-border-strong sm:grid-cols-[1fr_auto_auto] sm:gap-6"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gv-text">
                          Commande n°{order.display_id}
                        </span>
                        <span className="block text-xs text-gv-text-soft">
                          {formatDate(order.created_at)}
                        </span>
                      </span>

                      <span className="flex items-center gap-2 text-[13px] text-gv-text-soft">
                        <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-gv-500" />
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>

                      <span className="flex items-center gap-4 justify-self-end">
                        <span className="text-sm font-semibold tabular-nums text-gv-text">
                          {formatPrice(order.total, order.currency_code)}
                        </span>
                        <ArrowRight size={16} aria-hidden className="text-gv-text-muted" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="adresses" className="scroll-mt-24">
            <AddressManager addresses={customer.addresses ?? []} />
          </section>

          <section id="informations" className="scroll-mt-24">
            <h2 className="mb-[18px] font-display text-2xl font-medium text-gv-text sm:text-[28px]">
              Mes informations
            </h2>
            <dl className="max-w-xl rounded-xl border border-gv-border bg-gv-card p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-gv-border py-2.5">
                <dt className="text-[13px] text-gv-text-soft">Nom</dt>
                <dd className="text-[13px] font-semibold text-gv-text">{fullName || "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[13px] text-gv-text-soft">Email</dt>
                <dd className="text-[13px] font-semibold text-gv-text">{customer.email}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
