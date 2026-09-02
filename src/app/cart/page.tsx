import Link from "next/link";
import { ShoppingBag, Truck, ShieldCheck, Headset, Lock, ArrowRight } from "lucide-react";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { formatPrice, listLatestProducts } from "@/lib/medusa";
import Breadcrumbs from "@/components/breadcrumbs";
import CheckoutStepper from "@/components/checkout-stepper";
import EmptyState from "@/components/empty-state";
import SectionHeading from "@/components/section-heading";
import ProductSlider from "@/components/product-slider";
import CartItem from "./cart-item";
import PromoCode from "./promo-code";

const BENEFITS = [
  { icon: Truck, label: "Expédition sous 24/48h" },
  { icon: ShieldCheck, label: "Paiement sécurisé" },
  { icon: Headset, label: "Conseils d'experts" },
];

export default async function CartPage() {
  const [cart, customer] = await Promise.all([getCurrentCart(), getCurrentCustomer()]);
  const items = cart?.items ?? [];

  if (items.length === 0) {
    // Le catalogue prend le relais d'un panier vide : une page presque blanche n'aide personne.
    const suggestions = await listLatestProducts(8).catch(() => []);

    return (
      <div className="gv-container pb-16">
        <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Panier" }]} />
        <h1 className="mb-8 font-display text-[36px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text lg:text-[44px]">
          Votre panier
        </h1>

        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          description="Découvrez notre sélection de produits et trouvez ceux qui vous correspondent."
          primary={{ label: "Découvrir la boutique", href: "/categories" }}
        />

        {suggestions.length > 0 && (
          <section className="mt-14">
            <SectionHeading title="Nos dernières nouveautés" />
            <ProductSlider products={suggestions} label="Nouveautés" />
          </section>
        )}
      </div>
    );
  }

  const currency = cart!.currency_code;
  // Un client connecté n'a pas à choisir entre compte et commande invité.
  const checkoutHref = customer ? "/checkout" : "/checkout/identification";
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="gv-container pb-16">
      <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Panier" }]} />
      <CheckoutStepper current={1} />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[36px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text lg:text-[44px]">
            Votre panier
          </h1>
          <p className="mt-2 text-sm text-gv-text-soft">
            {itemCount} article{itemCount > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/categories"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gv-800"
        >
          Continuer mes achats
          <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div>
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                currencyCode={currency}
                productHandle={item.product_handle ?? null}
              />
            ))}
          </ul>

          <ul className="mt-4 grid grid-cols-1 rounded-[10px] border border-gv-border bg-gv-card sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, label }, index) => (
              <li
                key={label}
                className={`flex min-h-[68px] items-center justify-center gap-2.5 px-4 py-3 text-center ${
                  index > 0 ? "border-t border-gv-border sm:border-l sm:border-t-0" : ""
                }`}
              >
                <Icon size={24} strokeWidth={1.5} aria-hidden className="shrink-0 text-gv-800" />
                <span className="text-[13px] text-gv-text">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-6">
          <section className="rounded-xl border border-gv-border bg-gv-card p-6 shadow-gv-sm">
            <h2 className="mb-6 text-lg font-semibold tracking-[-0.01em] text-gv-text">Récapitulatif</h2>

            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between gap-5">
                <dt className="text-gv-text-soft">Sous-total</dt>
                <dd className="tabular-nums text-gv-text">{formatPrice(cart!.item_total, currency)}</dd>
              </div>

              {/* La ligne de remise n'apparaît qu'en présence d'une réduction réelle. */}
              {cart!.discount_total > 0 && (
                <div className="flex justify-between gap-5">
                  <dt className="text-gv-text-soft">Réduction</dt>
                  <dd className="tabular-nums text-[var(--gv-success)]">
                    −{formatPrice(cart!.discount_total, currency)}
                  </dd>
                </div>
              )}

              <div className="flex justify-between gap-5">
                <dt className="text-gv-text-soft">Livraison</dt>
                <dd className="text-right text-gv-text-soft">
                  {cart!.shipping_total > 0
                    ? formatPrice(cart!.shipping_total, currency)
                    : "Calculée à l'étape suivante"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-gv-border pt-5">
              <span className="text-lg font-semibold tracking-[-0.01em] text-gv-text">Total</span>
              <span className="text-[30px] font-semibold tabular-nums text-gv-text">
                {formatPrice(cart!.total, currency)}
              </span>
            </div>
            <p className="mt-1 text-right text-xs text-gv-text-soft">Taxes incluses</p>

            <Link
              href={checkoutHref}
              className="mt-6 flex min-h-[54px] items-center justify-center rounded-[7px] border border-gv-800 bg-gv-800 px-6 text-[15px] font-semibold text-white shadow-[0_9px_24px_rgb(68_54_46/0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-gv-900"
            >
              Passer la commande
            </Link>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gv-text-soft">
              <Lock size={14} aria-hidden />
              Paiement 100 % sécurisé
            </p>
          </section>

          <PromoCode applied={cart!.promotions ?? []} />
        </div>
      </div>
    </div>
  );
}
