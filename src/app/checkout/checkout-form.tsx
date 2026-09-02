"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { MedusaCart, MedusaAddress } from "@/lib/medusa-cart";
import type { MedusaCustomer } from "@/lib/medusa-customer";
import type { MedusaShippingOption, MoneticoPaymentForm as MoneticoForm } from "@/lib/medusa-checkout";
import { formatPrice } from "@/lib/medusa";
import { setAddressesAction, setShippingMethodAction, startMoneticoPaymentAction } from "@/lib/checkout-actions";
import AddressForm from "@/components/address-form";
import MoneticoPaymentForm from "@/components/monetico-payment-form";
import CheckoutGate from "./checkout-gate";

const EMPTY_ADDRESS: MedusaAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  postal_code: "",
  city: "",
  phone: "",
  country_code: "fr",
};

export default function CheckoutForm({
  cart,
  customer,
  shippingOptions,
}: {
  cart: MedusaCart;
  customer: MedusaCustomer | null;
  shippingOptions: MedusaShippingOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [moneticoForm, setMoneticoForm] = useState<MoneticoForm | null>(null);

  // Un visiteur non connecté choisit d'abord entre commander avec un compte ou en invité.
  // Un panier déjà renseigné signale un tunnel repris en cours : on ne redemande pas.
  const [asGuest, setAsGuest] = useState(Boolean(cart.shipping_address && cart.email));

  const savedAddress =
    customer?.addresses?.find((a) => a.is_default_shipping) ?? customer?.addresses?.[0];

  const [email, setEmail] = useState(cart.email ?? customer?.email ?? "");
  const [shippingAddress, setShippingAddress] = useState<MedusaAddress>(
    cart.shipping_address ??
      (savedAddress
        ? {
            first_name: savedAddress.first_name ?? "",
            last_name: savedAddress.last_name ?? "",
            address_1: savedAddress.address_1 ?? "",
            address_2: savedAddress.address_2 ?? "",
            postal_code: savedAddress.postal_code ?? "",
            city: savedAddress.city ?? "",
            phone: savedAddress.phone ?? "",
            country_code: savedAddress.country_code ?? "fr",
          }
        : {
            ...EMPTY_ADDRESS,
            first_name: customer?.first_name ?? "",
            last_name: customer?.last_name ?? "",
          })
  );
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState<MedusaAddress>(
    cart.billing_address ?? EMPTY_ADDRESS
  );

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    cart.shipping_methods[0]?.shipping_option_id ?? null
  );

  const addressesSaved = Boolean(cart.shipping_address && cart.email);
  const shippingSelected = cart.shipping_methods.length > 0;

  const handleSaveAddresses = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const billing = sameAsBilling ? shippingAddress : billingAddress;
      const result = await setAddressesAction(email, shippingAddress, billing);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleSelectShipping = (optionId: string) => {
    setSelectedOptionId(optionId);
    startTransition(async () => {
      const result = await setShippingMethodAction(optionId);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  // La commande n'est pas créée ici : on ouvre une session Monetico et on laisse le
  // navigateur poster le formulaire scellé vers la page de paiement sécurisé.
  const handlePay = () => {
    startTransition(async () => {
      const result = await startMoneticoPaymentAction();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setMoneticoForm(result.form);
    });
  };

  const canPay = addressesSaved && shippingSelected;

  if (!customer && !asGuest) {
    return <CheckoutGate onGuest={() => setAsGuest(true)} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Adresse */}
      <section className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">
          1. Adresse de livraison
        </h2>
        <form onSubmit={handleSaveAddresses} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-brand-chocolate">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark"
            />
          </div>

          <AddressForm value={shippingAddress} onChange={setShippingAddress} idPrefix="shipping" />

          <label className="flex items-center gap-2 text-sm text-brand-chocolate">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => setSameAsBilling(e.target.checked)}
              className="cursor-pointer"
            />
            Adresse de facturation identique à l&apos;adresse de livraison
          </label>

          {!sameAsBilling && (
            <div className="border-t border-brand-chocolate/10 pt-4">
              <h3 className="mb-4 text-sm font-semibold text-brand-chocolate">
                Adresse de facturation
              </h3>
              <AddressForm value={billingAddress} onChange={setBillingAddress} idPrefix="billing" />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-fit cursor-pointer rounded-lg bg-brand-chocolate px-6 py-2.5 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : "Valider l'adresse"}
          </button>
        </form>
      </section>

      {/* Transporteur */}
      <section className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">2. Transporteur</h2>
        {!addressesSaved ? (
          <p className="text-sm text-brand-chocolate/60">
            Valide d&apos;abord ton adresse de livraison.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-brand-chocolate/15 px-4 py-3 has-[:checked]:border-brand-gold-dark"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_option"
                    checked={selectedOptionId === option.id}
                    onChange={() => handleSelectShipping(option.id)}
                    disabled={isPending}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium text-brand-chocolate">{option.name}</span>
                </span>
                <span className="text-sm text-brand-chocolate/70">
                  {option.calculated_price
                    ? formatPrice(option.calculated_price.calculated_amount, cart.currency_code)
                    : "—"}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Récapitulatif */}
      <section className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">3. Récapitulatif</h2>
        <div className="flex flex-col gap-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-chocolate/80">
                {item.product_title}
                {item.variant_title ? ` — ${item.variant_title}` : ""} × {item.quantity}
              </span>
              <span className="text-brand-chocolate">
                {formatPrice(item.total, cart.currency_code)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-brand-chocolate/10 pt-4 text-sm">
          <div className="flex justify-between text-brand-chocolate/70">
            <span>Sous-total</span>
            <span>{formatPrice(cart.item_total, cart.currency_code)}</span>
          </div>
          <div className="flex justify-between text-brand-chocolate/70">
            <span>Livraison</span>
            <span>{formatPrice(cart.shipping_total, cart.currency_code)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold text-brand-chocolate">
            <span>Total</span>
            <span>{formatPrice(cart.total, cart.currency_code)}</span>
          </div>
        </div>

        {moneticoForm ? (
          <div className="mt-6">
            <MoneticoPaymentForm form={moneticoForm} />
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={!canPay || isPending}
            className="mt-6 w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Traitement..." : "Payer"}
          </button>
        )}

        {!customer && (
          <p className="mt-3 text-center text-sm text-brand-chocolate/60">
            Vous commandez en tant qu&apos;invité.{" "}
            <Link
              href="/compte/inscription?redirect=/checkout"
              className="text-brand-gold-dark hover:underline"
            >
              Créer un compte
            </Link>{" "}
            pour retrouver cette commande plus tard.
          </p>
        )}
      </section>
    </div>
  );
}
