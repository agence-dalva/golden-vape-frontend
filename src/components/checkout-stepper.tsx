import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

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
  onBack,
  backHref,
  backLabel = "Revenir a l'etape precedente",
}: {
  current: number;
  steps?: string[];
  /** Retour geré dans la page — revenir d'une sous-etape sans changer d'URL. */
  onBack?: () => void;
  /** Retour vers une autre page. Un lien, pour que le clic milieu et le survol marchent. */
  backHref?: string;
  backLabel?: string;
}) {
  const STEPS = steps;

  // Le meme bouton sous deux formes : lien quand on change de page, bouton quand on
  // revient sur une sous-etape de la page courante.
  const classeRetour =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gv-text-soft transition-colors hover:bg-gv-800/8 hover:text-gv-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gv-800";

  const retour = onBack ? (
    <button type="button" onClick={onBack} aria-label={backLabel} className={classeRetour}>
      <ArrowLeft size={17} />
    </button>
  ) : backHref ? (
    <Link
      href={backHref}
      aria-label={backLabel}
      transitionTypes={["nav-back"]}
      className={classeRetour}
    >
      <ArrowLeft size={17} />
    </Link>
  ) : null;
  return (
    <nav
      aria-label="Progression de la commande"
      className="mx-auto mb-8 mt-[18px] flex w-full max-w-[1180px] items-center gap-3 sm:gap-4"
    >
      {/* Reserve la place meme sans retour : sans cela le fil d'etapes se decalerait
          lateralement d'une etape a l'autre, ce qui se remarque plus que la fleche. */}
      <span className="h-8 w-8 shrink-0">{retour}</span>

      <ol className="flex flex-1 items-center gap-2 sm:gap-3">
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
