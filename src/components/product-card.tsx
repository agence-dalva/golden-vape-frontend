import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";
import { formatPrice, getDisplayAmount } from "@/lib/medusa";
import AddToCartButton, { type CartCandidate } from "./add-to-cart-button";

const NEW_PRODUCT_DAYS = 30;
const LOW_STOCK_THRESHOLD = 3;

function isNew(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
}

export default function ProductCard({
  product,
  priority = false,
  brand = null,
  feature = null,
}: {
  product: MedusaProduct;
  priority?: boolean;
  /** Renseignés par le catalogue, absents des sliders qui ne chargent pas les attributs. */
  brand?: string | null;
  feature?: string | null;
}) {
  const imageUrl = product.images[0]?.url ?? product.thumbnail;
  const variants = product.variants ?? [];

  // Le sous-titre porte les mots-clés saisis à l'administration ; à défaut, la carte retombe
  // sur la caractéristique tirée des attributs. Une seule des deux : superposées, ces deux
  // lignes grises de même graisse se liraient comme un paragraphe.
  const secondary = product.subtitle?.trim() || feature;

  const prices = variants
    .map((variant) => variant.calculated_price)
    .filter((price): price is NonNullable<typeof price> => Boolean(price));
  const lowest = prices.length
    ? prices.reduce((min, price) =>
        getDisplayAmount(price) < getDisplayAmount(min) ? price : min
      )
    : null;

  const candidates: CartCandidate[] = variants.map((variant) => ({
    id: variant.id,
    label: variant.options?.[0]?.value ?? variant.title ?? null,
    stock: variant.inventory_quantity,
  }));

  // Une variante au stock inconnu reste vendable : seule une rupture avérée l'écarte.
  const sellable = candidates.filter((variant) => variant.stock === null || variant.stock > 0);
  const soldOut = candidates.length > 0 && sellable.length === 0;
  const knownStock = sellable
    .map((variant) => variant.stock)
    .filter((stock): stock is number => stock !== null);
  const lowStock =
    !soldOut && knownStock.length === sellable.length && knownStock.length > 0
      ? knownStock.reduce((total, stock) => total + stock, 0) <= LOW_STOCK_THRESHOLD
      : false;

  // Un seul badge : « Indisponible » et « Nouveau » sur la même carte se contrediraient.
  // Rien pour un prix inconnu : la ligne de prix le dit déjà, mot pour mot.
  const badge = soldOut
    ? "Indisponible"
    : lowStock
      ? "Dernières pièces"
      : isNew(product.created_at)
        ? "Nouveau"
        : null;

  return (
    <article className="group relative grid h-full min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-xl border border-gv-border bg-gv-card shadow-gv-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[2px] hover:border-gv-border-strong hover:shadow-gv-md">
      {/* Fond blanc plutôt que teinté : les photos du catalogue sont détourées sur blanc,
          une teinte ferait apparaître un rectangle clair derrière chaque produit. */}
      <div className="relative h-[186px] w-full overflow-hidden bg-white">
        {badge && (
          <span className="absolute left-3 top-3 z-10 inline-flex h-[25px] items-center rounded-[6px] border border-gv-800/20 bg-gv-50 px-2 text-[10px] font-bold uppercase tracking-[0.06em] text-gv-800">
            {badge}
          </span>
        )}

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
            priority={priority}
            className="object-contain p-3.5 transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-gv-text-muted">
            <ImageOff size={22} aria-hidden />
            <span className="text-xs">Image indisponible</span>
          </span>
        )}
      </div>

      <div className="flex flex-col px-4 pb-4 pt-3.5">
        {brand && (
          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-gv-text-muted">
            {brand}
          </p>
        )}

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.35] text-gv-text">
          <Link href={`/products/${product.handle}`} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        {secondary && (
          <p className="mt-1 truncate text-[12px] leading-snug text-gv-text-soft">{secondary}</p>
        )}

        {/* Prix et action collés au bas de la carte : ils s'alignent d'une carte à l'autre
            quel que soit le nombre de lignes du titre, sans réserver de hauteur à vide. */}
        <p className="mt-auto pt-3 text-[17px] font-bold tracking-[-0.01em] text-gv-text">
          {lowest ? (
            <>
              {prices.length > 1 && (
                <span className="mr-1 text-xs font-medium text-gv-text-soft">dès</span>
              )}
              {formatPrice(getDisplayAmount(lowest), lowest.currency_code)}
            </>
          ) : (
            <span className="text-sm font-medium text-gv-text-muted">Prix sur demande</span>
          )}
        </p>

        {/* Le lien du titre couvre la carte entière : l'action doit repasser au-dessus pour
            rester cliquable, et un prix inconnu renvoie à la fiche plutôt qu'au panier. */}
        <div className="relative z-10 mt-3 flex">
          {lowest || soldOut ? (
            <AddToCartButton variants={candidates} productTitle={product.title} />
          ) : (
            <Link
              href={`/products/${product.handle}`}
              className="mt-auto flex min-h-11 w-full items-center justify-center rounded-[7px] border border-gv-800 bg-gv-800 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-gv-900"
            >
              Voir le produit
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
