"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleText({
  children,
  /** Nombre de lignes visibles une fois replié. */
  lines = 5,
}: {
  children: React.ReactNode;
  lines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  // Le bouton n'a de sens que si le texte dépasse réellement — inutile de proposer
  // « Lire la suite » sur une description de deux lignes. La mesure ne se fait qu'à l'état
  // replié : déplié, la hauteur visible égale la hauteur totale et le bouton disparaîtrait.
  useEffect(() => {
    if (expanded) return;

    const element = contentRef.current;
    if (!element) return;

    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div>
      <div className="relative">
        <div
          ref={contentRef}
          id={contentId}
          className="max-w-[720px] whitespace-pre-line text-[15px] leading-[1.65] text-gv-text-soft"
          style={expanded ? undefined : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" }}
        >
          {children}
        </div>

        {/* Dégradé de coupe : il signale que le texte continue, sans trancher une lettre en deux. */}
        {!expanded && overflows && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 max-w-[720px] bg-gradient-to-t from-white to-transparent"
          />
        )}
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
