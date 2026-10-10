"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Loader2,
  ShieldCheck,
  Truck,
  Package,
  ChevronRight,
} from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";
import type { BrandLink } from "./product-details";
import { formatPrice, getDisplayAmount } from "@/lib/medusa";
import { addToCartAction } from "@/lib/cart-actions";
import { useVariantSelection } from "./variant-selection";
import VariantPicker from "./variant-picker";
import StockAlertForm from "./stock-alert-form";

const LOW_STOCK_THRESHOLD = 5;

const BENEFITS = [
  { icon: ShieldCheck, label: "Paiement 100 % sécurisé" },
  { icon: Truck, label: "Expédition sous 24/48h" },
];

export default function PurchasePanel({
  product,
  brands,
  tagline,
  cartVariantIds,
  customerEmail,
}: {
  product: MedusaProduct;
  brands: BrandLink[];
  tagline: string | null;
  cartVariantIds: string[];
  /** Adresse du client connecté : l'alerte de retour en stock s'en sert sans rien demander. */
  customerEmail: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  // La déclinaison choisie est partagée avec la galerie, qui affiche son visuel.
  const { variantId: selectedVariantId, selectVariant: setSelectedVariantId } = useVariantSelection();
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
      <h1 className="gv-title-strong font-display text-[32px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text">
        {product.title}
      </h1>

      {/* La marque sous le titre, en pastille : la bordure et la flèche disent qu'elle mène
          quelque part, sans attendre un survol que le mobile n'a pas. L'accroche se range sur
          la même ligne pour ne pas allonger l'en-tête, et passe dessous si la place manque. */}
      {(brands.length > 0 || tagline) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-2">
          {brands.map((brand) => (
            <BrandChip key={brand.value} brand={brand} />
          ))}
          {tagline && (
            <p className="text-sm leading-relaxed text-gv-text-soft">{tagline}</p>
          )}
        </div>
      )}

      {price ? (
        <p className="mt-[22px] text-[32px] font-semibold leading-tight text-gv-text">
          {formatPrice(getDisplayAmount(price), price.currency_code)}
        </p>
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
        <VariantPicker
          variants={variants}
          selectedId={selected?.id}
          optionTitle={optionTitle}
          onSelect={selectVariant}
        />
      )}

      {/* Épuisée : rien à mettre au panier, on propose d'être prévenu du retour. */}
      {soldOut && selected ? (
        <div className="mt-6">
          <StockAlertForm
            key={selected.id}
            variantId={selected.id}
            variantLabel={variants.length > 1 ? (selected.options[0]?.value ?? selected.title) : null}
            defaultEmail={customerEmail}
          />
        </div>
      ) : (
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
      )}

      {/* Un article déjà au panier reste achetable : simple rappel, pas de blocage. */}
      {alreadyInCart && (
        <p aria-live="polite" className="mt-3 text-[13px] text-gv-text-soft">
          Déjà dans votre panier ·{" "}
          <Link href="/cart" className="font-semibold text-gv-800 underline-offset-4 hover:underline">
            Voir mon panier
          </Link>
        </p>
      )}

      {!soldOut && (
        <p className="mt-3.5 flex items-center justify-center gap-2 text-[13px] text-gv-text-soft">
          <Package size={16} aria-hidden />
          Expédition sous 24/48h
        </p>
      )}

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

/**
 * Pastille de marque : logo, nom, flèche. Sans page à ouvrir, la même pastille sans lien ni
 * flèche, pour que rien n'ait l'air cliquable sans l'être.
 */
function BrandChip({ brand }: { brand: BrandLink }) {
  const contenu = (
    <>
      {brand.logoUrl && (
        // Les logos ont des fonds et des proportions de toutes sortes : un carré blanc,
        // `contain`, les met tous à égalité sans en recadrer aucun.
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gv-border bg-white">
          <Image src={brand.logoUrl} alt="" fill sizes="28px" className="object-contain p-0.5" />
        </span>
      )}
      <span className="text-[13px] font-semibold text-gv-text">{brand.value}</span>
    </>
  );

  const forme = `inline-flex items-center gap-2 rounded-full border bg-white py-1 ${
    brand.logoUrl ? "pl-1" : "pl-3.5"
  }`;

  if (!brand.href) {
    return <span className={`${forme} border-gv-border pr-3.5`}>{contenu}</span>;
  }

  return (
    <Link
      href={brand.href}
      aria-label={`Voir tous les produits ${brand.value}`}
      className={`${forme} group border-gv-border-strong pr-2.5 transition-colors hover:border-gv-800 hover:bg-gv-800/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gv-800`}
    >
      {contenu}
      <ChevronRight
        size={15}
        aria-hidden
        className="text-gv-800 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
