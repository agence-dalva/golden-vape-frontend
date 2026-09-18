import Link from "next/link";
import { ShoppingBag, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { listLatestProducts } from "@/lib/medusa";
import Breadcrumbs from "@/components/breadcrumbs";
import CheckoutStepper from "@/components/checkout-stepper";
import EmptyState from "@/components/empty-state";
import SectionHeading from "@/components/section-heading";
import ProductSlider from "@/components/product-slider";
import CartItem from "./cart-item";
import CartSummary from "./cart-summary";
import { CartActivity } from "./cart-activity";
import PromoCode from "./promo-code";
import PageTransition from "@/components/page-transition";

const BENEFITS = [
  { icon: Truck, label: "Expédition sous 24/48h" },
  { icon: ShieldCheck, label: "Paiement sécurisé" },
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
    <PageTransition>
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

      <CartActivity>
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

          <ul className="mt-4 grid grid-cols-1 rounded-[10px] bg-gv-card shadow-gv-raised sm:grid-cols-3">
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
          <CartSummary
            itemTotal={cart!.item_total}
            discountTotal={cart!.discount_total}
            shippingTotal={cart!.shipping_total}
            total={cart!.total}
            currencyCode={currency}
            checkoutHref={checkoutHref}
          />

          <PromoCode applied={cart!.promotions ?? []} />
        </div>
      </div>
      </CartActivity>
    </div>
    </PageTransition>
  );
}
