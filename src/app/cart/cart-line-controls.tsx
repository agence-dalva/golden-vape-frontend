"use client";

import { useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateCartLineAction, removeCartLineAction } from "@/lib/cart-actions";

export default function CartLineControls({
  lineId,
  quantity,
}: {
  lineId: string;
  quantity: number;
}) {
  const [isPending, startTransition] = useTransition();

  const setQuantity = (next: number) => {
    if (next < 1) return;
    startTransition(async () => {
      await updateCartLineAction(lineId, next);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeCartLineAction(lineId);
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setQuantity(quantity - 1)}
          disabled={isPending}
          aria-label="Diminuer la quantité"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-brand-chocolate/15 text-brand-chocolate hover:border-brand-gold-dark transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-medium text-brand-chocolate tabular-nums">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          disabled={isPending}
          aria-label="Augmenter la quantité"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-brand-chocolate/15 text-brand-chocolate hover:border-brand-gold-dark transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} />
        </button>
      </div>
      <button
        onClick={handleRemove}
        disabled={isPending}
        aria-label="Supprimer l'article"
        className="cursor-pointer text-brand-chocolate/50 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
