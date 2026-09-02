import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { listBrands } from "@/lib/medusa";
import Breadcrumbs from "@/components/breadcrumbs";
import BrandsIndex from "@/components/brands-index";
import EmptyState from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Toutes les marques de vape | Golden Vape",
  description:
    "Retrouvez les fabricants et créateurs sélectionnés par Golden Vape pour leur fiabilité et la qualité de leurs produits.",
};

export default async function BrandsPage() {
  const brands = await listBrands().catch(() => []);

  return (
    <div className="gv-container pb-20">
      <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Nos marques" }]} />

      <section className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-gv-border pb-8">
        <div className="max-w-2xl">
          <p className="gv-eyebrow">Nos marques</p>
          <h1 className="mt-2 text-balance font-display text-[32px] font-medium leading-[1.05] tracking-[-0.025em] text-gv-text sm:text-[40px]">
            Les marques qui font la différence.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gv-text-soft">
            Retrouvez les fabricants et créateurs sélectionnés par Golden Vape pour leur
            fiabilité, leur innovation et la qualité de leurs produits.
          </p>
        </div>

        <p className="flex items-center gap-2.5 text-sm text-gv-text-soft">
          <BadgeCheck size={26} strokeWidth={1.5} aria-hidden className="text-gv-800" />
          <span className="text-base font-semibold text-gv-text">
            {brands.length} marque{brands.length > 1 ? "s" : ""}
          </span>
        </p>
      </section>

      {brands.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="Aucune marque n'est disponible pour le moment"
          description="Nos marques partenaires seront bientôt affichées ici."
          primary={{ label: "Parcourir le catalogue", href: "/categories" }}
        />
      ) : (
        <BrandsIndex brands={brands} />
      )}
    </div>
  );
}
