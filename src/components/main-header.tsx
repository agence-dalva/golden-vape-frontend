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
          Version verticale jusqu'à la tablette, horizontale à partir du desktop — c'est aussi
          à `lg` que la barre de recherche remonte sur la même ligne.

          Les fichiers `-web` sont dérivés de ceux fournis : ces derniers ont le damier de
          transparence aplati dans les pixels, et plus de la moitié de leur hauteur en marge
          vide. Fond rendu transparent, cadrage sur le visuel — sans quoi le logo s'afficherait
          en damier gris et deux fois trop petit.
        */}
        <Link href="/" aria-label="Golden Vape, retour à l'accueil" className="justify-self-start">
          <Image
            src="/logos/logo-vertical-web.png"
            alt="Golden Vape"
            width={1119}
            height={1030}
            sizes="90px"
            priority
            className="h-[62px] w-auto lg:hidden"
          />
          <Image
            src="/logos/logo-horizontal-web.png"
            alt="Golden Vape"
            width={2137}
            height={410}
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
          <MobileCategoryMenu categories={categories} brands={brands} />
        </div>
      </div>
    </header>
  );
}
