import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { MedusaProduct } from "@/lib/medusa";
import { formatPrice, getDisplayAmount } from "@/lib/medusa";
import AddToCartButton, { type CartCandidate } from "./add-to-cart-button";

const NEW_PRODUCT_DAYS = 30;

function isNew(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
}

export default function ProductCard({
  product,
  priority = false,
}: {
  product: MedusaProduct;
  priority?: boolean;
}) {
  const imageUrl = product.images[0]?.url ?? product.thumbnail;
  const variants = product.variants ?? [];

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

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-gv-border bg-gv-card shadow-gv-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-gv-border-strong hover:shadow-gv-md">
      <Link href={`/products/${product.handle}`} className="flex flex-1 flex-col">
        {/* Fond blanc plutôt que teinté : les photos du catalogue sont détourées sur blanc,
            une teinte ferait apparaître un rectangle clair derrière chaque produit. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
          {isNew(product.created_at) && (
            <span className="absolute left-3 top-3 z-10 inline-flex h-6 items-center rounded-[5px] border border-gv-800/25 bg-gv-800/[0.08] px-2 text-[10px] font-bold uppercase tracking-wide text-gv-800">
              Nouveau
            </span>
          )}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(min-width: 1100px) 312px, (min-width: 768px) 45vw, 90vw"
              priority={priority}
              className="object-contain p-[18px] transition-transform duration-200 group-hover:scale-[1.025]"
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-gv-text-muted">
              <ImageOff size={22} aria-hidden />
              <span className="text-xs">Image indisponible</span>
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-2 pt-3.5">
          {/* Hauteur réservée sur deux lignes : les prix et boutons restent alignés d'une carte à l'autre. */}
          <h3 className="line-clamp-2 min-h-[2.7em] text-[15px] font-semibold leading-[1.35] text-gv-text">
            {product.title}
          </h3>

          <p className="mt-2 text-[17px] font-bold tracking-[-0.01em] text-gv-text">
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
        </div>
      </Link>

      <div className="flex px-4 pb-4 pt-2">
        <AddToCartButton variants={candidates} productTitle={product.title} />
      </div>
    </article>
  );
}
