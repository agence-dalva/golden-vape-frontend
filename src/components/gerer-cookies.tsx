"use client";

import { EVENEMENT_GERER } from "@/lib/consentement";

/** Rouvre le bandeau de cookies : le consentement doit pouvoir se retirer à tout moment. */
export default function GererCookies({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENEMENT_GERER))}
      className={`cursor-pointer ${className ?? ""}`}
    >
      Gérer les cookies
    </button>
  );
}
