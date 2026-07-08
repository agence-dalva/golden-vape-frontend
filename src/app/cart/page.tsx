import Link from "next/link";
import Image from "next/image";
import { getCurrentCart } from "@/lib/cart-actions";
import { formatPrice } from "@/lib/medusa";
import { getLineItemImage } from "@/lib/medusa-cart";
import CartLineControls from "./cart-line-controls";

export default async function CartPage() {
  const cart = await getCurrentCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate mb-2">
          Votre panier est vide
        </h1>
        <p className="text-sm text-brand-chocolate/70 mb-6">
          Découvrez nos produits et ajoutez-les à votre panier.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate mb-8">
        Votre panier
      </h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const imageUrl = getLineItemImage(item);
          return (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-brand-chocolate/10 bg-white p-4"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-cream">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.product_title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-brand-chocolate/40">
                  Pas d&apos;image
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-brand-chocolate">{item.product_title}</p>
              {item.variant_title && (
                <p className="text-xs text-brand-chocolate/60">{item.variant_title}</p>
              )}
              <p className="mt-1 text-sm text-brand-chocolate/70">
                {formatPrice(item.unit_price, cart!.currency_code)}
              </p>
            </div>

            <CartLineControls lineId={item.id} quantity={item.quantity} />

            <p className="w-24 text-right text-sm font-semibold text-brand-chocolate tabular-nums">
              {formatPrice(item.total, cart!.currency_code)}
            </p>
          </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-brand-chocolate/10 pt-6">
        <span className="text-sm text-brand-chocolate/70">Total</span>
        <span className="text-2xl font-semibold text-brand-chocolate tabular-nums">
          {formatPrice(cart!.total, cart!.currency_code)}
        </span>
      </div>

      <button
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream opacity-50"
      >
        Commander (bientôt disponible)
      </button>
    </div>
  );
}
