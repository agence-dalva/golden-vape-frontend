"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * Activité partagée entre les lignes du panier et le récapitulatif.
 *
 * Une ligne change de quantité sans attendre le serveur : elle affiche tout de suite la
 * quantité et le total qu'elle a demandés. Le récapitulatif, lui, ne sait pas recalculer
 * remises et port de son côté : il signale qu'il se met à jour tant qu'un appel est en
 * cours, et le bouton de commande attend — partir au paiement sur un total périmé serait
 * pire qu'une demi-seconde d'attente.
 *
 * Un compteur plutôt qu'un booléen : plusieurs lignes peuvent être en cours à la fois.
 */
const Activite = createContext<{ enCours: boolean; commencer: () => () => void }>({
  enCours: false,
  commencer: () => () => {},
});

export function CartActivity({ children }: { children: React.ReactNode }) {
  const [appels, setAppels] = useState(0);

  // Rend la fonction à appeler quand l'appel se termine, quelle qu'en soit l'issue.
  const commencer = useCallback(() => {
    setAppels((n) => n + 1);
    let termine = false;
    return () => {
      if (termine) return;
      termine = true;
      setAppels((n) => n - 1);
    };
  }, []);

  return <Activite.Provider value={{ enCours: appels > 0, commencer }}>{children}</Activite.Provider>;
}

export function useCartActivity() {
  return useContext(Activite);
}
