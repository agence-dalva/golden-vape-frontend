import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import CategoryNav from "@/components/category-nav";
import MobileCategoryMenu from "@/components/mobile-category-menu";
import CartIcon from "@/components/cart-icon";
import { listCategories } from "@/lib/medusa";
import { getCurrentCart } from "@/lib/cart-actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const categories = await listCategories();
  const cart = await getCurrentCart();
  // Le badge compte le nombre d'articles DISTINCTS dans le panier, pas la somme des quantités
  // (2x le même produit = toujours "1" article au panier, pas "2").
  const itemCount = cart?.items.length ?? 0;

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="relative border-b border-brand-chocolate/10">
          <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-brand-chocolate">
              Golden Vape
            </Link>
            <div className="flex items-center gap-2">
              <CartIcon itemCount={itemCount} />
              <MobileCategoryMenu categories={categories} />
            </div>
          </div>
        </header>
        <CategoryNav categories={categories} />
        <main className="flex-1">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "!bg-brand-chocolate !border-brand-chocolate !text-white",
              title: "!text-white",
              description: "!text-white/80",
              icon: "!text-brand-gold",
            },
          }}
        />
      </body>
    </html>
  );
}
