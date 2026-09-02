"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Le détail technique va dans la console du serveur de logs, jamais à l'écran du client.
    console.error("Chargement de la catégorie impossible", error);
  }, [error]);

  return (
    <div className="gv-container py-20">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-xl border border-gv-border bg-gv-card p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gv-50">
          <TriangleAlert size={30} strokeWidth={1.4} aria-hidden className="text-gv-800" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-normal leading-[1.2] text-gv-text">
            Cette catégorie n&apos;a pas pu être chargée.
          </h1>
          <p className="mt-2 text-sm text-gv-text-soft">
            Le catalogue est momentanément injoignable. Réessayez dans un instant.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex min-h-[46px] cursor-pointer items-center rounded-[7px] border border-gv-800 bg-gv-800 px-[22px] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-gv-900"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
