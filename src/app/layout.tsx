import type { Metadata } from "next";
import { Michroma, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import AnnouncementBar from "@/components/announcement-bar";
import MainHeader from "@/components/main-header";
import CategoryNav from "@/components/category-nav";
import SiteFooter from "@/components/site-footer";
import AgeGate from "@/components/age-gate";
import { AGE_STORAGE_KEY } from "@/lib/age-gate";
import { listCategories, listBrands, listCategoryBrands } from "@/lib/medusa";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import "./globals.css";

// Michroma pour les titres — la famille du logotype —, sans-serif pour l'interface.
// Michroma n'existe qu'en 400 : toute autre graisse serait grossie par le navigateur.
const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Golden Vape",
  description: "Boutique en ligne Golden Vape",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, brands, categoryBrands, cart, customer] = await Promise.all([
    listCategories(),
    listBrands(),
    // Les marques présentes dans chaque rubrique alimentent les menus déroulants. Une panne
    // de cette lecture ne doit pas emporter le site : les menus se réduisent alors aux
    // sous-catégories, comme avant.
    listCategoryBrands().catch(() => ({})),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  // Le badge compte le nombre d'articles DISTINCTS dans le panier, pas la somme des quantités
  // (2x le même produit = toujours "1" article au panier, pas "2").
  const itemCount = cart?.items.length ?? 0;

  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${michroma.variable} h-full antialiased`}
      // Le script d'amorçage pose `data-age-ok` sur cet élément avant l'hydratation, ce que
      // React signale sinon comme une divergence entre le rendu serveur et le client. La
      // suppression ne porte que sur <html> lui-même, pas sur l'arbre en dessous.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/*
          Synchrone et en tête de corps : l'attribut est posé avant que le portillon d'âge
          ne soit peint, sinon un visiteur qui a déjà répondu le verrait clignoter à chaque
          chargement. Un script ne pouvant rien importer, la clé est interpolée — depuis
          `lib/age-gate` et non depuis le composant, qui est un module client.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem(${JSON.stringify(AGE_STORAGE_KEY)})==="1")document.documentElement.dataset.ageOk="1"}catch(e){}`,
          }}
        />
        <AnnouncementBar />
        <MainHeader
          categories={categories}
          brands={brands}
          categoryBrands={categoryBrands}
          customer={customer}
          itemCount={itemCount}
        />
        <CategoryNav categories={categories} brands={brands} categoryBrands={categoryBrands} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "!bg-gv-800 !border-gv-800 !text-white",
              title: "!text-white",
              description: "!text-white/80",
              icon: "!text-white",
            },
          }}
        />
        <AgeGate />
      </body>
    </html>
  );
}
