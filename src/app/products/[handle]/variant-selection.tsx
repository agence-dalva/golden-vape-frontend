"use client";

import { createContext, useContext, useState } from "react";

/**
 * Déclinaison choisie, partagée entre le panneau d'achat et la galerie.
 *
 * Le choix se fait dans le panneau, mais c'est la galerie qui doit y répondre : le marchand
 * associe ses visuels aux déclinaisons dans l'administration, et un client qui choisit
 * « Cerise Glacée » s'attend à voir la cartouche cerise, pas la première photo de la fiche.
 */
const Selection = createContext<{ variantId: string; selectVariant: (variantId: string) => void }>({
  variantId: "",
  selectVariant: () => {},
});

export function VariantSelection({
  initialVariantId,
  children,
}: {
  initialVariantId: string;
  children: React.ReactNode;
}) {
  const [variantId, selectVariant] = useState(initialVariantId);

  return <Selection.Provider value={{ variantId, selectVariant }}>{children}</Selection.Provider>;
}

export function useVariantSelection() {
  return useContext(Selection);
}
