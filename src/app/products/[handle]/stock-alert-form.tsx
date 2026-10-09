"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2 } from "lucide-react";
import { subscribeStockAlertAction } from "@/lib/stock-alert-actions";

/**
 * Déclinaison épuisée : à la place du bouton panier, le client laisse son adresse et reçoit
 * un email dès qu'elle revient en stock.
 *
 * Monté avec la déclinaison pour clé : en changer remet le formulaire à zéro, et la
 * confirmation affichée correspond toujours à la déclinaison sous les yeux.
 */
export default function StockAlertForm({
  variantId,
  variantLabel,
  defaultEmail,
}: {
  variantId: string;
  /** « 3 mg », « Black » — absent pour un produit sans déclinaison. */
  variantLabel: string | null;
  /** Adresse du compte connecté, pour n'avoir rien à saisir. */
  defaultEmail: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [etat, setEtat] = useState<"saisie" | "enregistree" | "disponible">("saisie");
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = (event: React.FormEvent) => {
    event.preventDefault();
    setErreur(null);

    startTransition(async () => {
      const resultat = await subscribeStockAlertAction(variantId, email.trim());
      if (resultat.status === "erreur") {
        setErreur(resultat.message);
        return;
      }
      setEtat(resultat.status);
      // Revenu en stock entre-temps : la page se recharge pour proposer l'achat.
      if (resultat.status === "disponible") router.refresh();
    });
  };

  if (etat === "enregistree") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[10px] border border-emerald-200 bg-emerald-50/70 px-4 py-3.5">
        <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-emerald-700" />
        <p className="text-sm leading-relaxed text-emerald-900">
          C&apos;est noté. Nous vous écrirons à <span className="font-semibold">{email.trim()}</span> dès
          que {variantLabel ? <>« {variantLabel} »</> : "cet article"} sera de retour.
        </p>
      </div>
    );
  }

  if (etat === "disponible") {
    return (
      <p role="status" className="rounded-[10px] bg-gv-50 px-4 py-3.5 text-sm text-gv-text">
        Bonne nouvelle : cet article vient de revenir en stock.
      </p>
    );
  }

  return (
    <form onSubmit={envoyer} className="rounded-[10px] border border-gv-border bg-gv-card p-4 sm:p-5">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-gv-text">
        <Bell size={17} aria-hidden className="text-gv-800" />
        Prévenez-moi du retour en stock
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-gv-text-soft">
        {variantLabel ? <>« {variantLabel} » est épuisé pour le moment. </> : "Cet article est épuisé pour le moment. "}
        Laissez votre email : nous vous écrirons une seule fois, dès son retour.
      </p>

      <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={`alerte-${variantId}`} className="sr-only">
          Votre adresse email
        </label>
        <input
          id={`alerte-${variantId}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder="votre@email.fr"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? `alerte-${variantId}-erreur` : undefined}
          className="min-h-[48px] min-w-0 flex-1 rounded-[7px] border border-gv-border-strong bg-white px-3.5 text-sm text-gv-text outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-800"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[48px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-gv-800 bg-gv-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-gv-900 disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? <Loader2 size={16} aria-hidden className="animate-spin" /> : <Bell size={16} aria-hidden />}
          M&apos;avertir
        </button>
      </div>

      {erreur && (
        <p id={`alerte-${variantId}-erreur`} role="alert" className="mt-2 text-[13px] text-[var(--gv-danger)]">
          {erreur}
        </p>
      )}
    </form>
  );
}
