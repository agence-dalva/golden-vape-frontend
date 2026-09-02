"use client";

import Link from "next/link";
import { UserRound, UserPlus, ShoppingBag } from "lucide-react";

// Premier écran du tunnel pour un visiteur non connecté. Commander en tant que client
// permet de retrouver ses commandes ensuite ; l'option invité reste toujours ouverte.
export default function CheckoutGate({ onGuest }: { onGuest: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-brand-chocolate">
          Commander en tant que client
        </h2>
        <p className="mb-5 text-sm text-brand-chocolate/70">
          Votre adresse est préremplie à chaque commande, et vous retrouvez l&apos;historique
          de vos achats dans votre espace client.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/compte/connexion?redirect=/checkout"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream"
          >
            <UserRound size={18} />
            J&apos;ai déjà un compte
          </Link>
          <Link
            href="/compte/inscription?redirect=/checkout"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-chocolate/20 px-6 py-3 text-sm font-medium text-brand-chocolate transition-colors hover:border-brand-gold-dark"
          >
            <UserPlus size={18} />
            Créer un compte
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-brand-chocolate">
          Commander en tant qu&apos;invité
        </h2>
        <p className="mb-5 text-sm text-brand-chocolate/70">
          Sans création de compte. Vous ne pourrez pas consulter cette commande en ligne
          par la suite.
        </p>
        <button
          onClick={onGuest}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand-chocolate/20 px-6 py-3 text-sm font-medium text-brand-chocolate transition-colors hover:border-brand-gold-dark"
        >
          <ShoppingBag size={18} />
          Continuer sans compte
        </button>
      </div>
    </div>
  );
}
