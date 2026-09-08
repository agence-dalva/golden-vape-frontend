"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import type { MedusaCategory, MedusaCategoryNode, SearchResults } from "@/lib/medusa";
import { matchesTerm, searchWords } from "@/lib/search-terms";
import SearchPanel, { toProductItems, toRailItems, type Cursor } from "./search-panel";

const DEBOUNCE_MS = 250;
const MIN_TERM_LENGTH = 2;
const MAX_CATEGORIES = 4;
/*
  Le panneau part du bord gauche du champ et s'étend jusqu'au bord droit de la page, sans
  dépasser cette largeur. La place est là — à droite du champ il n'y a que du vide — et la
  liste étroite d'avant gaspillait les cent résultats que le backend renvoie déjà. Au-delà de
  mille pixels en revanche, la dernière colonne s'éloignerait trop du regard, qui reste posé
  sur le champ.
*/
const MAX_PANEL_WIDTH = 1060;
/** Plancher du panneau : en deçà, mieux vaut qu'il déborde que de n'y rien lire. */
const MIN_PANEL_HEIGHT = 260;

const EMPTY: SearchResults = { products: [], brands: [] };
const ARROWS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];

type Rubrique = { name: string; handle: string };

/** L'arbre entier à plat : une sous-rubrique répond aussi bien qu'une racine. */
function flatten(nodes: (MedusaCategory | MedusaCategoryNode)[]): Rubrique[] {
  return nodes.flatMap((node) => [
    { name: node.name, handle: node.handle },
    ...flatten(node.category_children ?? []),
  ]);
}

/**
 * Déplacement du curseur dans le panneau, qui n'est plus une liste mais deux zones : un rail
 * vertical et une grille. Les flèches y suivent ce que l'œil voit — la descente compte une
 * rangée, pas une carte — et le rail se rejoint par la gauche. Rien ne boucle : sur cent
 * résultats, repartir du haut en fin de liste se lit comme un bug plutôt que comme un cycle.
 */
function nextCursor(
  key: string,
  cursor: Cursor,
  rail: number,
  grid: number,
  columns: number
): Cursor {
  if (!cursor) {
    if (key === "ArrowUp") {
      if (grid > 0) return { zone: "grid", index: grid - 1 };
      return rail > 0 ? { zone: "rail", index: rail - 1 } : null;
    }
    // Le rail passe devant, comme pour la touche Entrée : une marque mène à un catalogue
    // entier, un produit à une seule fiche.
    if (rail > 0) return { zone: "rail", index: 0 };
    return grid > 0 ? { zone: "grid", index: 0 } : null;
  }

  if (cursor.zone === "rail") {
    switch (key) {
      case "ArrowDown":
        // Passé le dernier raccourci la descente continue dans la grille : c'est le seul
        // chemin qui traverse le panneau sans avoir à changer de flèche.
        if (cursor.index + 1 < rail) return { zone: "rail", index: cursor.index + 1 };
        return grid > 0 ? { zone: "grid", index: 0 } : cursor;
      case "ArrowUp":
        // Remonter au-delà du premier raccourci rend la main au champ de saisie.
        return cursor.index > 0 ? { zone: "rail", index: cursor.index - 1 } : null;
      case "ArrowRight":
        return grid > 0 ? { zone: "grid", index: 0 } : cursor;
      default:
        return cursor;
    }
  }

  switch (key) {
    case "ArrowDown":
      // Depuis l'avant-dernière rangée, incomplète, on rejoint la dernière carte plutôt que
      // de buter sur le vide.
      return { zone: "grid", index: Math.min(cursor.index + columns, grid - 1) };
    case "ArrowUp":
      if (cursor.index >= columns) return { zone: "grid", index: cursor.index - columns };
      return rail > 0 ? { zone: "rail", index: rail - 1 } : null;
    case "ArrowRight":
      return { zone: "grid", index: Math.min(cursor.index + 1, grid - 1) };
    case "ArrowLeft":
      if (cursor.index % columns !== 0) return { zone: "grid", index: cursor.index - 1 };
      return rail > 0 ? { zone: "rail", index: 0 } : cursor;
    default:
      return cursor;
  }
}

