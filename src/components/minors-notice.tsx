import { ShieldAlert } from "lucide-react";

/**
 * Rappel légal mis en évidence sur la page d'accueil. Le pied de page en porte déjà une
 * version en petits caractères, parmi les autres mentions : celle-ci doit se voir sans
 * qu'on la cherche, d'où le filet coloré et le pictogramme.
 */
export default function MinorsNotice() {
  return (
    <aside className="gv-container pt-10 sm:pt-12">
      <p className="flex items-start gap-3.5 rounded-xl border border-gv-border border-l-[3px] border-l-gv-danger bg-gv-card px-5 py-4 shadow-gv-xs">
        <ShieldAlert size={20} aria-hidden className="mt-px shrink-0 text-gv-danger" />
        <span className="text-[13.5px] leading-relaxed text-gv-text-soft">
          <strong className="font-semibold text-gv-text">Interdit aux mineurs.</strong> La
          vente de produits du vapotage est interdite aux mineurs de moins de 18 ans. Une
          pièce d&apos;identité peut être demandée.
        </span>
      </p>
    </aside>
  );
}
