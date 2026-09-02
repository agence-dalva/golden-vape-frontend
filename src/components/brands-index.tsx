"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { MedusaBrand } from "@/lib/medusa";
import { sortBrands, brandGroupKey } from "@/lib/brands";

const ALL = "Toutes";
const DIGITS = "0-9";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function InitialButton({
  label,
  active,
  available,
  onSelect,
}: {
  label: string;
  active: boolean;
  /** Une lettre sans marque reste visible — l'alphabet garde sa forme — mais n'appelle pas au clic. */
  available: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={() => available && onSelect()}
      disabled={!available}
      aria-current={active ? "location" : undefined}
      className={`flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-[7px] px-2 text-[13px] font-medium transition-colors ${
        active
          ? "bg-gv-800 text-white"
          : available
            ? "text-gv-text hover:bg-gv-50 hover:text-gv-800"
            : "cursor-not-allowed text-gv-text-muted/45"
      }`}
    >
      {label}
    </button>
  );
}

export default function BrandsIndex({ brands }: { brands: MedusaBrand[] }) {
  const [active, setActive] = useState(ALL);

  const groups = useMemo(() => {
    const map = new Map<string, MedusaBrand[]>();
    for (const brand of sortBrands(brands)) {
      const key = brandGroupKey(brand.value);
      map.set(key, [...(map.get(key) ?? []), brand]);
    }
    return map;
  }, [brands]);

  const visibleGroups = active === ALL ? [...groups.entries()] : [[active, groups.get(active) ?? []] as const];
  const visibleCount = visibleGroups.reduce((total, [, list]) => total + list.length, 0);

  return (
    <>
      <div className="mb-8 rounded-[10px] border border-gv-border bg-gv-card p-2">
        <div className="mb-2 flex items-center gap-1.5 border-b border-gv-border pb-2">
          <span className="shrink-0 px-2 text-[13px] text-gv-text-soft">Filtrer par initiale</span>
          {[ALL, DIGITS].map((key) => (
            <InitialButton
              key={key}
              label={key}
              active={key === active}
              available={key === ALL || (groups.get(key)?.length ?? 0) > 0}
              onSelect={() => setActive(key)}
            />
          ))}
        </div>

        {/*
          Les vingt-six lettres ne tiennent sur une ligne qu'à partir de `xl` : à 1024px,
          largeur d'un iPad en paysage, il leur manque quelques pixels. En dessous, elles
          défilent donc au doigt, sans ascenseur visible.
        */}
        <div className="flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] xl:justify-between xl:gap-1 xl:overflow-x-visible [&::-webkit-scrollbar]:hidden">
          {LETTERS.map((letter) => (
            <InitialButton
              key={letter}
              label={letter}
              active={letter === active}
              available={(groups.get(letter)?.length ?? 0) > 0}
              onSelect={() => setActive(letter)}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="gv-eyebrow">Toutes les marques</p>
          <h2 className="mt-2 font-display text-[28px] font-medium leading-[1.05] text-gv-text">
            Par ordre alphabétique
          </h2>
        </div>
        <p aria-live="polite" className="text-sm text-gv-text-soft">
          {visibleCount === 0
            ? "Aucune marque pour cette lettre"
            : `${visibleCount} marque${visibleCount > 1 ? "s" : ""}`}
          {active !== ALL && visibleCount > 0 ? ` pour la lettre ${active}` : ""}
        </p>
      </div>

      {visibleCount === 0 ? (
        <div className="rounded-[14px] border border-gv-border bg-gv-card px-6 py-10 text-center">
          <p className="text-sm text-gv-text-soft">Aucune marque ne correspond à cette sélection.</p>
          <button
            onClick={() => setActive(ALL)}
            className="mt-4 cursor-pointer text-sm font-semibold text-gv-800 hover:underline"
          >
            Afficher toutes les marques
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {visibleGroups.map(([letter, list]) => (
            <section key={letter} aria-labelledby={`brands-${letter}`} id={`letter-${letter}`} className="scroll-mt-28">
              <h3
                id={`brands-${letter}`}
                className="mb-4 flex items-center gap-4 font-display text-2xl font-medium text-gv-text"
              >
                {letter}
                <span aria-hidden className="h-px flex-1 bg-gv-border" />
              </h3>

              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {list.map((brand) => (
                  <li key={brand.value}>
                    <Link
                      href={`/marques/${encodeURIComponent(brand.value)}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-gv-border bg-gv-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-gv-border-strong hover:shadow-[0_14px_34px_rgba(68,54,46,0.08)]"
                    >
                      {/* Zone de logo normalisée : `contain` préserve proportions et couleurs
                          officielles, aucun recadrage. */}
                      <span className="relative flex h-[130px] items-center justify-center p-5">
                        {brand.image_url ? (
                          <Image
                            src={brand.image_url}
                            alt={brand.value}
                            fill
                            sizes="200px"
                            loading="lazy"
                            className="object-contain p-5"
                          />
                        ) : (
                          <span className="font-display text-xl text-gv-text-soft">{brand.value}</span>
                        )}
                      </span>

                      <span className="flex items-center justify-between gap-2 border-t border-gv-border px-4 py-3">
                        <span className="min-w-0 truncate text-[13px] font-medium text-gv-text">
                          {brand.value}
                        </span>
                        <ArrowRight
                          size={15}
                          aria-hidden
                          className="shrink-0 text-gv-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gv-800"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
