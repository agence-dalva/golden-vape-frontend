"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import type { MedusaCartLineItem } from "@/lib/medusa-cart";
import { getLineItemImage } from "@/lib/medusa-cart";
import { formatPrice } from "@/lib/medusa";
import { updateCartLineAction, removeCartLineAction } from "@/lib/cart-actions";

export default function CartItem({
  item,
  currencyCode,
  productHandle,
}: {
  item: MedusaCartLineItem;
  currencyCode: string;
  /** `null` si le produit n'est plus au catalogue : on n'y renvoie alors pas. */
  productHandle: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const imageUrl = getLineItemImage(item);

  const setQuantity = (next: number) => {
    if (next < 1) return;
    startTransition(async () => {
      const result = await updateCartLineAction(item.id, next);
      if (result.error) toast.error(result.error);
    });
  };

  const remove = () => {
    startTransition(async () => {
      const result = await removeCartLineAction(item.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Article retiré du panier");
    });
  };

  const title = (
    <span className="text-[15px] font-semibold leading-snug text-gv-text sm:text-base">
      {item.product_title}
    </span>
  );

  return (
    <li className="rounded-xl border border-gv-border bg-gv-card p-4 shadow-gv-xs sm:p-[22px]">
      <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[126px_minmax(200px,1fr)_128px_120px] lg:items-center">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gv-image lg:h-[126px] lg:w-[126px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product_title}
              fill
              sizes="126px"
              className="object-contain p-2.5"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-gv-text-muted">
              <ImageOff size={20} aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3>
            {productHandle ? (
              <Link href={`/products/${productHandle}`} className="hover:text-gv-800">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>

          {item.variant_title && (
            <p className="mt-1 text-[13px] text-gv-text-soft">{item.variant_title}</p>
          )}

          <p className="mt-3 text-[19px] font-semibold text-gv-text">
            {formatPrice(item.unit_price, currencyCode)}
          </p>
          <p className="text-xs text-gv-text-soft">Prix unitaire</p>
        </div>

        <div className="col-span-2 flex items-center justify-between gap-4 lg:col-span-1 lg:justify-start">
          <div className="grid h-12 w-32 grid-cols-[40px_1fr_40px] items-center rounded-[7px] border border-gv-border-strong bg-white">
            <button
              onClick={() => setQuantity(item.quantity - 1)}
              disabled={isPending || item.quantity <= 1}
              aria-label={`Diminuer la quantité de ${item.product_title}`}
              className="flex h-full cursor-pointer items-center justify-center text-gv-text disabled:cursor-not-allowed disabled:text-gv-text-muted"
            >
              <Minus size={15} aria-hidden />
            </button>
            <span aria-live="polite" className="text-center text-sm font-semibold tabular-nums text-gv-text">
              {item.quantity}
            </span>
            <button
              onClick={() => setQuantity(item.quantity + 1)}
              disabled={isPending}
              aria-label={`Augmenter la quantité de ${item.product_title}`}
              className="flex h-full cursor-pointer items-center justify-center text-gv-text disabled:cursor-not-allowed disabled:text-gv-text-muted"
            >
              <Plus size={15} aria-hidden />
            </button>
          </div>

          <div className="text-right lg:hidden">
            <p className="text-2xl font-semibold tabular-nums text-gv-text">
              {formatPrice(item.total, currencyCode)}
            </p>
            <p className="text-xs text-gv-text-soft">Total</p>
          </div>
        </div>

        <div className="hidden text-right lg:block">
          <p className="text-2xl font-semibold tabular-nums text-gv-text">
            {formatPrice(item.total, currencyCode)}
          </p>
          <p className="text-xs text-gv-text-soft">Total</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end border-t border-gv-border pt-3">
        <button
          onClick={remove}
          disabled={isPending}
          className="flex min-h-10 cursor-pointer items-center gap-2 text-[13px] text-gv-text-soft transition-colors hover:text-[var(--gv-danger)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={18} aria-hidden />
          Supprimer
          <span className="sr-only"> {item.product_title} du panier</span>
        </button>
      </div>
    </li>
  );
}
