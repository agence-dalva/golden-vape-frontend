"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/customer-actions";
import AddressForm from "@/components/address-form";
import type { MedusaAddress } from "@/lib/medusa-cart";

const inputClass =
  "rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark";
const labelClass = "text-sm font-medium text-brand-chocolate";

const EMPTY_ADDRESS: MedusaAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  postal_code: "",
  city: "",
  phone: "",
  country_code: "fr",
};

export default function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<MedusaAddress>(EMPTY_ADDRESS);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      // Le nom du compte reprend celui de l'adresse : une seule saisie pour le client.
      const result = await registerAction(
        email,
        password,
        address.first_name ?? "",
        address.last_name ?? "",
        address
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-brand-chocolate">Identifiants</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className={labelClass}>
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className={inputClass}
          />
          <p className="text-xs text-brand-chocolate/60">8 caractères minimum.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-brand-chocolate/10 pt-6">
        <div>
          <h2 className="text-sm font-semibold text-brand-chocolate">Adresse de livraison</h2>
          <p className="mt-1 text-xs text-brand-chocolate/60">
            Enregistrée sur votre compte, elle préremplira vos prochaines commandes.
          </p>
        </div>
        <AddressForm value={address} onChange={setAddress} idPrefix="register" />
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Création..." : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-brand-chocolate/70">
        Déjà un compte ?{" "}
        <Link
          href={`/compte/connexion?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-brand-gold-dark hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
