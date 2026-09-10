"use client";

import { useState } from "react";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import type { MedusaShippingOption } from "@/lib/medusa-checkout";
import { formatPrice } from "@/lib/medusa";
import { formatAddress, type ServicePoint } from "@/lib/service-points";
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
};

/**
 * Étape « transporteur » : liste des services, puis choix du point relais s'il en faut un.
 *
 * Les deux vues partagent une même carte plutôt que de s'empiler. Empilées, elles
 * doublaient la hauteur de l'étape et laissaient à l'écran une liste de transporteurs
 * devenue sans objet — le choix est fait, il n'a plus besoin d'occuper la place. Ici, la
 * seconde vue remplace la première et une flèche ramène en arrière.
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
}: Props) {
  const [vue, setVue] = useState<"options" | "relais">("options");

  const optionChoisie = options.find((o) => o.id === selectedOptionId) ?? null;
  const besoinPointRelais = Boolean(optionChoisie?.data?.is_service_point_required);
  const transporteurs = optionChoisie?.data?.carrier_code
    ? [optionChoisie.data.carrier_code]
    : [];

  const choisirOption = (option: MedusaShippingOption) => {
    onSelectOption(option.id);

    // Basculer aussitôt vers le choix du point évite un clic supplémentaire sur ce qui
    // est, de toute façon, obligatoire pour continuer.
    if (option.data?.is_service_point_required) {
      setVue("relais");
    }
  };

  if (vue === "relais" && besoinPointRelais) {
    return (
      <div key="relais" className="gv-delivery-panel-in">
        <div className="mb-4 flex items-start gap-3">
          <button
            type="button"
            onClick={() => setVue("options")}
            className="mt-0.5 rounded-lg p-1 text-brand-chocolate/60 transition-colors hover:bg-brand-chocolate/5 hover:text-brand-chocolate"
            aria-label="Revenir au choix du transporteur"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-brand-chocolate">
              Choisissez votre point relais
            </h2>
            <p className="text-sm text-brand-chocolate/60">
              {optionChoisie?.name}
              {optionChoisie?.calculated_price
                ? ` · ${formatPrice(optionChoisie.calculated_price.calculated_amount, currencyCode)}`
                : ""}
            </p>
          </div>
        </div>

        <ServicePointPicker
          carriers={transporteurs}
          defaultPostalCode={postalCode}
          defaultCity={city}
          selected={servicePoint}
          onSelect={onSelectServicePoint}
        />
      </div>
    );
  }

  return (
    <div key="options" className="gv-delivery-panel-in">
      <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">2. Transporteur</h2>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const actif = selectedOptionId === option.id;
          const relais = Boolean(option.data?.is_service_point_required);

          return (
            <div key={option.id}>
              <label
                className={[
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
                  actif
                    ? "border-brand-gold-dark bg-brand-gold-dark/5"
                    : "border-brand-chocolate/15 hover:border-brand-chocolate/30",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_option"
                    checked={actif}
                    onChange={() => choisirOption(option)}
                    disabled={disabled}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium text-brand-chocolate">{option.name}</span>
                </span>
                <span className="shrink-0 text-sm text-brand-chocolate/70">
                  {option.calculated_price
                    ? formatPrice(option.calculated_price.calculated_amount, currencyCode)
                    : "—"}
                </span>
              </label>

              {/* Le point retenu se rappelle sous son option, avec de quoi le changer :
                  sans cela, revenir en arriere effacerait le choix de l'ecran. */}
              {actif && relais && servicePoint && (
                <button
                  type="button"
                  onClick={() => setVue("relais")}
                  className="mt-2 flex w-full items-start gap-2 rounded-lg bg-brand-cream/60 px-4 py-2.5 text-left"
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-brand-gold-dark" />
                  <span className="flex-1">
                    <span className="block text-xs font-medium text-brand-chocolate">
                      {servicePoint.name}
                    </span>
                    <span className="block text-xs text-brand-chocolate/60">
                      {formatAddress(servicePoint)}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-brand-gold-dark underline">
                    Changer
                  </span>
                </button>
              )}

              {actif && relais && !servicePoint && (
                <button
                  type="button"
                  onClick={() => setVue("relais")}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg bg-brand-cream/60 px-4 py-2.5 text-left text-xs font-medium text-brand-chocolate"
                >
                  <MapPin size={14} className="text-brand-gold-dark" />
                  Choisir un point relais pour continuer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {servicePoint && besoinPointRelais && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-brand-chocolate/60">
          <Check size={13} className="text-brand-gold-dark" />
          Point relais sélectionné, vous pouvez régler votre commande.
        </p>
      )}
    </div>
  );
}
