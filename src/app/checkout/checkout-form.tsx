"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Check, Leaf, Lock, MapPin, Pencil, Truck } from "lucide-react";
import {
  getLineItemImage,
  tauxToutesTaxes,
  type MedusaCart,
  type MedusaAddress,
} from "@/lib/medusa-cart";
import type { MedusaCustomer } from "@/lib/medusa-customer";
import type { MedusaShippingOption, MoneticoPaymentForm as MoneticoForm } from "@/lib/medusa-checkout";
import { formatPrice } from "@/lib/medusa";
import { setAddressesAction, setShippingMethodAction, startMoneticoPaymentAction } from "@/lib/checkout-actions";
import AddressForm from "@/components/address-form";
import MoneticoPaymentForm from "@/components/monetico-payment-form";
import CheckoutStepper from "@/components/checkout-stepper";
import DeliveryPicker from "@/components/delivery-picker";
import type { ServicePoint } from "@/lib/service-points";

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

// Le filet delimite, l'ombre detache : les deux ensemble, tres discrets, pour une carte
// qui se lit comme un bloc sans peser sur la page.
const cardClass =
  "rounded-[10px] border border-brand-chocolate/10 bg-white p-5 shadow-[0_3px_14px_rgba(40,30,25,0.04)]";

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
  const [servicePoint, setServicePoint] = useState<ServicePoint | null>(null);

  const addressesSaved = Boolean(cart.shipping_address && cart.email);
  const shippingSelected = cart.shipping_methods.length > 0;

  const selectedOption = shippingOptions.find((o) => o.id === selectedOptionId) ?? null;
  const besoinPointRelais = Boolean(selectedOption?.data?.is_service_point_required);
  // Le repere de progression doit dire la verite : choisir un point relais est une etape
  // de plus, et la masquer promettrait un paiement immediat qui n'arrive pas.
  const etapes = besoinPointRelais
    ? ["Panier", "Livraison", "Point relais", "Paiement"]
    : ["Panier", "Livraison", "Paiement"];

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

    const option = shippingOptions.find((o) => o.id === optionId);

    // Une livraison en point relais ne peut pas etre posee tant que le point n'est pas
    // choisi : Medusa la refuserait. On attend donc la selection dans le selecteur.
    if (option?.data?.is_service_point_required) {
      setServicePoint(null);
      return;
    }

    startTransition(async () => {
      const result = await setShippingMethodAction(optionId);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleSelectServicePoint = (point: ServicePoint) => {
    setServicePoint(point);

    if (!selectedOptionId) return;

    // L'identifiant retenu est celui du reseau correspondant au service choisi — un meme
    // commerce peut servir les deux, avec un identifiant different pour chacun.
    const reseau =
      point.carriers.find((c) => c.code === selectedOption?.data?.carrier_code) ??
      point.carriers[0];

    startTransition(async () => {
      const result = await setShippingMethodAction(selectedOptionId, {
        service_point_id: reseau.sendcloud_id,
        service_point_name: point.name,
        service_point_carrier: reseau.code,
      });
      if (result.error) {
        toast.error(result.error);
        setServicePoint(null);
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

  const canPay = addressesSaved && shippingSelected && (!besoinPointRelais || Boolean(servicePoint));

  return (
    <>
      <CheckoutStepper
        current={besoinPointRelais ? 3 : 2}
        steps={etapes}
        backHref="/cart"
        backLabel="Revenir au panier"
      />

      <header className="mb-7">
        <h1 className="font-display text-[30px] font-normal leading-[1.1] tracking-[0.01em] text-gv-text sm:text-[34px]">
          Commander
        </h1>
        <p className="mt-1 text-sm text-gv-text-soft">
          {besoinPointRelais && !servicePoint
            ? "Finalisez votre commande en choisissant votre point relais."
            : "Vérifiez vos informations avant de régler votre commande."}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.95fr)] lg:items-start">
      {/* Colonne gauche — les etapes a completer, dans l'ordre */}
      <div className="flex flex-col gap-5">
      <section className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[15px] font-semibold text-gv-text">1. Adresse de livraison</h2>
          {addressesSaved && !editingAddress && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
              <Check size={12} strokeWidth={3} />
              Enregistrée
            </span>
          )}
        </div>

        {showSummary ? (
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gv-50"
            >
              <MapPin size={16} className="text-gv-800" />
            </span>

            <address className="min-w-0 flex-1 not-italic text-[13.5px] leading-[1.55] text-gv-text-soft">
              <span className="block font-semibold text-gv-text">
                {shippingAddress.first_name} {shippingAddress.last_name}
              </span>
              <span className="block">{shippingAddress.address_1}</span>
              {shippingAddress.address_2 && <span className="block">{shippingAddress.address_2}</span>}
              <span className="block">
                {shippingAddress.postal_code} {shippingAddress.city}
              </span>
              {shippingAddress.phone && <span className="block">Tél. {shippingAddress.phone}</span>}
              {email && <span className="block">{email}</span>}
            </address>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {!addressesSaved && (
                <button
                  onClick={saveAddresses}
                  disabled={isPending}
                  className="cursor-pointer rounded-md bg-gv-800 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gv-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Enregistrement…" : "Utiliser cette adresse"}
                </button>
              )}
              <button
                onClick={() => setEditingAddress(true)}
                className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-gv-text-soft transition-colors hover:text-gv-text"
              >
                <Pencil size={13} />
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

      <section className={cardClass}>
        <h2 className="mb-4 text-[15px] font-semibold text-gv-text">2. Livraison</h2>
        {!addressesSaved ? (
          <p className="text-[13.5px] text-gv-text-soft">
            Validez d&apos;abord votre adresse de livraison.
          </p>
        ) : (
          <DeliveryPicker
            options={shippingOptions}
            currencyCode={cart.currency_code}
            selectedOptionId={selectedOptionId}
            servicePoint={servicePoint}
            onSelectOption={handleSelectShipping}
            onSelectServicePoint={handleSelectServicePoint}
            disabled={isPending}
            postalCode={shippingAddress.postal_code ?? undefined}
            city={shippingAddress.city ?? undefined}
            taxRate={tauxToutesTaxes(cart)}
          />
        )}
      </section>
      </div>

      {/* Colonne droite — recapitulatif et reassurance, qui suivent le defilement */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        <section className={cardClass}>
          <h2 className="mb-4 text-[15px] font-semibold text-gv-text">Récapitulatif</h2>

          <ul className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                {getLineItemImage(item) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getLineItemImage(item)!}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border border-brand-chocolate/10 bg-white object-contain p-1"
                  />
                ) : (
                  <span className="h-12 w-12 shrink-0 rounded-md bg-gv-50" />
                )}
                <span className="min-w-0 flex-1 text-[13px] leading-snug text-gv-text">
                  {item.product_title}
                  {item.variant_title ? ` — ${item.variant_title}` : ""}
                  <span className="mt-0.5 block text-gv-text-soft">× {item.quantity}</span>
                </span>
                <span className="shrink-0 text-[13px] font-medium tabular-nums text-gv-text">
                  {formatPrice(item.total, cart.currency_code)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-1.5 border-t border-brand-chocolate/10 pt-4 text-[13px]">
            <div className="flex justify-between text-gv-text-soft">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatPrice(cart.item_total, cart.currency_code)}</span>
            </div>
            <div className="flex justify-between text-gv-text-soft">
              {/* Le nom vient de l'option choisie : rien n'est ecrit en dur ici, et le
                  montant est celui que Medusa a pose sur le panier. */}
              <span>
                Livraison
                {selectedOption ? ` (${selectedOption.name})` : ""}
              </span>
              <span className="tabular-nums">
                {formatPrice(cart.shipping_total, cart.currency_code)}
              </span>
            </div>
          </div>

          {servicePoint && besoinPointRelais && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-gv-50/70 p-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gv-800" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11.5px] text-gv-text-soft">
                  Point relais sélectionné
                </span>
                <span className="block truncate text-[13px] font-semibold text-gv-text">
                  {servicePoint.name}
                </span>
                <span className="block text-[11.5px] uppercase leading-snug text-gv-text-soft">
                  {servicePoint.address.house_number} {servicePoint.address.street},{" "}
                  {servicePoint.address.postal_code} {servicePoint.address.city}
                </span>
              </span>
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between border-t border-brand-chocolate/10 pt-4">
            <span className="text-[17px] font-semibold text-gv-text">Total</span>
            <span className="text-right">
              <span className="block text-[19px] font-semibold tabular-nums text-gv-text">
                {formatPrice(cart.total, cart.currency_code)}
              </span>
              <span className="block text-[11px] text-gv-text-soft">TTC</span>
            </span>
          </div>

          {moneticoForm ? (
            <div className="mt-5">
              <MoneticoPaymentForm form={moneticoForm} />
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={!canPay || isPending}
              className="mt-5 flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gv-800 text-[14px] font-medium text-white transition-colors hover:bg-gv-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Traitement…" : "Continuer vers le paiement"}
              {!isPending && <ArrowRight size={16} />}
            </button>
          )}

          {!customer && (
            <p className="mt-3 text-center text-[11.5px] text-gv-text-soft">
              Vous commandez en tant qu&apos;invité.{" "}
              <Link href="/compte/inscription?redirect=/checkout" className="underline">
                Créer un compte
              </Link>{" "}
              pour retrouver cette commande plus tard.
            </p>
          )}
        </section>

        {/* Reassurance : trois reperes, sans cadre, pour ne pas concurrencer le bouton. */}
        <div className="grid grid-cols-3 gap-2 px-1">
          {[
            { Icone: Leaf, l1: "Produits", l2: "de qualité" },
            { Icone: Truck, l1: "Livraison rapide", l2: "et suivie" },
            { Icone: Lock, l1: "Paiement", l2: "100% sécurisé" },
          ].map(({ Icone, l1, l2 }) => (
            <div key={l1} className="flex flex-col items-center gap-1.5 text-center">
              <Icone size={17} className="text-gv-500" />
              <span className="text-[11px] leading-tight text-gv-text-soft">
                {l1}
                <br />
                {l2}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-[10px] border border-brand-chocolate/10 bg-gv-50/50 p-4">
          <div className="flex items-start gap-2.5">
            <Leaf size={15} className="mt-0.5 shrink-0 text-gv-500" />
            <div>
              <p className="text-[13px] font-semibold text-gv-text">Une question ?</p>
              <p className="mt-0.5 text-[12px] leading-snug text-gv-text-soft">
                Notre équipe est à votre écoute du lundi au vendredi de 9h à 18h.
              </p>
              <Link
                href="/contact"
                className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-gv-800 hover:underline"
              >
                Nous contacter
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
