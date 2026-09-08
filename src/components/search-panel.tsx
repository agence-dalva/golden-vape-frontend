"use client";

import { useEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, LayoutGrid, SearchX } from "lucide-react";
import type { SearchResultBrand, SearchResultProduct } from "@/lib/medusa";
import { formatPrice, orderByLabelledMeasure } from "@/lib/medusa";
import { fold } from "@/lib/search-terms";

/*
  Le panneau de résultats.

  Il est volontairement plus large que le champ — la place est là, à droite du logo — mais
  reste un panneau ancré : la page continue d'exister derrière lui. Un plein écran obligerait
  à quitter puis retrouver le contexte pour une frappe qui, la plupart du temps, ne cherche
  qu'un produit.

  Deux zones : un rail à gauche pour ce qui mène à un catalogue entier — marques et rubriques —
  et une grille à droite pour les produits, qui mènent à une fiche. La distinction n'est pas
  décorative : elle évite qu'une marque se retrouve noyée au milieu de cent produits alors
  qu'elle répond souvent mieux à la recherche.
*/

/** Cible du curseur clavier : la zone, puis le rang dans cette zone. */
export type Cursor = { zone: "rail" | "grid"; index: number } | null;

export type RailItem = {
  kind: "brand" | "category";
  key: string;
  label: string;
  href: string;
  imageUrl: string | null;
};

export type ProductItem = {
  key: string;
  label: string;
  /** Mots-clés saisis à l'administration : ils expliquent pourquoi le produit répond au terme. */
  secondary: string | null;
  price: { from: boolean; label: string } | null;
  badge: string | null;
  imageUrl: string | null;
  href: string;
};

/** Seuil des « dernières pièces », le même que sur les cartes du catalogue. */
const LOW_STOCK_THRESHOLD = 3;

/** Prix affiché : le plus bas des variantes, annoncé « dès » quand elles diffèrent. */
function priceOf(product: SearchResultProduct): ProductItem["price"] {
  const prices = product.variants
    .map((variant) => variant.price)
    .filter((price): price is NonNullable<typeof price> => Boolean(price));

  if (prices.length === 0) return null;

  const amounts = prices.map((price) => price.amount);
  const lowest = Math.min(...amounts);

  return {
    from: lowest !== Math.max(...amounts),
    label: formatPrice(lowest, prices[0].currency_code),
  };
}

/**
 * Une variante en réassort permanent reste vendable sans stock. Les variantes sans niveau
 * d'inventaire sont ignorées : on ne sait rien d'elles, ce n'est pas une rupture.
 *
 * Rien n'est affiché quand tout va bien, comme sur les cartes du catalogue : cent pastilles
 * « En stock » identiques ne disent rien, et noieraient les trois qui comptent.
 */
function badgeOf(product: SearchResultProduct): string | null {
  const known = product.variants.filter((variant) => variant.stock !== null);
  if (known.length === 0) return null;

  if (product.variants.some((variant) => variant.allow_backorder)) {
    return "Sur commande";
  }

  const total = known.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
  if (total <= 0) return "Indisponible";
  return total <= LOW_STOCK_THRESHOLD ? "Dernières pièces" : null;
}

/** Au-delà de trois déclinaisons, les lister allongerait la carte sans rien apprendre. */
function variantsOf(product: SearchResultProduct): string | null {
  // Mêmes dosages que sur la fiche, donc même classement : les lister dans l'ordre de saisie
  // donnerait « 6 mg · 0 mg · 12 mg » sous le titre.
  const titles = orderByLabelledMeasure(product.variants, (variant) => variant.title ?? "")
    .map((variant) => variant.title)
    .filter(Boolean);
  if (titles.length <= 1) return null;
  return titles.length <= 3 ? titles.join(" · ") : `${titles.length} déclinaisons`;
}

export function toRailItems(
  brands: SearchResultBrand[],
  categories: { name: string; handle: string }[]
): RailItem[] {
  return [
    ...brands.map((brand) => ({
      kind: "brand" as const,
      key: `brand-${brand.value}`,
      label: brand.value,
      href: `/marques/${encodeURIComponent(brand.value)}`,
      imageUrl: brand.image_url,
    })),
    ...categories.map((category) => ({
      kind: "category" as const,
      key: `category-${category.handle}`,
      label: category.name,
      href: `/categories/${category.handle}`,
      imageUrl: null,
    })),
  ];
}

