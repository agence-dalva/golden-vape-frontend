import Link from "next/link";
import Image from "next/image";
import type { MedusaCategory, MedusaBrand, CategoryBrand } from "@/lib/medusa";
import type { MedusaCustomer } from "@/lib/medusa-customer";
import SearchBar from "@/components/search-bar";
import AccountMenu from "@/components/account-menu";
import CartIcon from "@/components/cart-icon";
import MobileCategoryMenu from "@/components/mobile-category-menu";

export default function MainHeader({
  categories,
  brands,
  categoryBrands,
  customer,
  itemCount,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
  /** Marques présentes dans chaque rubrique, pour le menu du mobile. */
  categoryBrands: Record<string, CategoryBrand[]>;
  customer: MedusaCustomer | null;
  itemCount: number;
}) {
  return (
    <header className="relative z-30 border-b border-white/10 bg-gv-800">
      {/*
        La recherche occupe sa propre ligne en dessous de 1100px : la comprimer sur la même
        ligne que le logo et les actions la rendrait inutilisable bien avant le mobile.
      */}
      <div className="gv-container grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3 lg:min-h-24 lg:grid-cols-[260px_minmax(360px,1fr)_auto] lg:gap-9 lg:py-0">
        {/*
          Version verticale jusqu'à la tablette, horizontale à partir du desktop — c'est aussi
          à `lg` que la barre de recherche remonte sur la même ligne.

          Les fichiers `-marron-web` sont dérivés des logos fournis sur fond brun : ces
          derniers portent plus de la moitié de leur hauteur en marge vide, ce qui afficherait
          le logotype deux fois trop petit. Recadrés sur le visuel et convertis en WebP, ils
          passent de 570 à 27 Ko. Leur fond est exactement celui de l'en-tête, le raccord ne
          se voit donc pas.
        */}
        <Link href="/" aria-label="Golden Vape, retour à l'accueil" className="justify-self-start">
          <Image
            src="/logos/logo-vertical-marron-web.webp"
            alt="Golden Vape"
            width={373}
            height={320}
            sizes="90px"
            priority
            className="h-[62px] w-auto lg:hidden"
          />
          <Image
            src="/logos/logo-horizontal-marron-web.webp"
            alt="Golden Vape"
            width={1167}
            height={220}
            sizes="260px"
            priority
            className="hidden h-11 w-auto lg:block"
          />
        </Link>

        <div className="order-3 col-span-2 lg:order-none lg:col-span-1">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end gap-5 sm:gap-7">
          <AccountMenu customer={customer} />
          <CartIcon itemCount={itemCount} />
          <MobileCategoryMenu categories={categories} brands={brands} categoryBrands={categoryBrands} />
        </div>
      </div>
    </header>
  );
}
