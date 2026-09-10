"use client";

import { Home, Store } from "lucide-react";
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
}: Props) {
  const optionChoisie = options.find((o) => o.id === selectedOptionId) ?? null;
  const besoinPointRelais = Boolean(optionChoisie?.data?.is_service_point_required);
  const transporteurs = optionChoisie?.data?.carrier_code
    ? [optionChoisie.data.carrier_code]
    : [];

  const prixTTC = (option: MedusaShippingOption) =>
    option.calculated_price
      ? formatPrice(option.calculated_price.calculated_amount * taxRate, currencyCode)
      : "—";

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const actif = selectedOptionId === option.id;
          const relais = Boolean(option.data?.is_service_point_required);
          const Icone = relais ? Store : Home;

          return (
            <label
              key={option.id}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors",
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
              <Icone size={18} className={actif ? "shrink-0 text-gv-800" : "shrink-0 text-gv-500"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-gv-text">
                  {option.name}
                </span>
                {option.type?.description && (
                  <span className="block truncate text-[12px] text-gv-text-soft">
                    {option.type.description}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[14px] font-medium text-gv-text">
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
