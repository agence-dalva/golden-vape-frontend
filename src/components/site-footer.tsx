import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, Headset } from "lucide-react";
import { listCategories } from "@/lib/medusa";

const ACCOUNT_LINKS = [
  { label: "Mon compte", href: "/compte" },
  { label: "Mes commandes", href: "/compte#commandes" },
  { label: "Mon panier", href: "/cart" },
  { label: "Se connecter", href: "/compte/connexion" },
];

const SERVICES = [
  { icon: Truck, label: "Expédition sous 24/48h" },
  { icon: ShieldCheck, label: "Paiement 100 % sécurisé" },
  { icon: Headset, label: "Conseils d'experts" },
];

export default async function SiteFooter() {
  // Les catégories du pied de page viennent du catalogue : elles suivent l'admin, sans
  // seconde liste à maintenir.
  const categories = await listCategories().catch(() => []);

  return (
    <footer className="mt-20 bg-gv-800">
      <div className="gv-container grid grid-cols-2 gap-x-8 gap-y-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-16">
        <div className="col-span-2 lg:col-span-1">
          <Image
            src="/logos/logo-horizontal-marron-web.webp"
            alt="Golden Vape"
            width={1167}
            height={220}
            sizes="200px"
            className="h-9 w-auto"
          />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-gv-200">
            Liquides, matériel et accessoires sélectionnés avec exigence, pour une vape
            fiable au quotidien.
          </p>

          <ul className="mt-5 flex flex-col gap-2">
            {SERVICES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[13px] text-gv-200">
                <Icon size={16} strokeWidth={1.6} aria-hidden className="shrink-0 text-gv-300" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-labelledby="footer-boutique">
          <h2 id="footer-boutique" className="mb-4 text-[13px] font-semibold text-white">
            Boutique
          </h2>
          <ul className="flex flex-col gap-2.5">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.handle}`}
                  className="text-[13px] text-gv-200 transition-colors hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/categories"
                className="text-[13px] font-medium text-white hover:underline"
              >
                Tout le catalogue
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-compte">
          <h2 id="footer-compte" className="mb-4 text-[13px] font-semibold text-white">
            Mon compte
          </h2>
          <ul className="flex flex-col gap-2.5">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-gv-200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-marques" className="col-span-2 lg:col-span-1">
          <h2 id="footer-marques" className="mb-4 text-[13px] font-semibold text-white">
            Découvrir
          </h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link
                href="/marques"
                className="text-[13px] text-gv-200 transition-colors hover:text-white"
              >
                Nos marques
              </Link>
            </li>
            <li>
              <Link
                href="/#selection"
                className="text-[13px] text-gv-200 transition-colors hover:text-white"
              >
                La sélection du moment
              </Link>
            </li>
          </ul>

          {/*
            Mention obligatoire pour la vente de produits du vapotage en France. Elle ne
            remplace pas les pages légales, qui restent à créer.
          */}
          <p className="mt-6 rounded-[7px] border border-white/15 bg-white/[0.06] px-3.5 py-3 text-[12px] leading-relaxed text-gv-200">
            La vente de produits du vapotage est interdite aux mineurs de moins de 18 ans.
          </p>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="gv-container flex flex-wrap items-center justify-between gap-3 py-5 text-[12px] text-gv-300">
          <p>© {new Date().getFullYear()} Golden Vape. Tous droits réservés.</p>
          <p>Paiement sécurisé par Monetico — Crédit Mutuel</p>
        </div>
      </div>
    </footer>
  );
}
