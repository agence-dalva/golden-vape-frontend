"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, Tag } from "lucide-react";
import type { SearchResultProduct, SearchResults } from "@/lib/medusa";
import { formatPrice } from "@/lib/medusa";

const DEBOUNCE_MS = 250;
const MIN_TERM_LENGTH = 2;

const EMPTY: SearchResults = { products: [], brands: [] };

type Suggestion = {
  kind: "brand" | "product";
  key: string;
  label: string;
  detail: string | null;
  badge: { label: string; tone: "in" | "low" | "out" } | null;
  imageUrl: string | null;
  href: string;
};

/** Prix affiché : le plus bas des variantes, préfixé « dès » si elles diffèrent. */
function priceLabel(product: SearchResultProduct): string | null {
  const prices = product.variants
    .map((variant) => variant.price)
    .filter((price): price is NonNullable<typeof price> => Boolean(price));

  if (prices.length === 0) return null;

  const amounts = prices.map((price) => price.amount);
  const lowest = Math.min(...amounts);
  const formatted = formatPrice(lowest, prices[0].currency_code);

  return Math.min(...amounts) === Math.max(...amounts) ? formatted : `dès ${formatted}`;
}

/**
 * Une variante en réassort permanent reste vendable sans stock. Les variantes sans niveau
 * d'inventaire sont ignorées : on ne sait rien d'elles, ce n'est pas une rupture.
 */
function stockBadge(product: SearchResultProduct): Suggestion["badge"] {
  const known = product.variants.filter((variant) => variant.stock !== null);
  if (known.length === 0) return null;

  if (product.variants.some((variant) => variant.allow_backorder)) {
    return { label: "Sur commande", tone: "in" };
  }

  const total = known.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
  if (total <= 0) return { label: "Rupture", tone: "out" };
  if (total <= 5) return { label: `Plus que ${total}`, tone: "low" };
  return { label: "En stock", tone: "in" };
}

/** Au-delà de trois déclinaisons, les lister allongerait le panneau sans rien apprendre. */
function variantLabel(product: SearchResultProduct): string | null {
  const titles = product.variants.map((variant) => variant.title).filter(Boolean);
  if (titles.length <= 1) return null;
  return titles.length <= 3 ? titles.join(" · ") : `${titles.length} déclinaisons`;
}

const BADGE_CLASSES: Record<"in" | "low" | "out", string> = {
  in: "bg-brand-cream text-brand-chocolate/70",
  low: "bg-brand-gold/25 text-brand-chocolate",
  out: "bg-brand-chocolate/10 text-brand-chocolate/50",
};

export default function SearchBar() {
  const router = useRouter();
  const listboxId = useId();

  const [term, setTerm] = useState("");
  // Les résultats sont conservés avec le terme qui les a produits : tant que la frappe a
  // avancé, on sait qu'ils sont périmés sans avoir à les effacer.
  const [answered, setAnswered] = useState<{ term: string; results: SearchResults }>({
    term: "",
    results: EMPTY,
  });
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = term.trim();
  const active = trimmed.length >= MIN_TERM_LENGTH;
  const upToDate = answered.term === trimmed;
  const results = active && upToDate ? answered.results : EMPTY;
  const loading = active && !upToDate;

  // Les marques d'abord : elles mènent à un catalogue entier, le produit à une seule fiche.
  const suggestions = useMemo<Suggestion[]>(
    () => [
      ...results.brands.map((brand) => ({
        kind: "brand" as const,
        key: `brand-${brand.value}`,
        label: brand.value,
        detail: null,
        badge: null,
        imageUrl: brand.image_url,
        href: `/marques/${encodeURIComponent(brand.value)}`,
      })),
      ...results.products.map((product) => ({
        kind: "product" as const,
        key: `product-${product.id}`,
        label: product.title,
        detail: [priceLabel(product), variantLabel(product)].filter(Boolean).join("  ·  ") || null,
        badge: stockBadge(product),
        imageUrl: product.image_url,
        href: `/products/${product.handle}`,
      })),
    ],
    [results]
  );

  // La frappe est temporisée, et chaque nouvelle requête annule la précédente : sans cela une
  // réponse lente arrivée après une plus récente écraserait les bons résultats par des périmés.
  useEffect(() => {
    if (!active) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const results = (await res.json()) as SearchResults;
        setAnswered({ term: trimmed, results });
        setHighlighted(-1);
      } catch {
        // Requête annulée par une frappe plus récente : rien à signaler.
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, active]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setTerm("");
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!suggestions.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlighted(() => {
        const next = event.key === "ArrowDown" ? activeIndex + 1 : activeIndex - 1;
        return (next + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      // Sans sélection au clavier, la première suggestion est la plus pertinente.
      go(suggestions[activeIndex === -1 ? 0 : activeIndex].href);
    }
  };

  const activeIndex = highlighted < suggestions.length ? highlighted : -1;
  const showPanel = open && active;
  const noResults = !loading && !suggestions.length;

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl">
      <div className="relative">
        <Search
          size={20}
          aria-hidden
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-brand-chocolate/40"
        />
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un produit ou une marque…"
          aria-label="Rechercher un produit ou une marque"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-${suggestions[activeIndex]?.key}` : undefined
          }
          className="w-full rounded-full border border-brand-chocolate/15 bg-white py-4 pl-14 pr-12 text-sm text-brand-chocolate shadow-sm outline-none transition-colors placeholder:text-brand-chocolate/40 focus:border-brand-gold-dark [&::-webkit-search-cancel-button]:appearance-none"
        />
        {loading && (
          <Loader2
            size={18}
            aria-hidden
            className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-brand-chocolate/40"
          />
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-brand-chocolate/10 bg-white shadow-lg">
          {loading && !suggestions.length ? (
            <p className="flex items-center justify-center gap-2 px-5 py-6 text-sm text-brand-chocolate/50">
              <Loader2 size={16} aria-hidden className="animate-spin" />
              Recherche en cours…
            </p>
          ) : noResults ? (
            <p className="px-5 py-6 text-center text-sm text-brand-chocolate/60">
              Aucun résultat pour « {term.trim()} »
            </p>
          ) : (
            <ul id={listboxId} role="listbox" className="max-h-96 overflow-y-auto py-2">
              {suggestions.map((suggestion, index) => {
                const previous = suggestions[index - 1];
                const startsSection = !previous || previous.kind !== suggestion.kind;

                return (
                  <li key={suggestion.key}>
                    {startsSection && (
                      <p className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-brand-chocolate/40">
                        {suggestion.kind === "brand" ? "Marques" : "Produits"}
                      </p>
                    )}
                    <button
                      id={`${listboxId}-${suggestion.key}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseEnter={() => setHighlighted(index)}
                      onClick={() => go(suggestion.href)}
                      className={`flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        activeIndex === index ? "bg-brand-cream" : ""
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-cream">
                        {suggestion.imageUrl ? (
                          <Image
                            src={suggestion.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            className={
                              suggestion.kind === "brand"
                                ? "h-full w-full object-contain p-1"
                                : "h-full w-full object-cover"
                            }
                          />
                        ) : (
                          <Tag size={16} aria-hidden className="text-brand-chocolate/30" />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm text-brand-chocolate">
                          {suggestion.label}
                        </span>
                        {suggestion.detail && (
                          <span className="truncate text-xs text-brand-chocolate/55">
                            {suggestion.detail}
                          </span>
                        )}
                      </span>
                      {suggestion.badge && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            BADGE_CLASSES[suggestion.badge.tone]
                          }`}
                        >
                          {suggestion.badge.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
