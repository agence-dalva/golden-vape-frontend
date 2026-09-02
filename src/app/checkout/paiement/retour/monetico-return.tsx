"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { finalizeMoneticoPaymentAction } from "@/lib/checkout-actions";

export default function MoneticoReturn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Le mode strict de React monte deux fois en développement : une seule finalisation.
    if (started.current) return;
    started.current = true;

    finalizeMoneticoPaymentAction().then((result) => {
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.replace(`/checkout/confirmation/${result.orderId}`);
    });
  }, [router]);

  if (error) {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-brand-chocolate">
          Paiement en cours de vérification
        </h1>
        <p className="mb-8 text-sm text-brand-chocolate/70">
          Votre banque a bien traité le paiement mais nous n&apos;avons pas encore pu confirmer
          la commande ({error}). Si le débit apparaît sur votre compte, contactez-nous avant de
          régler à nouveau.
        </p>
        <Link
          href="/checkout"
          className="inline-block rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream"
        >
          Revenir à la commande
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Confirmation de votre paiement…
      </h1>
      <p className="text-sm text-brand-chocolate/70">
        Merci de patienter, nous enregistrons votre commande.
      </p>
    </>
  );
}
