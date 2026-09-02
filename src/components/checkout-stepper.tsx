import { Check } from "lucide-react";

const STEPS = ["Panier", "Commande", "Paiement"] as const;

// Repère de progression du tunnel de commande. `current` est le numéro de l'étape en
// cours, de 1 à 3 : les précédentes sont marquées franchies, les suivantes estompées.
export default function CheckoutStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Progression de la commande" className="mb-8">
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
                    done && "bg-brand-chocolate text-brand-cream",
                    active && "bg-brand-gold-dark text-brand-chocolate",
                    !done && !active && "border border-brand-chocolate/20 text-brand-chocolate/40",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : step}
                </span>
                <span
                  className={[
                    "text-xs font-medium sm:text-sm",
                    active ? "text-brand-chocolate" : "text-brand-chocolate/50",
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
                    done ? "bg-brand-chocolate/40" : "bg-brand-chocolate/15",
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