export default function SearchBar({ categories = [] }: { categories?: MedusaCategory[] }) {
  const router = useRouter();
  const listboxId = useId();

  const [term, setTerm] = useState("");
  // Les résultats sont conservés avec le terme qui les a produits : tant que la frappe a
  // avancé, on sait qu'ils sont périmés sans avoir à les effacer — et on peut continuer à
  // les montrer, en retrait, plutôt que de vider le panneau à chaque lettre.
  const [answered, setAnswered] = useState<{ term: string; results: SearchResults }>({
    term: "",
    results: EMPTY,
  });
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Cursor>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const trimmed = term.trim();
  const active = trimmed.length >= MIN_TERM_LENGTH;
  const loading = active && answered.term !== trimmed;

  /*
    Le panneau est monté dès que le terme est cherchable, et non seulement quand il est
    ouvert : rouvrir la recherche sur une frappe déjà répondue n'a alors rien à reconstruire,
    et le fondu de fermeture a un élément à animer. Il disparaît avec le terme.
  */
  const showPanel = open && active;

  const words = useMemo(() => searchWords(answered.term), [answered.term]);
  const rubriques = useMemo(() => flatten(categories), [categories]);

  const railItems = useMemo(
    () =>
      toRailItems(
        answered.results.brands,
        rubriques.filter((rubrique) => matchesTerm(rubrique.name, words)).slice(0, MAX_CATEGORIES)
      ),
    [answered.results.brands, rubriques, words]
  );
  const productItems = useMemo(() => toProductItems(answered.results.products), [answered.results]);

  // Le curseur peut désigner une carte que la réponse suivante n'a plus : on le tient pour nul
  // plutôt que d'ouvrir un produit disparu de l'écran.
  const item = cursor
    ? cursor.zone === "rail"
      ? railItems[cursor.index]
      : productItems[cursor.index]
    : undefined;
  const safeCursor = item ? cursor : null;

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
        setCursor(null);
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

  /*
    Le panneau déborde du champ qui le porte : sa largeur ne peut donc pas être déclarée en
    CSS, elle dépend de la distance entre ce champ et le bord droit de la page. Cette marge
    est lue sur le conteneur du gabarit plutôt que redéclarée ici — elle change trois fois
    selon la largeur de l'écran, et deux valeurs finiraient par diverger.

    Mesuré dans une fonction de référence plutôt que dans un effet : elle est appelée au
    montage du panneau, avant la première peinture, et n'a donc pas à passer par un état qui
    provoquerait un second rendu à chaque ouverture.
  */
  const panelRef = useCallback((panel: HTMLDivElement | null) => {
    if (!panel) return;

    const measure = () => {
      const anchor = containerRef.current;
      if (!anchor) return;

      const { left, width } = anchor.getBoundingClientRect();
      const page = anchor.closest(".gv-container")?.getBoundingClientRect();
      const right = page ? page.right : window.innerWidth - 16;

      // Posée en variable et non en largeur : le panneau décide lui-même de s'en servir, et
      // se replie sur celle du champ quand il n'a qu'une ligne à afficher.
      panel.style.setProperty(
        "--gv-search-panel-w",
        `${Math.min(MAX_PANEL_WIDTH, Math.max(width, right - left))}px`
      );

      // Hauteur restante sous le champ, et non une fraction de l'écran : sur un téléphone
      // court, l'en-tête et le clavier mangent déjà la moitié de la page, et un panneau
      // dimensionné en `vh` passait sous le bord bas.
      panel.style.setProperty(
        "--gv-search-panel-h",
        `${Math.max(MIN_PANEL_HEIGHT, window.innerHeight - panel.getBoundingClientRect().top - 16)}px`
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /** Recherche terminée : le panneau se referme et le champ se vide, prêt pour la suivante. */
  const close = () => {
    setOpen(false);
    setTerm("");
    setCursor(null);
  };

  /* Les résultats sont des liens : le clic navigue tout seul, et se prête au clic du milieu
     comme au « ouvrir dans un nouvel onglet ». Seule la touche Entrée doit encore pousser la
     navigation elle-même. */
  const go = (href: string) => {
    close();
    router.push(href);
  };

  /** Nombre de colonnes réellement rendues : il change avec la largeur et avec la présence
      du rail, le lire sur la grille évite de le redire ici. */
  const columnCount = () => {
    const grid = gridRef.current;
    if (!grid) return 1;
    return Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setCursor(null);
      return;
    }

    if (!railItems.length && !productItems.length) return;

    if (event.key === "Enter") {
      event.preventDefault();
      // Sans sélection au clavier, le premier raccourci l'emporte sur le premier produit :
      // qui tape le nom d'une marque veut son catalogue, pas une de ses références.
      const target = item ?? railItems[0] ?? productItems[0];
      if (target) go(target.href);
      return;
    }

    if (!ARROWS.includes(event.key)) return;

    event.preventDefault();
    setOpen(true);
    setCursor(
      nextCursor(event.key, safeCursor, railItems.length, productItems.length, columnCount())
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[650px]">
      {/*
        Voile posé sous l'en-tête, qui reste net : le panneau prend la moitié de l'écran, sans
        cette mise au point le catalogue continuerait de tirer l'œil derrière lui. Il est rendu
        hors de l'en-tête, dont l'empilement le tiendrait sinon au-dessus de tout.
      */}
      {active &&
        createPortal(
          <div
            aria-hidden
            /* `invisible` et non `opacity-0` seul : un voile transparent mais présent
               intercepterait tous les clics de la page une fois la recherche refermée. */
            className={`fixed inset-0 z-20 bg-gv-950/20 transition-[opacity,visibility] duration-200 ease-out ${
              showPanel ? "visible opacity-100" : "invisible opacity-0"
            }`}
          />,
          document.body
        )}

      <div className="relative">
        <Search
          size={20}
          aria-hidden
          className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-gv-text-muted"
        />
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setCursor(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un produit, une marque…"
          aria-label="Rechercher un produit ou une marque"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={item ? `${listboxId}-${item.key}` : undefined}
          className="h-[54px] w-full rounded-[10px] border border-gv-border-strong bg-white pl-[50px] pr-11 text-sm text-gv-text outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-gv-text-muted focus:border-gv-800 focus:shadow-[0_0_0_3px_rgb(68_54_46/0.10)] [&::-webkit-search-cancel-button]:appearance-none"
        />
        {loading && (
          <Loader2
            size={18}
            aria-hidden
            className="absolute right-[18px] top-1/2 -translate-y-1/2 animate-spin text-gv-text-muted"
          />
        )}
      </div>

      {active && (
        <SearchPanel
          railItems={railItems}
          productItems={productItems}
          words={words}
          term={trimmed}
          loading={loading}
          // Les résultats de la frappe précédente restent affichés, en retrait, le temps que
          // les nouveaux arrivent : les effacer ferait clignoter le panneau à chaque lettre.
          stale={loading && answered.term.length > 0}
          cursor={safeCursor}
          open={showPanel}
          listboxId={listboxId}
          panelRef={panelRef}
          gridRef={gridRef}
          onHover={setCursor}
          onFollow={close}
        />
      )}
    </div>
  );
}
