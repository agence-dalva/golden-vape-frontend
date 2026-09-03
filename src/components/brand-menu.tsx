import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { MedusaBrand } from "@/lib/medusa";
import { sortBrands } from "@/lib/brands";

// Au-delà, le panneau deviendrait plus haut que l'écran. Le lien de bas de panneau mène à
// l'index complet.
const MAX_VISIBLE = 18;

export default function BrandMenu({ brands }: { brands: MedusaBrand[] }) {
  const sorted = sortBrands(brands);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - visible.length;

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Nos marques</p>
          <p className="mt-1 font-display text-xl font-normal text-gv-text">
            Les marques qui font la différence
          </p>
        </div>
        <p className="text-[13px] text-gv-text-soft">
          {sorted.length} marque{sorted.length > 1 ? "s" : ""}
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {visible.map((brand) => (
          <li key={brand.value} className="min-w-0">
            <Link
              href={`/marques/${encodeURIComponent(brand.value)}`}
              className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-gv-border bg-gv-card transition-[border-color,box-shadow] duration-200 hover:border-gv-border-strong hover:shadow-[0_10px_24px_rgba(68,54,46,0.07)]"
            >
              {/* Zone normalisée : `contain` préserve proportions et couleurs officielles. */}
              <span className="relative flex h-[74px] items-center justify-center">
                {brand.image_url ? (
                  <Image
                    src={brand.image_url}
                    alt={brand.value}
                    fill
                    sizes="160px"
                    className="object-contain p-3.5"
                  />
                ) : (
                  <span className="px-2 text-center font-display text-base text-gv-text-soft">
                    {brand.value}
                  </span>
                )}
              </span>
              <span className="truncate border-t border-gv-border px-3 py-2 text-center text-[12px] font-medium text-gv-text">
                {brand.value}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-end border-t border-gv-border pt-4">
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
