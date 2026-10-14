import type { Horaire } from "@/lib/retrait-boutique";

/**
 * Horaires d'ouverture de la boutique, pour qui vient retirer sa commande.
 *
 * Rien si le backend n'en fournit pas : une ancienne version de l'API, ou une erreur, ne
 * doit pas laisser un bloc « Horaires » vide.
 */
export default function HorairesRetrait({
  horaires,
  className = "",
}: {
  horaires: Horaire[] | undefined;
  className?: string;
}) {
  if (!horaires?.length) return null;

  return (
    <dl className={`grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 ${className}`}>
      {horaires.map((h) => (
        <div key={h.jours} className="contents">
          <dt>{h.jours}</dt>
          <dd className="font-medium">{h.heures}</dd>
        </div>
      ))}
    </dl>
  );
}
