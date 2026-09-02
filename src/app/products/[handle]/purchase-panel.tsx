"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, Loader2, ShieldCheck, Truck, Headset, Package } from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";
import { formatPrice, getDisplayAmount } from "@/lib/medusa";
import { addToCartAction } from "@/lib/cart-actions";

const LOW_STOCK_THRESHOLD = 5;

const BENEFITS = [
  { icon: ShieldCheck, label: "Paiement 100 % sécurisé" },
  { icon: Truck, label: "Expédition sous 24/48h" },
  { icon: Headset, label: "Conseils d'experts" },
];

/** « 10 ml », « 50ml » → 10, 50. `null` si la contenance n'est pas exploitable. */
function parseVolumeMl(contenance: string | null): number | null {
  if (!contenance) return null;
  const match = contenance.replace(",", ".").match(/([\d.]+)\s*ml/i);
  const value = match ? Number(match[1]) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

export default function PurchasePanel({
  product,
  brand,
  tagline,
  contenance,
  cartVariantIds,
}: {
  product: MedusaProduct;
  brand: string | null;
  tagline: string | null;
  contenance: string | null;
  cartVariantIds: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const variants = product.variants ?? [];
  const selected = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const price = selected?.calculated_price ?? null;
  const stock = selected?.inventory_quantity ?? null;
  const soldOut = stock !== null && stock <= 0;
  const alreadyInCart = selected ? cartVariantIds.includes(selected.id) : false;

  // Le stock plafonne la quantité, mais seulement lorsqu'il est connu.
  const maxQuantity = stock !== null && stock > 0 ? stock : Infinity;

  const volumeMl = parseVolumeMl(contenance);
  const pricePer100 =
    price && volumeMl ? (getDisplayAmount(price) / volumeMl) * 100 : null;

  const optionTitle = product.options[0]?.title ?? "déclinaison";

  const selectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    // Le stock d'une déclinaison ne dit rien de celui d'une autre : on repart de 1.
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selected) return;

    startTransition(async () => {
      const result = await addToCartAction(selected.id, quantity);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
      toast.success("Ajouté au panier", {
        description: `${product.title}${
          selected.options[0]?.value ? ` — ${selected.options[0].value}` : ""
        } · Qté ${quantity}`,
      });
    });
  };

  return (
    <div className="flex flex-col">
      {brand && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-gv-800">{brand}</p>
      )}

      <h1 className="font-display text-[36px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text lg:text-[46px]">
        {product.title}
      </h1>

      {tagline && <p className="mt-2.5 text-sm leading-relaxed text-gv-text-soft">{tagline}</p>}

      {price ? (
        <>
          <p className="mt-[22px] text-[32px] font-semibold leading-tight text-gv-text">
            {formatPrice(getDisplayAmount(price), price.currency_code)}
          </p>
          {pricePer100 && (
            <p className="mt-1 text-[13px] text-gv-text-soft">
              {formatPrice(pricePer100, price.currency_code)} / 100 ml
            </p>
          )}
        </>
      ) : (
        <p className="mt-[22px] text-sm text-gv-text-muted">Prix indisponible</p>
      )}

      {stock !== null && (
        <p
          className={`mt-3.5 flex items-center gap-2 text-[13px] font-medium ${
            soldOut ? "text-[var(--gv-danger)]" : "text-[var(--gv-success)]"
          }`}
        >
          <span
            aria-hidden
            className={`h-[7px] w-[7px] rounded-full ${
              soldOut ? "bg-[var(--gv-danger)]" : "bg-[var(--gv-success)]"
            }`}
          />
          {soldOut
            ? "Indisponible"
            : stock <= LOW_STOCK_THRESHOLD
              ? `Plus que ${stock} en stock`
              : "En stock"}
        </p>
      )}

      <hr className="mb-[22px] mt-6 border-gv-border" />

      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-gv-text">
            Choisissez votre {optionTitle.toLowerCase()}
          </legend>
          <div
            role="radiogroup"
            aria-label={`Choisissez votre ${optionTitle.toLowerCase()}`}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {variants.map((variant) => {
              const isSelected = variant.id === selected?.id;
              const unavailable =
                variant.inventory_quantity !== null && variant.inventory_quantity <= 0;

              return (
                <button
                  key={variant.id}
                  role="radio"
                  aria-checked={isSelected}
                  // Une déclinaison en rupture reste visible : la masquer laisserait croire
                  // qu'elle n'existe pas.
                  disabled={unavailable}
                  onClick={() => selectVariant(variant.id)}
                  className={`min-h-[50px] cursor-pointer rounded-[7px] border px-2 text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? "border-gv-800 bg-gv-800 text-white shadow-[0_7px_18px_rgb(68_54_46/0.16)]"
                      : "border-gv-border-strong bg-white text-gv-text hover:border-gv-800"
                  } ${unavailable ? "cursor-not-allowed line-through opacity-45" : ""}`}
                >
                  {variant.options[0]?.value ?? variant.title}
                  {unavailable && <span className="sr-only"> — indisponible</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[128px_minmax(0,1fr)]">
        <div className="flex h-[52px] w-full items-center justify-between rounded-[7px] border border-gv-border-strong bg-white sm:w-32">
          <button
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuer la quantité"
            className="flex h-full w-10 cursor-pointer items-center justify-center text-gv-text disabled:cursor-not-allowed disabled:text-gv-text-muted"
          >
            <Minus size={16} aria-hidden />
          </button>
          <span aria-live="polite" className="text-sm font-semibold tabular-nums text-gv-text">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="Augmenter la quantité"
            className="flex h-full w-10 cursor-pointer items-center justify-center text-gv-text disabled:cursor-not-allowed disabled:text-gv-text-muted"
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={soldOut || isPending || !selected}
          aria-label={`Ajouter ${product.title} au panier`}
          className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-[7px] border border-gv-800 bg-gv-800 px-6 text-[15px] font-semibold text-white shadow-[0_9px_24px_rgb(68_54_46/0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-gv-900 hover:shadow-[0_13px_30px_rgb(68_54_46/0.22)] disabled:cursor-not-allowed disabled:border-gv-border disabled:bg-gv-image disabled:text-gv-text-muted disabled:shadow-none disabled:hover:translate-y-0"
        >
          {isPending ? (
            <>
              <Loader2 size={18} aria-hidden className="animate-spin" />
              Ajout en cours…
            </>
          ) : (
            <>
              <ShoppingBag size={18} aria-hidden />
              {soldOut ? "Produit indisponible" : justAdded ? "Ajouté au panier" : "Ajouter au panier"}
            </>
          )}
        </button>
      </div>

      {/* Un article déjà au panier reste achetable : simple rappel, pas de blocage. */}
      {alreadyInCart && (
        <p aria-live="polite" className="mt-3 text-[13px] text-gv-text-soft">
          Déjà dans votre panier ·{" "}
          <Link href="/cart" className="font-semibold text-gv-800 underline-offset-4 hover:underline">
            Voir mon panier
          </Link>
        </p>
      )}

      <p className="mt-3.5 flex items-center justify-center gap-2 text-[13px] text-gv-text-soft">
        <Package size={16} aria-hidden />
        Expédition sous 24/48h
      </p>

      <ul className="mt-6 grid grid-cols-3 border-t border-gv-border pt-[22px]">
        {BENEFITS.map(({ icon: Icon, label }, index) => (
          <li
            key={label}
            className={`flex flex-col items-center gap-2 px-2 text-center ${
              index > 0 ? "border-l border-gv-border" : ""
            }`}
          >
            <Icon size={24} strokeWidth={1.5} aria-hidden className="text-gv-800" />
            <span className="text-[11px] leading-snug text-gv-text-soft sm:text-xs">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
