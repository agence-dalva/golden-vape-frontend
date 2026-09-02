"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Pencil } from "lucide-react";
import type { MedusaCart, MedusaAddress } from "@/lib/medusa-cart";
import type { MedusaCustomer } from "@/lib/medusa-customer";
import type { MedusaShippingOption, MoneticoPaymentForm as MoneticoForm } from "@/lib/medusa-checkout";
import { formatPrice } from "@/lib/medusa";
import { setAddressesAction, setShippingMethodAction, startMoneticoPaymentAction } from "@/lib/checkout-actions";
import AddressForm from "@/components/address-form";
import MoneticoPaymentForm from "@/components/monetico-payment-form";

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

const cardClass = "rounded-xl border border-brand-chocolate/10 bg-white p-6";

function isComplete(address: MedusaAddress): boolean {
  return Boolean(
    address.first_name && address.last_name && address.address_1 && address.postal_code && address.city
  );
}

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
  const [editingAddress, setEditingAddress] = useState(false);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    cart.shipping_methods[0]?.shipping_option_id ?? null
  );

  const addressesSaved = Boolean(cart.shipping_address && cart.email);
  const shippingSelected = cart.shipping_methods.length > 0;

  // Une adresse déjà connue — celle du compte, ou celle que le panier porte déjà — est
  // affichée en résumé plutôt qu'en formulaire complet. Le visiteur invité qui commande
  // pour la première fois voit bien le formulaire.
  const showSummary =
    !editingAddress && isComplete(shippingAddress) && (Boolean(savedAddress) || addressesSaved);

  const saveAddresses = () => {
    startTransition(async () => {
      const billing = sameAsBilling ? shippingAddress : billingAddress;
      const result = await setAddressesAction(email, shippingAddress, billing);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setEditingAddress(false);
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      {/* Colonne gauche — adresse */}
      <section className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-chocolate">
            1. Adresse de livraison
          </h2>
          {addressesSaved && !editingAddress && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-chocolate/60">
              <Check size={14} strokeWidth={3} className="text-brand-gold-dark" />
              Enregistrée
            </span>
          )}
        </div>

        {showSummary ? (
          <div className="flex flex-col gap-4">
            <address className="not-italic text-sm leading-relaxed text-brand-chocolate/80">
              <span className="block font-medium text-brand-chocolate">
                {shippingAddress.first_name} {shippingAddress.last_name}
              </span>
              <span className="block">{shippingAddress.address_1}</span>
              {shippingAddress.address_2 && <span className="block">{shippingAddress.address_2}</span>}
              <span className="block">
                {shippingAddress.postal_code} {shippingAddress.city}
              </span>
              {shippingAddress.phone && <span className="block">{shippingAddress.phone}</span>}
              {email && <span className="mt-2 block text-brand-chocolate/60">{email}</span>}
            </address>

            <div className="flex flex-wrap items-center gap-3">
              {!addressesSaved && (
                <button
                  onClick={saveAddresses}
                  disabled={isPending}
                  className="cursor-pointer rounded-lg bg-brand-chocolate px-5 py-2.5 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Enregistrement..." : "Utiliser cette adresse"}
                </button>
              )}
              <button
                onClick={() => setEditingAddress(true)}
                className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-gold-dark hover:underline"
              >
                <Pencil size={14} />
                Modifier
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveAddresses();
            }}
            className="flex flex-col gap-4"
          >
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

            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-lg bg-brand-chocolate px-6 py-2.5 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Enregistrement..." : "Valider l'adresse"}
              </button>
              {editingAddress && addressesSaved && (
                <button
                  type="button"
                  onClick={() => setEditingAddress(false)}
                  className="cursor-pointer text-sm text-brand-chocolate/60 hover:underline"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      {/* Colonne droite — transporteur et récapitulatif */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6">
        <section className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">2. Transporteur</h2>
          {!addressesSaved ? (
            <p className="text-sm text-brand-chocolate/60">
              Validez d&apos;abord votre adresse de livraison.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-brand-chocolate/15 px-4 py-3 has-[:checked]:border-brand-gold-dark"
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
                  <span className="shrink-0 text-sm text-brand-chocolate/70">
                    {option.calculated_price
                      ? formatPrice(option.calculated_price.calculated_amount, cart.currency_code)
                      : "—"}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-brand-chocolate">3. Récapitulatif</h2>
          <div className="flex flex-col gap-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-brand-chocolate/80">
                  {item.product_title}
                  {item.variant_title ? ` — ${item.variant_title}` : ""} × {item.quantity}
                </span>
                <span className="shrink-0 text-brand-chocolate tabular-nums">
                  {formatPrice(item.total, cart.currency_code)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-1 border-t border-brand-chocolate/10 pt-4 text-sm">
            <div className="flex justify-between text-brand-chocolate/70">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatPrice(cart.item_total, cart.currency_code)}</span>
            </div>
            <div className="flex justify-between text-brand-chocolate/70">
              <span>Livraison</span>
              <span className="tabular-nums">
                {formatPrice(cart.shipping_total, cart.currency_code)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-brand-chocolate">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(cart.total, cart.currency_code)}</span>
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
              className="mt-6 w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Traitement..." : "Payer"}
            </button>
          )}

          {!customer && (
            <p className="mt-3 text-center text-xs text-brand-chocolate/60">
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
    </div>
  );
}
