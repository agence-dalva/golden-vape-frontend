import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Home, Package } from "lucide-react";
import { getCurrentCustomer, getMyOrders } from "@/lib/customer-actions";
import EmptyState from "@/components/empty-state";
import PageTransition from "@/components/page-transition";
import OrderRow from "../order-row";

const lienRubrique =
  "inline-flex items-center gap-1.5 text-sm font-medium text-gv-800 transition-colors hover:underline";

/**
 * Vue d'ensemble : la dernière commande, l'adresse par défaut, l'identité — chaque bloc
 * mène à sa rubrique. Le client qui vient voir « où en est mon colis » a sa réponse sans
 * cliquer ; les autres savent où aller.
 */
export default async function AccountOverviewPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/compte/connexion?redirect=/compte");

  const orders = await getMyOrders();
  const derniere = orders[0];
  const adresse =
    customer.addresses.find((a) => a.is_default_shipping) ?? customer.addresses[0] ?? null;
  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();

  return (
    <PageTransition>
      <div className="flex flex-col gap-12">
        <section>
          <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-normal text-gv-text sm:text-[28px]">
              Dernière commande
            </h2>
            {orders.length > 1 && (
              <Link href="/compte/commandes" className={lienRubrique}>
                Toutes mes commandes ({orders.length})
                <ArrowRight size={15} aria-hidden />
              </Link>
            )}
          </div>

          {derniere ? (
            <OrderRow order={derniere} />
          ) : (
            <EmptyState
              icon={Package}
              title="Aucune commande pour le moment"
              description="Vos prochaines commandes apparaîtront ici."
              primary={{ label: "Découvrir la boutique", href: "/categories" }}
              secondary={{ label: "Voir les nouveautés", href: "/" }}
            />
          )}
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section>
            <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-normal text-gv-text sm:text-[28px]">
                Adresse de livraison
              </h2>
              <Link href="/compte/adresses" className={lienRubrique}>
                Gérer
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>

            {adresse ? (
              <article className="flex min-h-[150px] gap-4 rounded-xl border border-gv-border bg-gv-card p-5">
                <span
                  aria-hidden
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-gv-50 text-gv-800"
                >
                  <Home size={20} strokeWidth={1.6} />
                </span>
                <address className="not-italic text-sm leading-relaxed text-gv-text-soft">
                  <span className="block font-semibold text-gv-text">
                    {adresse.first_name} {adresse.last_name}
                  </span>
                  <span className="block">{adresse.address_1}</span>
                  {adresse.address_2 && <span className="block">{adresse.address_2}</span>}
                  <span className="block">
                    {adresse.postal_code} {adresse.city}
                  </span>
                </address>
              </article>
            ) : (
              <Link
                href="/compte/adresses"
                className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gv-border-strong p-5 text-sm font-medium text-gv-text-soft transition-colors hover:border-gv-800 hover:bg-gv-50 hover:text-gv-800"
              >
                Ajouter une adresse
              </Link>
            )}
          </section>

          <section>
            <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-normal text-gv-text sm:text-[28px]">
                Mes informations
              </h2>
              <Link href="/compte/informations" className={lienRubrique}>
                Voir
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>

            <dl className="min-h-[150px] rounded-xl border border-gv-border bg-gv-card p-5">
              <div className="flex items-baseline justify-between gap-4 border-b border-gv-border py-2.5">
                <dt className="text-[13px] text-gv-text-soft">Nom</dt>
                <dd className="text-[13px] font-semibold text-gv-text">{fullName || "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[13px] text-gv-text-soft">Email</dt>
                <dd className="min-w-0 truncate text-[13px] font-semibold text-gv-text">{customer.email}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
