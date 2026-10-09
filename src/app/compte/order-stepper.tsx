import { Check } from "lucide-react";
import {
  ORDER_STAGES,
  PICKUP_STAGES,
  PICKUP_STAGE_LABELS,
  STAGE_LABELS,
  formatShortDate,
  type OrderStage,
} from "@/lib/order-status";

/**
 * Jalons d'une commande : commandée, préparée, expédiée, livrée — ou, pour un retrait en
 * boutique, commandée, prête à retirer, retirée.
 *
 * Les jalons franchis portent une coche et leur date ; le jalon en cours est plein sans
 * coche ; les suivants restent en creux. Le trait entre deux jalons se remplit avec le
 * premier des deux — c'est ce qui donne la lecture d'une progression, et non de quatre
 * pastilles côte à côte.
 */
export default function OrderStepper({
  stage,
  dates,
  retrait = false,
}: {
  stage: OrderStage;
  dates: Partial<Record<OrderStage, string>>;
  retrait?: boolean;
}) {
  const jalons = retrait ? PICKUP_STAGES : ORDER_STAGES;
  const libelles = retrait ? PICKUP_STAGE_LABELS : STAGE_LABELS;
  const atteint = jalons.indexOf(stage);

  return (
    <ol className="flex w-full items-start" aria-label="Avancement de la commande">
      {jalons.map((jalon, index) => {
        const franchi = index < atteint;
        const enCours = index === atteint;
        const date = dates[jalon];
        const dernier = index === jalons.length - 1;

        return (
          <li key={jalon} className={dernier ? "flex flex-col items-center" : "flex flex-1 flex-col"}>
            <div className={dernier ? "flex items-center" : "flex w-full items-center"}>
              <span
                aria-hidden
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  franchi || enCours
                    ? "bg-gv-800 text-white"
                    : "border border-gv-border-strong bg-white text-gv-text-muted",
                ].join(" ")}
              >
                {franchi ? <Check size={15} strokeWidth={2.6} /> : index + 1}
              </span>
              {!dernier && (
                <span
                  aria-hidden
                  className={`mx-2 h-px flex-1 ${franchi ? "bg-gv-800" : "bg-gv-border-strong"}`}
                />
              )}
            </div>

            <span
              className={[
                "mt-2.5 block text-[13px] leading-tight",
                dernier ? "text-center" : "",
                franchi || enCours ? "font-semibold text-gv-text" : "text-gv-text-muted",
              ].join(" ")}
            >
              {libelles[jalon]}
              {enCours && <span className="sr-only"> (étape en cours)</span>}
            </span>
            {date && (franchi || enCours) && (
              <span className={`block text-xs text-gv-text-soft ${dernier ? "text-center" : ""}`}>
                {formatShortDate(date)}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
