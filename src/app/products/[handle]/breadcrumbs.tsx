import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="py-[18px]">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {crumb.href && !last ? (
                <Link href={crumb.href} className="text-gv-text-soft transition-colors hover:text-gv-800">
                  {crumb.label}
                </Link>
              ) : (
                <span className={last ? "text-gv-text" : "text-gv-text-soft"} aria-current={last ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight size={13} aria-hidden className="text-gv-text-muted" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
