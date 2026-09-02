import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { DiscoveryCategory } from "@/lib/medusa";

export default function CategoryCard({ category }: { category: DiscoveryCategory }) {
  return (
    <Link
      href={`/categories/${category.handle}`}
      // Fond blanc, comme les cartes produit : les photos du catalogue sont détourées sur
      // blanc et laisseraient sinon un rectangle clair sur le fond ivoire.
      className="group relative isolate flex aspect-[1.8/1] overflow-hidden rounded-xl border border-gv-border bg-white shadow-gv-xs transition-shadow duration-200 hover:shadow-gv-md"
    >
      {category.imageUrl && (
        <Image
          src={category.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1100px) 424px, (min-width: 768px) 45vw, 90vw"
          className={`-z-20 transition-transform duration-200 group-hover:scale-[1.03] ${
            category.isBackground ? "object-cover" : "object-contain object-right p-6"
          }`}
        />
      )}

      {/* Voile ivoire dégressif : il dégage la moitié gauche sans masquer le produit. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          // Un visuel pleine carte demande un voile plus soutenu pour que le titre tienne.
          background: category.isBackground
            ? "linear-gradient(90deg, rgb(251 250 248 / 0.94) 0%, rgb(251 250 248 / 0.74) 52%, rgb(251 250 248 / 0.1) 100%)"
            : "linear-gradient(90deg, rgb(255 255 255 / 0.97) 0%, rgb(255 255 255 / 0.85) 48%, rgb(255 255 255 / 0) 78%)",
        }}
      />

      <span className="flex max-w-[62%] flex-col justify-center p-6 sm:p-7">
        <span className="font-display text-[22px] font-medium leading-tight text-gv-text sm:text-[26px]">
          {category.name}
        </span>
        <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-gv-text-soft">
          Explorez notre sélection {category.name.toLowerCase()}.
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gv-800">
          Découvrir
          <ArrowRight
            size={15}
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </span>
    </Link>
  );
}
