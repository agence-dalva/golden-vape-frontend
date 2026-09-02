import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WINDOW = 2;

function pageNumbers(current: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total]);
  for (let page = current - WINDOW; page <= current + WINDOW; page++) {
    if (page >= 1 && page <= total) pages.add(page);
  }

  const ordered = [...pages].sort((a, b) => a - b);
  const output: (number | "gap")[] = [];
  ordered.forEach((page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) output.push("gap");
    output.push(page);
  });
  return output;
}

const baseClass =
  "flex h-11 min-w-11 items-center justify-center rounded-[8px] border px-3 text-[13px] font-medium transition-colors";

/**
 * `hrefFor` reçoit le numéro de page et rend l'URL complète : le tri actif et les autres
 * paramètres restent portés par l'appelant. L'ancre ramène au début de la grille et non au
 * sommet du site.
 */
export default function ProductPagination({
  current,
  total,
  hrefFor,
}: {
  current: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 1 ? (
        <Link
          href={hrefFor(current - 1)}
          rel="prev"
          aria-label="Page précédente"
          className={`${baseClass} border-gv-border bg-gv-card text-gv-text hover:border-gv-border-strong`}
        >
          <ChevronLeft size={16} aria-hidden />
        </Link>
      ) : (
        <span aria-hidden className={`${baseClass} border-gv-border/60 text-gv-text-muted/50`}>
          <ChevronLeft size={16} />
        </span>
      )}

      {pageNumbers(current, total).map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} aria-hidden className="px-1 text-gv-text-muted">
            …
          </span>
        ) : page === current ? (
          <span
            key={page}
            aria-current="page"
            className={`${baseClass} border-gv-800 bg-gv-800 text-white`}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-label={`Page ${page}`}
            className={`${baseClass} border-gv-border bg-gv-card text-gv-text hover:border-gv-border-strong`}
          >
            {page}
          </Link>
        )
      )}

      {current < total ? (
        <Link
          href={hrefFor(current + 1)}
          rel="next"
          aria-label="Page suivante"
          className={`${baseClass} border-gv-border bg-gv-card text-gv-text hover:border-gv-border-strong`}
        >
          <ChevronRight size={16} aria-hidden />
        </Link>
      ) : (
        <span aria-hidden className={`${baseClass} border-gv-border/60 text-gv-text-muted/50`}>
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
