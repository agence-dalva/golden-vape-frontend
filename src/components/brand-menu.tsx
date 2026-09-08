import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MedusaBrand } from "@/lib/medusa";
import { sortBrands } from "@/lib/brands";
import BrandTiles from "./brand-tiles";

// Au-delà, le panneau deviendrait plus haut que l'écran. Le lien de bas de panneau mène à
// l'index complet.
const MAX_VISIBLE = 18;

export default function BrandMenu({ brands }: { brands: MedusaBrand[] }) {
  const sorted = sortBrands(brands);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - visible.length;

  /*
    Colonne bornée par le panneau qui l'accueille : l'en-tête et le pied restent en place, et
    c'est la grille qui défile. Sans cela, sur un écran de portable, le lien vers l'index
    complet passait sous le bas de l'écran — le seul chemin vers les marques non montrées.
  */
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex shrink-0 items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Nos marques</p>
          <p className="mt-1 font-display text-2xl font-normal text-gv-text">
            Les marques qui font la différence
          </p>
        </div>
        <p className="text-[13px] text-gv-text-soft">
          {sorted.length} marque{sorted.length > 1 ? "s" : ""}
        </p>
      </div>

      {/*
        Même grille que les panneaux de rubrique — six colonnes, quadrillage à filets fins,
        marques posées à même le fond. Les deux menus de la barre se répondent, il n'y a
        aucune raison que celui-ci ait sa propre écriture.
      */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <BrandTiles
          brands={visible}
          finition="bare"
          className="grid-cols-6"
          hrefFor={(brand) => `/marques/${encodeURIComponent(brand.value)}`}
        />
      </div>

      <div className="mt-5 flex shrink-0 justify-end border-t border-[rgba(68,54,46,0.12)] pt-4">
        <Link
          href="/marques"
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-gv-800"
        >
          {remaining > 0 ? `Voir les ${sorted.length} marques` : "Voir toutes les marques"}
          <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]" />
        </Link>
      </div>
    </div>
  );
}
