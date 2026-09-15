"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/customer-actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fait, setFait] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmation = form.get("confirmation") as string;

    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setFait(true);
    });
  };

  if (fait) {
    return (
      <div className="flex flex-col gap-4 text-sm text-brand-chocolate/80">
        <p>Votre mot de passe est enregistré. Vous pouvez vous connecter.</p>
        <Link
          href="/compte/connexion?redirect=/compte"
          className="inline-block w-fit rounded-lg bg-brand-chocolate px-5 py-2.5 text-sm font-medium text-brand-cream"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const champ =
    "rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-brand-chocolate">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={champ}
        />
        <span className="text-xs text-brand-chocolate/60">8 caractères minimum</span>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmation" className="text-sm font-medium text-brand-chocolate">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={champ}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
