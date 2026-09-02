import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import AnnouncementBar from "@/components/announcement-bar";
import MainHeader from "@/components/main-header";
import CategoryNav from "@/components/category-nav";
import SiteFooter from "@/components/site-footer";
import { listCategories, listBrands } from "@/lib/medusa";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import "./globals.css";

// Serif éditoriale pour les titres, sans-serif pour l'interface — deux familles, pas plus.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  const [categories, brands, cart, customer] = await Promise.all([
    listCategories(),
    listBrands(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  // Le badge compte le nombre d'articles DISTINCTS dans le panier, pas la somme des quantités
  // (2x le même produit = toujours "1" article au panier, pas "2").
  const itemCount = cart?.items.length ?? 0;

  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AnnouncementBar />
        <MainHeader
          categories={categories}
          brands={brands}
          customer={customer}
          itemCount={itemCount}
        />
        <CategoryNav categories={categories} brands={brands} />
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
      </body>
    </html>
  );
}
