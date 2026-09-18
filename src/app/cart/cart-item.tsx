"use client";

import { useOptimistic, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import type { MedusaCartLineItem } from "@/lib/medusa-cart";
import { getLineItemImage } from "@/lib/medusa-cart";
import { formatPrice } from "@/lib/medusa";
import { updateCartLineAction, removeCartLineAction } from "@/lib/cart-actions";
import { useCartActivity } from "./cart-activity";

/**
 * Délai pendant lequel des clics successifs sur + ou − sont regroupés en un seul appel.
 * Assez court pour que l'envoi paraisse immédiat, assez long pour absorber un double clic.
 */
const DELAI_REGROUPEMENT_MS = 350;

/**
 * Une ligne du panier, qui répond avant le serveur.
 *
 * Changer la quantité passe par Medusa, qui recalcule tout le panier — et, depuis Vercel,
 * l'aller-retour se compte en centaines de millisecondes. Attendre à chaque clic rendait
 * le compteur poussif. Ici la quantité et le total de ligne affichés sont ceux que le
 * client vient de demander (`useOptimistic`), le temps que le serveur confirme ; s'il
 * refuse — stock insuffisant, par exemple — l'affichage revient de lui-même à la valeur
 * connue et un message l'explique. Le total de ligne optimiste ignore les remises : c'est
 * le serveur qui a le dernier mot, quelques centaines de millisecondes plus tard.
 *
 * Les clics rapprochés ne valent qu'un appel, avec la dernière quantité demandée, et les
 * appels d'une même ligne partent l'un après l'autre : deux requêtes qui se croisent
 * pourraient s'appliquer dans le désordre et laisser le panier sur une quantité dépassée.
 */
export default function CartItem({
  item,
  currencyCode,
  productHandle,
}: {
  item: MedusaCartLineItem;
  currencyCode: string;
  /** `null` si le produit n'est plus au catalogue : on n'y renvoie alors pas. */
  productHandle: string | null;
}) {
  const [, startTransition] = useTransition();
  const [suppressionEnCours, startSuppression] = useTransition();
  const { commencer } = useCartActivity();
  const [quantiteAffichee, montrerQuantite] = useOptimistic(item.quantity);
  const [retire, marquerRetire] = useOptimistic(false);
  // Dernière quantité demandée, tant qu'elle n'est pas confirmée par le serveur.
  const cible = useRef<number | null>(null);
  // Appel en vol, pour que le suivant attende son tour.
  const enVol = useRef<Promise<unknown> | null>(null);
  const imageUrl = getLineItemImage(item);

  const changerQuantite = (delta: number) => {
    const prochaine = (cible.current ?? quantiteAffichee) + delta;
    if (prochaine < 1) return;
    cible.current = prochaine;
    const terminer = commencer();

    startTransition(async () => {
      montrerQuantite(prochaine);

      await new Promise((resolve) => setTimeout(resolve, DELAI_REGROUPEMENT_MS));
      if (enVol.current) await enVol.current.catch(() => {});
      // Un clic plus récent a pris le relais : c'est lui qui portera la quantité finale.
      if (cible.current !== prochaine) {
        terminer();
        return;
      }

      const appel = updateCartLineAction(item.id, prochaine);
      enVol.current = appel;
      try {
        const result = await appel;
        if (result.error) toast.error(result.error);
      } finally {
        if (enVol.current === appel) enVol.current = null;
        if (cible.current === prochaine) cible.current = null;
        terminer();
      }
    });
  };

  const remove = () => {
    const terminer = commencer();
    startSuppression(async () => {
      marquerRetire(true);
      try {
        const result = await removeCartLineAction(item.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Article retiré du panier");
      } finally {
        terminer();
      }
    });
  };

  // La ligne disparaît dès le clic ; elle revient d'elle-même si le serveur refuse.
  if (retire) return null;

  const totalAffiche =
    quantiteAffichee === item.quantity ? item.total : item.unit_price * quantiteAffichee;

  const title = (
    <span className="text-[15px] font-semibold leading-snug text-gv-text sm:text-base">
      {item.product_title}
    </span>
  );

  return (
    <li className="rounded-xl bg-gv-card p-4 shadow-gv-raised sm:p-[22px]">
      <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[126px_minmax(200px,1fr)_128px_120px] lg:items-center">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gv-image lg:h-[126px] lg:w-[126px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product_title}
              fill
              sizes="126px"
              className="object-contain p-2.5"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-gv-text-muted">
              <ImageOff size={20} aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3>
            {productHandle ? (
              <Link href={`/products/${productHandle}`} className="hover:text-gv-800">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>

          {item.variant_title && (
            <p className="mt-1 text-[13px] text-gv-text-soft">{item.variant_title}</p>
          )}

          <p className="mt-3 text-[19px] font-semibold text-gv-text">
            {formatPrice(item.unit_price, currencyCode)}
          </p>
          <p className="text-xs text-gv-text-soft">Prix unitaire</p>
        </div>

        <div className="col-span-2 flex items-center justify-between gap-4 lg:col-span-1 lg:justify-start">
          <div className="grid h-12 w-32 grid-cols-[40px_1fr_40px] items-center rounded-[7px] border border-gv-border-strong bg-white">
            <button
              onClick={() => changerQuantite(-1)}
              disabled={suppressionEnCours || quantiteAffichee <= 1}
              aria-label={`Diminuer la quantité de ${item.product_title}`}
              className="flex h-full cursor-pointer items-center justify-center text-gv-text disabled:cursor-not-allowed disabled:text-gv-text-muted"
            >
              <Minus size={15} aria-hidden />
            </button>
            <span aria-live="polite" className="text-center text-sm font-semibold tabular-nums text-gv-text">
              {quantiteAffichee}
            </span>
            <button
              onClick={() => changerQuantite(1)}
              disabled={suppressionEnCours}
              aria-label={`Augmenter la quantité de ${item.product_title}`}
              className="flex h-full cursor-pointer items-center justify-center text-gv-text disabled:cursor-not-allowed disabled:text-gv-text-muted"
            >
              <Plus size={15} aria-hidden />
            </button>
          </div>

          <div className="text-right lg:hidden">
            <p className="text-2xl font-semibold tabular-nums text-gv-text">
              {formatPrice(totalAffiche, currencyCode)}
            </p>
            <p className="text-xs text-gv-text-soft">Total</p>
          </div>
        </div>

        <div className="hidden text-right lg:block">
          <p className="text-2xl font-semibold tabular-nums text-gv-text">
            {formatPrice(totalAffiche, currencyCode)}
          </p>
          <p className="text-xs text-gv-text-soft">Total</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end border-t border-gv-border pt-3">
        <button
          onClick={remove}
          disabled={suppressionEnCours}
          className="flex min-h-10 cursor-pointer items-center gap-2 text-[13px] text-gv-text-soft transition-colors hover:text-[var(--gv-danger)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={18} aria-hidden />
          Supprimer
          <span className="sr-only"> {item.product_title} du panier</span>
        </button>
      </div>
    </li>
  );
}
