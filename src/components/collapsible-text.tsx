"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/** Doit correspondre au `leading` appliqué au texte, faute de quoi le repli coupe mal. */
const LINE_HEIGHT = 1.65;
const FONT_SIZE = 15;
const DURATION_MS = 280;

export default function CollapsibleText({
  children,
  /** Nombre de lignes visibles une fois replié. */
  lines = 5,
}: {
  children: React.ReactNode;
  lines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  // Hauteur naturelle du texte, mesurée sur un élément jamais rogné. `ResizeObserver`
  // déclenche un premier appel dès l'observation : inutile de mesurer dans le corps de
  // l'effet, ce que la règle React du projet interdit de toute façon.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const observer = new ResizeObserver(() => setFullHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // La hauteur repliée s'exprime en `em` : elle est juste dès le premier rendu, sans
  // attendre la mesure — pas de texte entier qui apparaît puis se replie d'un coup.
  const collapsedHeight = lines * LINE_HEIGHT;
  const overflows = fullHeight > collapsedHeight * FONT_SIZE + 1;

  return (
    <div>
      <div className="relative max-w-[720px]">
        <div
          id={contentId}
          className="overflow-hidden transition-[max-height] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            // Animer vers `auto` est impossible : on vise la hauteur mesurée, tenue à jour
            // par l'observateur si le texte se recompose.
            maxHeight: expanded && fullHeight ? `${fullHeight}px` : `${collapsedHeight}em`,
            transitionDuration: `${DURATION_MS}ms`,
          }}
        >
          <div
            ref={innerRef}
            className="whitespace-pre-line text-[15px] leading-[1.65] text-gv-text-soft"
          >
            {children}
          </div>
        </div>

        {/* Dégradé de coupe : il signale que le texte continue, et s'efface au dépliage. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ${
            expanded || !overflows ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {overflows && (
        <button
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-gv-800 transition-colors hover:text-gv-900"
        >
          {expanded ? "Réduire" : "Lire la suite"}
          <ChevronDown
            size={15}
            aria-hidden
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
