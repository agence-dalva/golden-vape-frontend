"use client";

import { useState, useTransition } from "react";
import { ChevronDown, X } from "lucide-react";
import { applyPromoCodeAction, removePromoCodeAction } from "@/lib/cart-actions";

export default function PromoCode({
  applied,
}: {
  applied: { id: string; code: string | null }[];
}) {
  const [open, setOpen] = useState(applied.length > 0);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await applyPromoCodeAction(code);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCode("");
    });
  };

  const remove = (promoCode: string) => {
    startTransition(async () => {
      const result = await removePromoCodeAction(promoCode);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="mt-4 rounded-[10px] border border-gv-border bg-gv-card">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-3 px-5 py-[18px] text-left text-sm font-medium text-gv-text"
      >
        Vous avez un code promotionnel ?
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-gv-text-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-gv-border px-5 py-4">
          {applied.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {applied.map((promotion) => (
                <li key={promotion.id}>
                  <span className="inline-flex items-center gap-2 rounded-md border border-gv-800/25 bg-gv-800/[0.08] px-2.5 py-1.5 text-xs font-semibold text-gv-800">
                    {promotion.code}
                    {promotion.code && (
                      <button
                        onClick={() => remove(promotion.code!)}
                        disabled={isPending}
                        aria-label={`Retirer le code ${promotion.code}`}
                        className="cursor-pointer disabled:cursor-not-allowed"
                      >
                        <X size={13} aria-hidden />
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Votre code"
              aria-label="Code promotionnel"
              aria-invalid={Boolean(error)}
              className="h-11 min-w-0 flex-1 rounded-[7px] border border-gv-border-strong bg-white px-3 text-sm text-gv-text outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-800"
            />
            <button
              type="submit"
              disabled={isPending || !code.trim()}
              className="h-11 shrink-0 cursor-pointer rounded-[7px] border border-gv-800 bg-gv-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-gv-900 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isPending ? "…" : "Appliquer"}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-2 text-[13px] text-[var(--gv-danger)]">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
