"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS, DEFAULT_SORT } from "@/lib/catalog-sort";

/**
 * Le tri vit dans l'URL : le lien reste partageable et le bouton Retour du navigateur
 * restaure l'état précédent. Un `select` natif plutôt qu'un menu maison — il est déjà
 * navigable au clavier et utilisable au doigt.
 */
export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === DEFAULT_SORT) {
      params.delete("tri");
    } else {
      params.set("tri", next);
    }
    // Changer de tri recompose la liste entière : rester en page 4 n'aurait aucun sens.
    params.delete("page");

    const query = params.toString();
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
  };

  return (
    <label className="flex items-center gap-2.5 text-[13px] text-gv-text-soft">
      <span className="whitespace-nowrap">Trier par :</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          disabled={isPending}
          className="h-11 cursor-pointer appearance-none rounded-[8px] bg-gv-card py-0 pl-3.5 pr-9 text-[13px] font-medium text-gv-text shadow-gv-raised transition-shadow hover:shadow-gv-raised-strong focus-visible:shadow-gv-raised-strong disabled:cursor-wait"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gv-text-muted"
        />
      </span>
    </label>
  );
}
