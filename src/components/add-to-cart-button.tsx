"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import { addToCartAction } from "@/lib/cart-actions";

const buttonClass =
  "mt-auto flex h-[42px] w-full items-center justify-center gap-2 rounded-[7px] border text-[13px] font-semibold transition-colors duration-200";

export type CartCandidate = {
  id: string;
  label: string | null;
  stock: number | null;
};

export default function AddToCartButton({
  variants,
  productTitle,
}: {
  variants: CartCandidate[];
  productTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  // Une variante au stock inconnu reste vendable : seule une rupture avérée l'écarte.
  const available = variants.filter((variant) => variant.stock === null || variant.stock > 0);
  const chosen = available[0] ?? null;
  const soldOut = variants.length > 0 && available.length === 0;

  if (soldOut || !chosen) {
    return (
      <span
        className={`${buttonClass} cursor-not-allowed border-gv-border bg-gv-image text-gv-text-muted`}
      >
        Indisponible
      </span>
    );
  }

  const handleAdd = () => {
    startTransition(async () => {
      try {
        await addToCartAction(chosen.id, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        // La déclinaison est nommée dans la confirmation : sur un produit qui en compte
        // plusieurs, le client voit immédiatement laquelle est partie au panier.
        toast.success("Ajouté au panier", {
          description: chosen.label ? `${productTitle} — ${chosen.label}` : productTitle,
        });
      } catch {
        toast.error("Impossible d'ajouter ce produit au panier");
      }
    });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      aria-label={`Ajouter ${productTitle} au panier`}
      className={`${buttonClass} cursor-pointer border-gv-800 disabled:cursor-wait ${
        added ? "bg-gv-800 text-white" : "bg-white text-gv-800 hover:bg-gv-800 hover:text-white"
      }`}
    >
      {added ? (
        <>
          <Check size={16} aria-hidden />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingBag size={16} aria-hidden />
          {isPending ? "Ajout…" : "Ajouter au panier"}
        </>
      )}
    </button>
  );
}
