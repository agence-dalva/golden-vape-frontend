"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/customer-actions";

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (new FormData(e.currentTarget).get("email") as string).trim();

    startTransition(async () => {
      const result = await requestPasswordResetAction(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setEnvoye(email);
    });
  };

  // Même message qu'il y ait un compte ou non : on ne révèle pas qui est inscrit.
  if (envoye) {
    return (
      <div className="flex flex-col gap-4 text-sm text-brand-chocolate/80">
        <p>
          Si un compte existe pour <strong className="text-brand-chocolate">{envoye}</strong>, un
          email vient de partir avec un lien valable une heure. Pensez à vérifier vos courriers
          indésirables.
        </p>
        <Link href="/compte/connexion" className="font-medium text-brand-gold-dark hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-brand-chocolate">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Recevoir le lien"}
      </button>

      <p className="text-center text-sm text-brand-chocolate/70">
        <Link href="/compte/connexion" className="font-medium text-brand-gold-dark hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
