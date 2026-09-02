"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import { addToCartAction } from "@/lib/cart-actions";

const buttonClass =
  "mt-auto flex h-[42px] w-full items-center justify-center gap-2 rounded-[7px] border text-[13px] font-semibold transition-colors duration-200";

export default function AddToCartButton({
  variantId,
  productTitle,
  productHandle,
  soldOut,
  needsChoice,
}: {
  variantId: string | null;
  productTitle: string;
  productHandle: string;
  soldOut: boolean;
  /** Plusieurs déclinaisons : le choix du dosage appartient à la fiche produit. */
  needsChoice: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  if (soldOut) {
    return (
      <span
        className={`${buttonClass} cursor-not-allowed border-gv-border bg-gv-image text-gv-text-muted`}
      >
        Indisponible
      </span>
    );
  }

  // Libellé identique partout, mais on ne devine pas la déclinaison : quand le produit en a
  // plusieurs, le bouton mène à la fiche où le dosage se choisit. Ajouter la première au
  // hasard mettrait un autre dosage que celui voulu dans le panier.
  if (needsChoice || !variantId) {
    return (
      <Link
        href={`/products/${productHandle}`}
        aria-label={`Voir ${productTitle} et choisir sa déclinaison`}
        className={`${buttonClass} border-gv-800 bg-white text-gv-800 hover:bg-gv-800 hover:text-white`}
      >
        <ShoppingBag size={16} aria-hidden />
        Ajouter au panier
      </Link>
    );
  }

  const handleAdd = () => {
    startTransition(async () => {
      try {
        await addToCartAction(variantId, 1);
        setAdded(true);
        // Le libellé « Ajouté » n'est qu'un accusé visuel : il s'efface de lui-même.
        setTimeout(() => setAdded(false), 2000);
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
