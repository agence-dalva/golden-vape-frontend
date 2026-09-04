"use client";

import ProductGridSkeleton from "./product-grid-skeleton";
import { useFilterTransition } from "./filter-transition";

/**
 * Remplace la grille par son squelette tant que le serveur recalcule la sélection. Les enfants
 * sont rendus par le serveur et traversent la frontière client sans être ré-exécutés ici.
 */
export default function PendingGrid({
  children,
  count,
}: {
  children: React.ReactNode;
  /** Autant de cartes fantômes que la page en affichait : la hauteur ne bouge pas. */
  count: number;
}) {
  const { pending } = useFilterTransition();

  return pending ? <ProductGridSkeleton count={count} /> : <>{children}</>;
}
