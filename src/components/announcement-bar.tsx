import { ShieldAlert } from "lucide-react";

/**
 * Rappel légal en tête de toutes les pages. Il occupe la bande qui portait l'offre de
 * livraison, à hauteur inchangée : le message doit donc tenir sur une seule ligne, y compris
 * sur les petits écrans, d'où la tête de phrase abrégée en dessous de `sm`. La fin, qui porte
 * l'interdiction elle-même, est commune aux deux largeurs et ne peut pas diverger.
 */
export default function AnnouncementBar() {
  return (
    <div className="bg-gv-800 text-white">
      <div className="gv-container flex min-h-8 items-center justify-center gap-2 py-1.5 text-center text-xs font-medium">
        <ShieldAlert size={14} aria-hidden className="shrink-0" />
        <span>
          <span className="hidden sm:inline">La vente de produits du vapotage est </span>
          <span className="sm:hidden">Vente </span>
          interdite aux mineurs de moins de 18 ans.
        </span>
      </div>
    </div>
  );
}
