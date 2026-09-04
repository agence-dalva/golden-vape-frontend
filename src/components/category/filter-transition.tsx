"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Attente partagée entre le panneau de filtres et la grille.
 *
 * Les filtres restent des liens — indexables, ouvrables dans un nouvel onglet — mais un clic
 * simple passe par une transition React plutôt que par une navigation nue. La grille peut
 * alors afficher un squelette pendant que le serveur recalcule, au lieu de laisser la page
 * figée sur l'ancien résultat le temps de l'aller-retour.
 */
const Attente = createContext<{ pending: boolean; naviguer: (href: string) => void }>({
  pending: false,
  naviguer: () => {},
});

export function FilterTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const naviguer = (href: string) => {
    // `scroll: false` : la position est déjà tenue par l'ancre `#produits` des liens.
    startTransition(() => router.push(href, { scroll: false }));
  };

  return <Attente.Provider value={{ pending, naviguer }}>{children}</Attente.Provider>;
}

export function useFilterTransition() {
  return useContext(Attente);
}

/**
 * Interception d'un clic de filtre. Les clics avec modificateur — nouvel onglet, nouvelle
 * fenêtre — sont laissés au navigateur : les détourner priverait le lien de son comportement
 * attendu.
 */
export function shouldIntercept(event: React.MouseEvent): boolean {
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);
}