export function toProductItems(products: SearchResultProduct[]): ProductItem[] {
  return products.map((product) => ({
    key: `product-${product.id}`,
    label: product.title,
    // Une seule ligne secondaire : deux lignes grises de même graisse se liraient comme un
    // paragraphe. Les mots-clés priment, ce sont eux qui ont fait remonter le produit.
    secondary: product.subtitle?.trim() || variantsOf(product),
    price: priceOf(product),
    badge: badgeOf(product),
    imageUrl: product.image_url,
    href: `/products/${product.handle}`,
  }));
}

/**
 * Surlignage du terme cherché : intervalles couverts par les mots, fusionnés et ordonnés.
 * `fold` replie caractère par caractère, les positions désignent donc bien les lettres de
 * l'original — voir `lib/search-terms`.
 */
function matchedRanges(text: string, words: string[]): [number, number][] {
  const folded = fold(text);
  const found: [number, number][] = [];

  for (const word of words) {
    let from = folded.indexOf(word);
    while (from !== -1) {
      found.push([from, from + word.length]);
      from = folded.indexOf(word, from + word.length);
    }
  }

  found.sort((a, b) => a[0] - b[0]);

  return found.reduce<[number, number][]>((merged, range) => {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
      return merged;
    }
    return [...merged, [...range] as [number, number]];
  }, []);
}

function Highlight({ text, words }: { text: string; words: string[] }) {
  const ranges = words.length ? matchedRanges(text, words) : [];
  if (ranges.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  ranges.forEach(([start, end], index) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={index} className="rounded-[3px] bg-gv-100 px-px text-gv-900">
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}

/** Cartes grisées pendant la toute première recherche : une grille qui se remplit se lit
    mieux qu'un bloc vide qui saute d'un coup à pleine hauteur. */
function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-xl bg-gv-card shadow-gv-raised"
        >
          <div className="h-[150px] w-full bg-gv-image" />
          <div className="flex flex-col gap-2 px-2.5 pb-2.5 pt-2.5">
            <div className="h-3 w-4/5 rounded bg-gv-image" />
            <div className="h-3 w-1/2 rounded bg-gv-image" />
            <div className="mt-1 h-3.5 w-1/3 rounded bg-gv-image" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ label, count }: { label: string; count?: number }) {
  return (
    <p className="flex items-baseline gap-1.5 px-1 pb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gv-text-muted">
      {label}
      {count !== undefined && (
        <span className="font-semibold normal-case tracking-normal text-gv-text-soft">{count}</span>
      )}
    </p>
  );
}

