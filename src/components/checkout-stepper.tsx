import { Check } from "lucide-react";

const STEPS_PAR_DEFAUT = ["Panier", "Livraison", "Paiement"];

/**
 * Repère de progression du tunnel de commande.
 *
 * `current` est le numéro de l'étape en cours, à partir de 1 : les précédentes sont
 * marquées franchies, les suivantes estompées.
 *
 * Les étapes ne sont pas figées : choisir une livraison en point relais en ajoute une,
 * puisque le client doit désigner son point avant de pouvoir payer. Le repère doit dire
 * la vérité sur ce qui reste à faire, sinon il promet un paiement immédiat qui n'arrive
 * pas — et c'est précisément à cet endroit qu'on abandonne une commande.
 */
export default function CheckoutStepper({
  current,
  steps = STEPS_PAR_DEFAUT,
}: {
  current: number;
  steps?: string[];
}) {
  const STEPS = steps;
  return (
    <nav aria-label="Progression de la commande" className="mx-auto mb-9 mt-[18px] max-w-[620px]">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;

          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none sm:gap-3">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    done && "bg-gv-800 text-white",
                    // Le texte doit rester lisible sur le brun : le blanc, pas la couleur de marque.
                    active && "bg-gv-800 text-white",
                    !done && !active && "border border-gv-border-strong bg-white text-gv-text-soft",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : step}
                </span>
                <span
                  className={[
                    "text-xs font-medium sm:text-sm",
                    active ? "text-gv-text" : "text-gv-text-soft",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  {label}
                </span>
              </span>

              {step < STEPS.length && (
                <span
                  aria-hidden
                  className={[
                    "h-px flex-1 transition-colors",
                    done ? "bg-gv-800/40" : "bg-gv-border",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
