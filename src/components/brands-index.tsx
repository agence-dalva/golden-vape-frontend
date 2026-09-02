"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { MedusaBrand } from "@/lib/medusa";

const ALL = "Toutes";
const DIGITS = "0-9";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Tri français : insensible à la casse et aux accents, « Élikuid » se range donc avec les E.
const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

/** Lettre de regroupement : les noms commençant par un chiffre vont dans « 0-9 ». */
function groupKeyOf(name: string): string {
  const first = name.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().charAt(0).toUpperCase();
  if (/[0-9]/.test(first)) return DIGITS;
  return /[A-Z]/.test(first) ? first : DIGITS;
}

export default function BrandsIndex({ brands }: { brands: MedusaBrand[] }) {
  const [active, setActive] = useState(ALL);

  const groups = useMemo(() => {
    // Doublons écartés sur la valeur, qui fait office d'identifiant de marque.
    const unique = Array.from(new Map(brands.map((brand) => [brand.value, brand])).values());
    const sorted = unique.sort((a, b) => collator.compare(a.value, b.value));

    const map = new Map<string, MedusaBrand[]>();
    for (const brand of sorted) {
      const key = groupKeyOf(brand.value);
      map.set(key, [...(map.get(key) ?? []), brand]);
    }
    return map;
  }, [brands]);

  const visibleGroups = active === ALL ? [...groups.entries()] : [[active, groups.get(active) ?? []] as const];
  const visibleCount = visibleGroups.reduce((total, [, list]) => total + list.length, 0);

  return (
    <>
      <div // Une seule ligne qui défile plutôt qu'un pavé sur deux lignes : l'alphabet se lit
        // d'un coup d'œil, et le comportement est le même du mobile au grand écran.
        className="mb-8 flex items-center gap-1.5 overflow-x-auto rounded-[10px] border border-gv-border bg-gv-card p-2 [scrollbar-width:thin]">
        <span className="shrink-0 px-2 text-[13px] text-gv-text-soft">Filtrer par initiale</span>
        {[ALL, DIGITS, ...LETTERS].map((key) => {
          const available = key === ALL || (groups.get(key)?.length ?? 0) > 0;
          const isActive = key === active;

          return (
            <button
              key={key}
              onClick={() => available && setActive(key)}
              // Une lettre sans marque n'est pas cliquable : elle reste visible pour que
              // l'alphabet garde sa forme, mais n'appelle pas au clic.
              disabled={!available}
              aria-current={isActive ? "location" : undefined}
              className={`flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-[7px] px-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-gv-800 text-white"
                  : available
                    ? "text-gv-text hover:bg-gv-50 hover:text-gv-800"
                    : "cursor-not-allowed text-gv-text-muted/45"
              }`}
            >
              {key}
            </button>
          );
        })}
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
                className="mb-4 border-b border-gv-border pb-2 font-display text-2xl font-medium text-gv-text"
              >
                {letter}
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