export default function SearchPanel({
  railItems,
  productItems,
  words,
  term,
  loading,
  stale,
  cursor,
  open,
  listboxId,
  panelRef,
  gridRef,
  onHover,
  onFollow,
}: {
  railItems: RailItem[];
  productItems: ProductItem[];
  /** Mots du terme ayant produit ces résultats, repliés : ils pilotent le surlignage. */
  words: string[];
  term: string;
  loading: boolean;
  /** Résultats d'une frappe précédente, affichés en attendant les nouveaux. */
  stale: boolean;
  cursor: Cursor;
  open: boolean;
  listboxId: string;
  /** Mesure la largeur du panneau, que le CSS ne peut pas déduire — cf. `search-bar`. */
  panelRef: (node: HTMLDivElement | null) => void;
  /** La navigation au clavier y lit le nombre de colonnes réellement rendues. */
  gridRef: RefObject<HTMLDivElement | null>;
  onHover: (cursor: Cursor) => void;
  /** Clic sur un résultat : la navigation est faite par le lien, il ne reste qu'à refermer. */
  onFollow: () => void;
}) {
  const activeRef = useRef<HTMLAnchorElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Le curseur clavier peut désigner une carte hors de la zone visible : les cent résultats
  // défilent. `nearest` ne déplace rien quand elle est déjà à l'écran, donc le survol à la
  // souris ne provoque aucun saut.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // Une nouvelle réponse remet la grille en haut : sans cela, une lettre de plus laisserait le
  // client au milieu d'une liste qu'il n'a pas encore vue commencer.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [productItems]);

  const empty = !loading && productItems.length === 0 && railItems.length === 0;

  return (
    <div
      ref={panelRef}
      /* `visibility` fait partie des propriétés animées : le panneau reste cliquable pendant
         tout le fondu sortant, et sort de l'arbre d'accessibilité une fois fermé. */
      className={`gv-search-panel-in absolute left-0 top-full z-40 mt-2 flex max-h-[min(var(--gv-search-panel-h,80vh),660px)] flex-col overflow-hidden rounded-[14px] border border-gv-border bg-gv-page shadow-gv-md transition-[opacity,translate,visibility] duration-200 ease-out ${
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1.5 opacity-0"
      } ${
        // Une phrase seule n'a pas besoin de la pleine largeur : le panneau reste alors sur
        // celle du champ, sinon un grand rectangle vide s'ouvrirait pour une ligne de texte.
        empty ? "w-full" : "w-[var(--gv-search-panel-w,100%)]"
      }`}
    >
      {empty ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <SearchX size={22} aria-hidden className="text-gv-text-muted" />
          <p className="text-sm font-semibold text-gv-text">Aucun résultat pour « {term} »</p>
          <p className="text-xs text-gv-text-soft">
            Essayez un nom de marque, un arôme ou une contenance.
          </p>
        </div>
      ) : (
        <>
          {/*
            Une seule liste pour les deux zones : le champ n'en pilote qu'une, et les groupes
            distinguent ce qui mène à un catalogue de ce qui mène à une fiche.
          */}
          <div
            id={listboxId}
            role="listbox"
            aria-label="Résultats de la recherche"
            className={`flex min-h-0 flex-1 flex-col lg:flex-row ${stale ? "opacity-60" : "opacity-100"} transition-opacity duration-150`}
          >
            {railItems.length > 0 && (
              <div
                role="group"
                aria-label="Marques et rubriques"
                /* En dessous du bureau le rail passe au-dessus en bandeau défilant : à cette
                   largeur, une colonne de gauche ne laisserait rien aux produits. */
                className="shrink-0 overscroll-contain border-b border-gv-border bg-gv-soft p-3 lg:w-[228px] lg:overflow-y-auto lg:border-b-0 lg:border-r"
              >
                <SectionTitle label="Y aller directement" />
                <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:pb-0">
                  {railItems.map((item, index) => {
                    const active = cursor?.zone === "rail" && cursor.index === index;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        id={`${listboxId}-${item.key}`}
                        ref={active ? activeRef : null}
                        role="option"
                        aria-selected={active}
                        /* Le focus reste dans le champ, que les flèches pilotent : c'est lui
                           qui désigne l'option courante par `aria-activedescendant`. */
                        tabIndex={-1}
                        prefetch={false}
                        onMouseEnter={() => onHover({ zone: "rail", index })}
                        onClick={onFollow}
                        className={`flex shrink-0 items-center gap-2.5 rounded-[10px] p-1.5 text-left transition-colors duration-150 lg:w-full ${
                          active
                            ? "bg-gv-card shadow-gv-xs ring-2 ring-gv-800/25"
                            : "hover:bg-gv-card/70"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-gv-card shadow-gv-xs">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt=""
                              width={36}
                              height={36}
                              className="h-full w-full object-contain p-0.5"
                            />
                          ) : (
                            <LayoutGrid size={15} aria-hidden className="text-gv-text-muted" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-gv-text">
                            <Highlight text={item.label} words={words} />
                          </span>
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-gv-text-muted">
                            {item.kind === "brand" ? "Marque" : "Rubrique"}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              ref={scrollRef}
              role="group"
              aria-label="Produits"
              className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
            >
              {loading && productItems.length === 0 ? (
                <Skeleton />
              ) : productItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gv-text-soft">
                  Aucun produit pour « {term} » — mais la marque ci-contre y mène.
                </p>
              ) : (
                <>
                  <div className="px-4 pb-0 pt-3">
                    <SectionTitle label="Produits" count={productItems.length} />
                  </div>
                  <div
                    ref={gridRef}
                    /* Une colonne de plus quand le rail est absent : le titre d'un e-liquide
                       tient encore sur deux lignes à cette largeur, en deçà il se coupe. */
                    className={`grid grid-cols-2 gap-2.5 px-3 pb-3 sm:grid-cols-3 ${
                      railItems.length === 0 ? "xl:grid-cols-4" : ""
                    }`}
                  >
                    {productItems.map((item, index) => {
                      const active = cursor?.zone === "grid" && cursor.index === index;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          id={`${listboxId}-${item.key}`}
                          ref={active ? activeRef : null}
                          role="option"
                          aria-selected={active}
                          tabIndex={-1}
                          /* Cent liens dans le panneau : les précharger tous inonderait le
                             serveur pour une seule fiche réellement ouverte. */
                          prefetch={false}
                          onMouseEnter={() => onHover({ zone: "grid", index })}
                          onClick={onFollow}
                          /* Même carte que le catalogue, en plus petit : image au-dessus,
                             titre, prix collé en bas. La sélection doit en revanche se voir
                             d'un coup d'œil sur une grille de cent vignettes — un relief de
                             plus s'y perdait, d'où le filet et le fond teinté, seuls accents
                             dont dispose une palette sans couleur d'appui. */
                          className={`group grid grid-rows-[auto_1fr] overflow-hidden rounded-xl transition-[background-color,box-shadow,translate] duration-150 ${
                            active
                              ? "-translate-y-px bg-gv-50 shadow-gv-md ring-2 ring-gv-800/30"
                              : "bg-gv-card shadow-gv-raised"
                          }`}
                        >
                          {/* Fond blanc : les photos du catalogue sont détourées sur blanc,
                              une teinte ferait apparaître un rectangle clair derrière. */}
                          <span className="relative block h-[150px] w-full overflow-hidden bg-white">
                            {item.badge && (
                              <span className="absolute left-2 top-2 z-10 inline-flex h-[21px] items-center rounded-[5px] border border-gv-800/20 bg-gv-50 px-1.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-gv-800">
                                {item.badge}
                              </span>
                            )}
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt=""
                                fill
                                sizes="(min-width: 1024px) 260px, 45vw"
                                className="object-contain p-2.5 transition-transform duration-200 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-gv-text-muted">
                                <ImageOff size={20} aria-hidden />
                              </span>
                            )}
                          </span>

                          {/* `min-w-0` : la ligne secondaire est tronquée, donc en `nowrap`,
                              et sa largeur minimale intrinsèque vaut sinon le texte entier. */}
                          <span className="flex min-w-0 flex-col px-2.5 pb-2.5 pt-2 text-left">
                            <span className="line-clamp-2 text-[12.5px] font-semibold leading-[1.35] text-gv-text">
                              <Highlight text={item.label} words={words} />
                            </span>
                            {item.secondary && (
                              <span className="mt-0.5 truncate text-[11px] leading-snug text-gv-text-muted">
                                <Highlight text={item.secondary} words={words} />
                              </span>
                            )}
                            {/* Prix collé au bas : il s'aligne d'une carte à l'autre quel que
                                soit le nombre de lignes du titre. */}
                            <span className="mt-auto pt-1.5">
                              {item.price ? (
                                <span className="text-[14px] font-bold tracking-[-0.01em] text-gv-text">
                                  {item.price.from && (
                                    <span className="mr-1 text-[10.5px] font-medium text-gv-text-soft">
                                      dès
                                    </span>
                                  )}
                                  {item.price.label}
                                </span>
                              ) : (
                                <span className="text-[11.5px] font-medium text-gv-text-muted">
                                  Prix sur demande
                                </span>
                              )}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Le clavier ouvre le panneau aussi bien que la souris : autant le dire, la
              navigation en grille ne se devine pas. Masqué là où il n'y a pas de clavier. */}
          <div className="hidden items-center justify-between gap-4 border-t border-gv-border bg-gv-card px-4 py-2 text-[11px] text-gv-text-muted lg:flex">
            <span>
              {productItems.length > 0 && (
                <>
                  {productItems.length} produit{productItems.length > 1 ? "s" : ""}
                </>
              )}
              {productItems.length > 0 && railItems.length > 0 && " · "}
              {railItems.length > 0 && (
                <>
                  {railItems.length} raccourci{railItems.length > 1 ? "s" : ""}
                </>
              )}
            </span>
            <span className="flex items-center gap-2">
              <Key>↑</Key>
              <Key>↓</Key>
              <Key>←</Key>
              <Key>→</Key>
              naviguer
              <Key>Entrée</Key>
              ouvrir
              <Key>Échap</Key>
              fermer
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-[5px] border border-gv-border bg-gv-page px-1.5 py-0.5 font-sans text-[10px] font-semibold text-gv-text-soft">
      {children}
    </kbd>
  );
}
