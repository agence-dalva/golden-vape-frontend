import Link from "next/link";
import Image from "next/image";
import type { MedusaCategory, MedusaBrand } from "@/lib/medusa";
import type { MedusaCustomer } from "@/lib/medusa-customer";
import SearchBar from "@/components/search-bar";
import AccountMenu from "@/components/account-menu";
import CartIcon from "@/components/cart-icon";
import MobileCategoryMenu from "@/components/mobile-category-menu";

export default function MainHeader({
  categories,
  brands,
  customer,
  itemCount,
}: {
  categories: MedusaCategory[];
  brands: MedusaBrand[];
  customer: MedusaCustomer | null;
  itemCount: number;
}) {
  return (
    <header className="relative z-30 border-b border-gv-border bg-gv-card">
      {/*
        La recherche occupe sa propre ligne en dessous de 1100px : la comprimer sur la même
        ligne que le logo et les actions la rendrait inutilisable bien avant le mobile.
      */}
      <div className="gv-container grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3 lg:min-h-24 lg:grid-cols-[260px_minmax(360px,1fr)_auto] lg:gap-9 lg:py-0">
        {/*
          Les deux logotypes sont fournis sur fond marron : l'arrondi les assume comme un
          bloc de marque plutôt que comme un rectangle posé sur le blanc de l'en-tête.
          Version verticale jusqu'à la tablette, horizontale à partir du desktop — c'est
          aussi à `lg` que la barre de recherche remonte sur la même ligne.
        */}
        <Link href="/" aria-label="Golden Vape, retour à l'accueil" className="justify-self-start">
          <Image
            src="/logos/golden-vape-vertical-dore-fond-marron.png"
            alt="Golden Vape"
            width={2064}
            height={1811}
            sizes="80px"
            priority
            className="h-14 w-auto rounded-[10px] lg:hidden"
          />
          <Image
            src="/logos/golden-vape-horizontal-fond-marron.png"
            alt="Golden Vape"
            width={3728}
            height={1061}
            sizes="220px"
            priority
            className="hidden h-14 w-auto rounded-[10px] lg:block"
          />
        </Link>

        <div className="order-3 col-span-2 lg:order-none lg:col-span-1">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end gap-5 sm:gap-7">
          <AccountMenu customer={customer} />
          <CartIcon itemCount={itemCount} />
          <MobileCategoryMenu categories={categories} brands={brands} />
        </div>
      </div>
    </header>
  );
}
