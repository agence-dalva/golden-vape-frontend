"use client";

import { useState } from "react";
import { Home, Store, Truck } from "lucide-react";
import type { MedusaShippingOption } from "@/lib/medusa-checkout";
import { formatPrice } from "@/lib/medusa";
import type { ServicePoint } from "@/lib/service-points";
import ServicePointPicker from "@/components/service-point-picker";

type Props = {
  options: MedusaShippingOption[];
  currencyCode: string;
  selectedOptionId: string | null;
  servicePoint: ServicePoint | null;
  onSelectOption: (optionId: string) => void;
  onSelectServicePoint: (point: ServicePoint) => void;
  disabled?: boolean;
  postalCode?: string;
  city?: string;
  /** Coefficient HT → TTC, deduit du panier : les prix rendus par Medusa sont hors taxes,
   *  le recapitulatif compte en TTC. Sans lui, la meme livraison afficherait deux montants. */
  taxRate: number;
  /** Montant des articles, toutes taxes comprises — celui que le client lit. */
  subtotal: number;
};

/**
 * Étape « livraison » : le mode d'abord, puis le point relais s'il en faut un.
 *
 * Le choix du point reste dans la même carte, sous les modes, plutôt que de les remplacer :
 * on garde sous les yeux ce qu'on a choisi et son prix pendant qu'on cherche où retirer.
 */
export default function DeliveryPicker({
  options,
  currencyCode,
  selectedOptionId,
  servicePoint,
  onSelectOption,
  onSelectServicePoint,
  disabled,
  postalCode,
  city,
  taxRate,
  subtotal,
}: Props) {
  const optionChoisie = options.find((o) => o.id === selectedOptionId) ?? null;
  const besoinPointRelais = Boolean(optionChoisie?.data?.is_service_point_required);
  const transporteurs = optionChoisie?.data?.carrier_code
    ? [optionChoisie.data.carrier_code]
    : [];

  // Le seuil vient de la configuration du provider, transporte dans les donnees de chaque
  // option : il n'existe qu'a un seul endroit, et l'interface n'en decide pas.
  const seuilHT = options.find((o) => o.data?.free_shipping_from_subtotal)?.data
    ?.free_shipping_from_subtotal;
  const seuilTTC = seuilHT ? seuilHT * taxRate : null;
  const franchiseAtteinte = seuilTTC !== null && subtotal >= seuilTTC;
  const reste = seuilTTC !== null ? Math.max(0, seuilTTC - subtotal) : 0;

  const prixTTC = (option: MedusaShippingOption) =>
    option.calculated_price
      ? formatPrice(option.calculated_price.calculated_amount * taxRate, currencyCode)
      : "—";

  return (
    <>
      {seuilTTC !== null && (
        <div
          className={[
            "mb-4 rounded-lg border px-3.5 py-3",
            franchiseAtteinte
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-brand-chocolate/10 bg-gv-50/60",
          ].join(" ")}
        >
          <p className="flex items-center gap-2 text-[13px]">
            <Truck
              size={15}
              className={franchiseAtteinte ? "shrink-0 text-emerald-600" : "shrink-0 text-gv-500"}
            />
            {franchiseAtteinte ? (
              <span className="font-medium text-emerald-800">
                Livraison offerte sur cette commande.
              </span>
            ) : (
              <span className="text-gv-text">
                Plus que{" "}
                <span className="font-semibold">{formatPrice(reste, currencyCode)}</span> pour
                bénéficier de la livraison offerte.
              </span>
            )}
          </p>

          {/* La barre traduit d'un coup d'oeil ce que la phrase dit en toutes lettres. */}
          <div
            className="mt-2 h-1 overflow-hidden rounded-full bg-brand-chocolate/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={Math.round(seuilTTC)}
            aria-valuenow={Math.round(Math.min(subtotal, seuilTTC))}
            aria-label="Progression vers la livraison offerte"
          >
            <span
              className={[
                "block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
                franchiseAtteinte ? "bg-emerald-500" : "bg-gv-800",
              ].join(" ")}
              style={{ width: `${Math.min(100, (subtotal / seuilTTC) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const actif = selectedOptionId === option.id;
          const relais = Boolean(option.data?.is_service_point_required);

          return (
            <label
              key={option.id}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                actif
                  ? "border-gv-800 bg-gv-800/[0.025]"
                  : "border-brand-chocolate/10 hover:border-brand-chocolate/25",
              ].join(" ")}
            >
              <input
                type="radio"
                name="shipping_option"
                checked={actif}
                onChange={() => onSelectOption(option.id)}
                disabled={disabled}
                className="h-4 w-4 shrink-0 cursor-pointer accent-gv-800"
              />
              {relais ? (
                <Store size={19} className={actif ? "shrink-0 text-gv-800" : "shrink-0 text-gv-500"} />
              ) : (
                <Home size={19} className={actif ? "shrink-0 text-gv-800" : "shrink-0 text-gv-500"} />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-gv-text">
                  {option.name}
                </span>
                {/* Le transporteur est identifie par son logotype : les tarifs different
                    d'un reseau a l'autre, et c'est ce qui justifie l'ecart de prix d'une
                    ligne a la suivante. Une pastille carree de 24 px n'y suffisait pas. */}
                <span className="mt-1 flex min-w-0 items-center gap-2">
                  <LogoTransporteur
                    logoUrl={option.data?.carrier_logo_url}
                    nom={option.data?.carrier_name}
                  />
                  {option.type?.description && (
                    <span className="min-w-0 truncate text-[12.5px] text-gv-text-soft">
                      {option.type.description}
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 text-[15px] font-medium text-gv-text">
                {prixTTC(option)}
              </span>
            </label>
          );
        })}
      </div>

      {/*
        Le selecteur reste monte en permanence, replie tant qu'aucun mode en point relais
        n'est choisi : c'est ce qui permet d'animer le repli dans les deux sens, la ou un
        demontage serait sec. Il ne cherche rien tant qu'il est inactif.

        Repli anime plutot qu'une apparition seche. La grille passe de 0fr a 1fr : c'est
        le seul moyen d'animer une hauteur inconnue en CSS pur, et l'opacite suit pour que
        le contenu ne surgisse pas avant d'avoir la place.
      */}
      <div
          inert={!besoinPointRelais}
          aria-hidden={!besoinPointRelais}
          className={[
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
            besoinPointRelais ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <ServicePointPicker
              active={besoinPointRelais}
              carriers={transporteurs}
              defaultPostalCode={postalCode}
              defaultCity={city}
              selected={servicePoint}
              onSelect={onSelectServicePoint}
              priceLabel={optionChoisie ? prixTTC(optionChoisie) : undefined}
            />
          </div>
        </div>
    </>
  );
}

/**
 * Logotype du transporteur.
 *
 * L'URL est reconstruite a partir du motif du CDN Sendcloud, que leur endpoint des points
 * relais expose mais pas celui des options : un motif non documente peut changer sans
 * preavis. En cas d'echec on affiche le nom en toutes lettres, qui reste juste.
 */
function LogoTransporteur({ logoUrl, nom }: { logoUrl?: string | null; nom?: string | null }) {
  const [echec, setEchec] = useState(false);

  if (!nom) return null;

  if (!logoUrl || echec) {
    return (
      <span className="shrink-0 text-[12.5px] font-medium text-gv-text-soft">{nom}</span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={nom}
      onError={() => setEchec(true)}
      className="h-[17px] w-auto max-w-[86px] shrink-0 object-contain object-left"
    />
  );
}
