import { ViewTransition } from "react";

/**
 * Transition de page pour le tunnel de commande.
 *
 * Le navigateur assure lui-même le fondu croisé entre l'ancienne et la nouvelle page,
 * sur son compositeur : aucune bibliothèque d'animation, et la transition reste fluide
 * même pendant un chargement de données. Là où l'API manque, la navigation se fait sans
 * animation, sans rien casser.
 *
 * Le sens vient des `transitionTypes` posés sur les liens : `nav-forward` quand on avance
 * dans le tunnel, `nav-back` quand on en revient. Sans type — bouton précédent du
 * navigateur, rafraîchissement — aucune direction n'est jouée, seul le fondu demeure.
 *
 * À placer dans les `page.tsx`, jamais dans un layout : un layout persiste d'une
 * navigation à l'autre, ses animations d'entrée et de sortie ne se déclencheraient donc
 * jamais.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "gv-nav-forward",
        "nav-back": "gv-nav-back",
        default: "gv-fade",
      }}
      exit={{
        "nav-forward": "gv-nav-forward",
        "nav-back": "gv-nav-back",
        default: "gv-fade",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
