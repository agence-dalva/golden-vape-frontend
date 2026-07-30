"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/customer-actions";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result = await loginAction(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(redirectTo);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-brand-chocolate">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-brand-chocolate">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full cursor-pointer rounded-lg bg-brand-chocolate py-3 text-sm font-medium text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Connexion..." : "Se connecter"}
      </button>

      <p className="text-center text-sm text-brand-chocolate/70">
        Pas encore de compte ?{" "}
        <Link
          href={`/compte/inscription?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-brand-gold-dark hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
