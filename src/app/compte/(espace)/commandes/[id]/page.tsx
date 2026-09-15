import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ImageOff, MapPin, Package, Truck } from "lucide-react";
import { getMyOrder } from "@/lib/customer-actions";
import { getOrderItemImage } from "@/lib/medusa-orders";
import {
  activeFulfillment,
  describeOrder,
  describePayment,
  formatOrderDate,
  stageDates,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/medusa";
import PageTransition from "@/components/page-transition";
import OrderStatusBadge from "../../../order-status-badge";
import OrderStepper from "../../../order-stepper";

const carte = "rounded-xl border border-gv-border bg-gv-card";
const titreCarte = "mb-3 flex items-center gap-2 text-[15px] font-semibold text-gv-text";

/**
 * Suivi d'une commande.
 *
 * Le client vient ici pour une question : où en est mon colis ? Le stepper y répond en
 * premier, avec le numéro de suivi dès qu'il existe. Le reste — articles, adresse,
 * paiement, totaux — est ce qu'on attend d'un récapitulatif et ne doit rien cacher.
 */
export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getMyOrder(id);

  if (!order) {
    notFound();
  }

  const etat = describeOrder(order);
  const paiement = describePayment(order.payment_status);
  const dates = stageDates(order);
  const expedition = activeFulfillment(order);
  const suivi = expedition && !expedition.canceled_at ? expedition.labels[0] : null;
  const livraison = order.shipping_methods[0] ?? null;
  const pointRelais = livraison?.data?.service_point_name ?? null;
  const adresse = order.shipping_address;
  const remise = Number(order.discount_total ?? 0);

  return (
    <PageTransition>
      <article className="flex flex-col gap-8">
        <Link
          href="/compte/commandes"
          transitionTypes={["nav-back"]}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-gv-text-soft transition-colors hover:text-gv-800"
        >
          <ArrowLeft size={15} aria-hidden />
          Mes commandes
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-normal text-gv-text sm:text-[28px]">
              Commande n°{order.display_id}
            </h2>
            <p className="mt-1 text-sm text-gv-text-soft">
              Passée le {formatOrderDate(order.created_at)} · {formatPrice(order.total, order.currency_code)}
            </p>
          </div>
          <OrderStatusBadge label={etat.label} tone={etat.tone} size="md" />
        </header>

        {/* Avancement. Une commande annulée n'a pas de chemin à montrer : un message net
            vaut mieux qu'un stepper figé à la première étape. */}
        <section className={`${carte} p-5 sm:p-6`}>
          {etat.canceled ? (
            <p className="text-sm text-gv-text">
              Cette commande a été annulée
              {order.payment_status === "refunded" || order.payment_status === "partially_refunded"
                ? " et remboursée"
                : ""}
              . Si vous n&apos;êtes pas à l&apos;origine de cette annulation, contactez-nous en
              indiquant le numéro de commande.
            </p>
          ) : (
            <>
              <OrderStepper stage={etat.stage ?? "ordered"} dates={dates} />

              {etat.shipmentCanceled && (
                <p className="mt-5 rounded-lg bg-gv-50 px-4 py-3 text-[13.5px] text-gv-text-soft">
                  L&apos;expédition préparée le{" "}
                  {expedition ? formatOrderDate(expedition.created_at) : ""} a été annulée : votre
                  colis n&apos;est pas parti. Une nouvelle expédition sera préparée, et le suivi
                  apparaîtra ici.
                </p>
              )}

              {suivi?.tracking_number && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gv-50 px-4 py-3">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Truck size={17} aria-hidden className="shrink-0 text-gv-800" />
                    <span className="text-gv-text-soft">Numéro de suivi</span>
                    <span className="font-semibold tabular-nums text-gv-text">{suivi.tracking_number}</span>
                  </div>
                  {suivi.tracking_url && (
                    <a
                      href={suivi.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-[7px] border border-gv-border-strong bg-white px-3.5 text-[13px] font-medium text-gv-text transition-colors hover:border-gv-800 hover:text-gv-800"
                    >
                      Suivre le colis
                      <ExternalLink size={13} aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Articles et totaux */}
          <section className={carte}>
            <h3 className={`${titreCarte} px-5 pt-5 sm:px-6`}>
              <Package size={17} aria-hidden className="text-gv-800" />
              Articles
            </h3>

            <ul className="divide-y divide-gv-border">
              {order.items.map((item) => {
                const image = getOrderItemImage(item);
                const unitaire = item.quantity > 0 ? item.total / item.quantity : item.total;

                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <span className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[8px] bg-gv-image">
                      {image ? (
                        <Image src={image} alt="" fill sizes="68px" className="object-contain p-1.5" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-gv-text-muted">
                          <ImageOff size={20} strokeWidth={1.4} aria-hidden />
                        </span>
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      {item.product_handle ? (
                        <Link
                          href={`/products/${item.product_handle}`}
                          className="block truncate text-sm font-semibold text-gv-text hover:underline"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="block truncate text-sm font-semibold text-gv-text">{item.title}</span>
                      )}
                      {item.variant_title && (
                        <span className="block text-[13px] text-gv-text-soft">{item.variant_title}</span>
                      )}
                      <span className="mt-1 block text-[13px] text-gv-text-soft">
                        {item.quantity} × {formatPrice(unitaire, order.currency_code)}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-semibold tabular-nums text-gv-text">
                      {formatPrice(item.total, order.currency_code)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <dl className="border-t border-gv-border px-5 py-4 text-sm sm:px-6">
              <div className="flex justify-between py-1 text-gv-text-soft">
                <dt>Sous-total</dt>
                <dd className="tabular-nums">{formatPrice(order.item_total, order.currency_code)}</dd>
              </div>
              {remise > 0 && (
                <div className="flex justify-between py-1 text-gv-text-soft">
                  <dt>Remise</dt>
                  <dd className="tabular-nums">− {formatPrice(remise, order.currency_code)}</dd>
                </div>
              )}
              <div className="flex justify-between py-1 text-gv-text-soft">
                <dt>Livraison{livraison ? ` · ${livraison.name}` : ""}</dt>
                <dd className="tabular-nums">
                  {Number(order.shipping_total) === 0 ? "Offerte" : formatPrice(order.shipping_total, order.currency_code)}
                </dd>
              </div>
              <div className="flex justify-between py-1 text-gv-text-soft">
                <dt>dont TVA</dt>
                <dd className="tabular-nums">{formatPrice(order.tax_total, order.currency_code)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-gv-border pt-3 text-base font-semibold text-gv-text">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total, order.currency_code)}</dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-col gap-6">
            {/* Livraison : le mode, puis le point relais ou l'adresse. */}
            <section className={`${carte} p-5 sm:p-6`}>
              <h3 className={titreCarte}>
                <MapPin size={17} aria-hidden className="text-gv-800" />
                Livraison
              </h3>
              {livraison && <p className="text-sm font-medium text-gv-text">{livraison.name}</p>}

              {pointRelais ? (
                <p className="mt-1 text-sm leading-relaxed text-gv-text-soft">
                  Point relais : <span className="font-medium text-gv-text">{pointRelais}</span>
                </p>
              ) : null}

              {adresse && (
                <address className="mt-2 not-italic text-sm leading-relaxed text-gv-text-soft">
                  <span className="block">
                    {adresse.first_name} {adresse.last_name}
                  </span>
                  <span className="block">{adresse.address_1}</span>
                  {adresse.address_2 && <span className="block">{adresse.address_2}</span>}
                  <span className="block">
                    {adresse.postal_code} {adresse.city}
                  </span>
                  {adresse.phone && <span className="block">{adresse.phone}</span>}
                </address>
              )}
            </section>

            <section className={`${carte} p-5 sm:p-6`}>
              <h3 className={titreCarte}>Paiement</h3>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-gv-text-soft">{formatPrice(order.total, order.currency_code)}</span>
                <OrderStatusBadge label={paiement.label} tone={paiement.tone} />
              </div>
            </section>

            <p className="px-1 text-[13px] leading-relaxed text-gv-text-soft">
              Une question sur cette commande ? Rappelez son numéro, n°{order.display_id}, dans
              votre message.
            </p>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
