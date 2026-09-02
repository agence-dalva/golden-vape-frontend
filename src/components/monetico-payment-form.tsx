"use client";

import { useEffect, useRef } from "react";
import type { MoneticoPaymentForm as MoneticoForm } from "@/lib/medusa-checkout";

const IFRAME_NAME = "monetico-paiement";

// Poste le formulaire scellé vers la page de paiement Monetico dès qu'il est monté.
// Deux intégrations possibles : redirection pleine page (par défaut), ou formulaire
// minimaliste chargé dans une iframe si l'option est souscrite sur le contrat — c'est
// alors Medusa qui a ajouté le champ `mode_affichage`.
export default function MoneticoPaymentForm({ form }: { form: MoneticoForm }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inIframe = form.fields.mode_affichage === "iframe";

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <>
      <form
        ref={formRef}
        method="post"
        action={form.actionUrl}
        target={inIframe ? IFRAME_NAME : "_top"}
        hidden
      >
        {Object.entries(form.fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} defaultValue={value} />
        ))}
      </form>

      {inIframe ? (
        <iframe
          name={IFRAME_NAME}
          title="Paiement sécurisé Monetico"
          className="h-[600px] w-full rounded-xl border border-brand-chocolate/10 bg-white"
        />
      ) : (
        <p className="text-center text-sm text-brand-chocolate/70">
          Redirection vers le paiement sécurisé…
        </p>
      )}
    </>
  );
}
