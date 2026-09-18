"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { formatPrice } from "@/lib/medusa";
import { useCartActivity } from "./cart-activity";

/**
 * Récapitulatif du panier.
 *
 * Ses montants viennent du serveur — remises, port et taxes ne se devinent pas côté
 * navigateur. Pendant qu'une ligne attend la confirmation d'un changement, il l'annonce et
 * retient le bouton de commande : les chiffres visibles sont ceux d'avant le clic.
 */
export default function CartSummary({
  itemTotal,
  discountTotal,
  shippingTotal,
  total,
  currencyCode,
  checkoutHref,
}: {
  itemTotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  currencyCode: string;
  checkoutHref: string;
}) {
  const { enCours } = useCartActivity();
  const montant = `tabular-nums transition-opacity duration-200 ${enCours ? "opacity-40" : ""}`;

  return (
    <section className="rounded-xl bg-gv-card p-6 shadow-gv-raised" aria-busy={enCours}>
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-gv-text">Récapitulatif</h2>
        <span
          aria-live="polite"
          className={`text-xs text-gv-text-soft transition-opacity duration-200 ${enCours ? "opacity-100" : "opacity-0"}`}
        >
          Mise à jour…
        </span>
      </div>

      <dl className="flex flex-col gap-4 text-sm">
        <div className="flex justify-between gap-5">
          <dt className="text-gv-text-soft">Sous-total</dt>
          <dd className={`${montant} text-gv-text`}>{formatPrice(itemTotal, currencyCode)}</dd>
        </div>

        {/* La ligne de remise n'apparaît qu'en présence d'une réduction réelle. */}
        {discountTotal > 0 && (
          <div className="flex justify-between gap-5">
            <dt className="text-gv-text-soft">Réduction</dt>
            <dd className={`${montant} text-[var(--gv-success)]`}>
              −{formatPrice(discountTotal, currencyCode)}
            </dd>
          </div>
        )}

        <div className="flex justify-between gap-5">
          <dt className="text-gv-text-soft">Livraison</dt>
          <dd className={`text-right text-gv-text-soft ${shippingTotal > 0 ? montant : ""}`}>
            {shippingTotal > 0 ? formatPrice(shippingTotal, currencyCode) : "Calculée à l'étape suivante"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-gv-border pt-5">
        <span className="text-lg font-semibold tracking-[-0.01em] text-gv-text">Total</span>
        <span className={`${montant} text-[30px] font-semibold text-gv-text`}>
          {formatPrice(total, currencyCode)}
        </span>
      </div>
      <p className="mt-1 text-right text-xs text-gv-text-soft">Taxes incluses</p>

      <Link
        href={checkoutHref}
        transitionTypes={["nav-forward"]}
        aria-disabled={enCours || undefined}
        tabIndex={enCours ? -1 : undefined}
        className={`mt-6 flex min-h-[54px] items-center justify-center rounded-[7px] border border-gv-800 bg-gv-800 px-6 text-[15px] font-semibold text-white shadow-[0_9px_24px_rgb(68_54_46/0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-gv-900 ${
          enCours ? "pointer-events-none opacity-60" : ""
        }`}
      >
        Passer la commande
      </Link>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gv-text-soft">
        <Lock size={14} aria-hidden />
        Paiement 100 % sécurisé
      </p>
    </section>
  );
}
