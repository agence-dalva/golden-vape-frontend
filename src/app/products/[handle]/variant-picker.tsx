"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { MedusaProduct } from "@/lib/medusa";
import { formatPrice, getDisplayAmount } from "@/lib/medusa";
import { addToCartAction } from "@/lib/cart-actions";

export default function VariantPicker({
  product,
  cartVariantIds,
  selectedVariantId,
  onSelectVariant,
}: {
  product: MedusaProduct;
  cartVariantIds: string[];
  selectedVariantId: string | undefined;
  onSelectVariant: (variantId: string) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;
  const option = product.options[0];
  const unitPrice = selectedVariant?.calculated_price;
  const alreadyInCart = selectedVariant ? cartVariantIds.includes(selectedVariant.id) : false;
  const stock = selectedVariant?.inventory_quantity ?? null;
  const outOfStock = stock !== null && stock <= 0;

  const handleSelectVariant = (variantId: string) => {
    onSelectVariant(variantId);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    startTransition(async () => {
      try {
        await addToCartAction(selectedVariant.id, quantity);
        const variantLabel = selectedVariant.options[0]?.value;
        const label = variantLabel ? `${product.title} — ${variantLabel}` : product.title;
        toast.success("Ajouté au panier", {
          description: `${label} · Qté ${quantity} · ${
            unitPrice ? formatPrice(getDisplayAmount(unitPrice) * quantity, unitPrice.currency_code) : ""
          }`,
        });
      } catch {
        toast.error("Impossible d'ajouter cet article au panier");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {unitPrice && (
        <div>
          <p className="text-2xl font-semibold text-brand-chocolate">
            {formatPrice(getDisplayAmount(unitPrice), unitPrice.currency_code)}
          </p>
          {stock !== null && (
            <p className={`mt-1 text-sm ${outOfStock ? "text-red-600" : "text-brand-chocolate/60"}`}>
              {outOfStock
                ? "Rupture de stock"
                : stock <= 5
                  ? `Plus que ${stock} en stock`
                  : "En stock"}
            </p>
          )}
        </div>
      )}

      {hasMultipleVariants && option && (
        <div>
          <p className="text-sm font-medium text-brand-chocolate mb-2">{option.title}</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const label = variant.options[0]?.value ?? variant.title;
              return (
                <button
                  key={variant.id}
                  onClick={() => handleSelectVariant(variant.id)}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-brand-gold-dark bg-brand-gold text-brand-chocolate"
                      : "border-brand-chocolate/15 text-brand-chocolate/70 hover:border-brand-gold-dark"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-brand-chocolate mb-2">Quantité</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-brand-chocolate/15 text-brand-chocolate hover:border-brand-gold-dark transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-medium text-brand-chocolate tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Augmenter la quantité"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-brand-chocolate/15 text-brand-chocolate hover:border-brand-gold-dark transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {unitPrice && (
        <div className="flex items-baseline justify-between border-t border-brand-chocolate/10 pt-4">
          <span className="text-sm text-brand-chocolate/70">Total</span>
          <span className="text-xl font-semibold text-brand-chocolate tabular-nums">
            {formatPrice(getDisplayAmount(unitPrice) * quantity, unitPrice.currency_code)}
          </span>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={alreadyInCart || outOfStock || isPending || !selectedVariant}
        className="w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {alreadyInCart
          ? "Vous avez déjà cet article dans votre panier"
          : outOfStock
            ? "Rupture de stock"
            : isPending
              ? "Ajout en cours..."
              : "Ajouter au panier"}
      </button>
    </div>
  );
}
