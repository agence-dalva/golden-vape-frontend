import Link from "next/link";

export default function MoneticoFailurePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Paiement non abouti
      </h1>
      <p className="mb-8 text-sm text-brand-chocolate/70">
        Votre paiement a été refusé ou interrompu, et aucun montant n&apos;a été débité. Votre
        panier est intact : vous pouvez réessayer, avec la même carte ou une autre.
      </p>
      <Link
        href="/checkout"
        className="inline-block rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream"
      >
        Reprendre la commande
      </Link>
    </div>
  );
}
