"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENEMENT_GERER, GA_ID, enregistrerChoix, lireChoix, type Choix } from "@/lib/consentement";

/**
 * Bandeau de consentement aux cookies de mesure d'audience.
 *
 * N'existe que si Google Analytics est configuré (`NEXT_PUBLIC_GA_ID`) : sans traceur, rien
 * à consentir. Il attend que la question de l'âge soit répondue — deux fenêtres l'une sur
 * l'autre, c'est une de trop — puis ne revient que sur « Gérer les cookies » ou à
 * l'échéance du choix. « Accepter » et « Refuser » ont le même poids, comme l'exige la CNIL.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;

    const ouvrir = () => setVisible(true);
    window.addEventListener(EVENEMENT_GERER, ouvrir);

    if (lireChoix() !== null) {
      return () => window.removeEventListener(EVENEMENT_GERER, ouvrir);
    }

    // Le portillon d'âge pose `data-age-ok` sur <html> une fois la réponse donnée.
    const html = document.documentElement;
    if (html.dataset.ageOk === "1") {
      ouvrir();
      return () => window.removeEventListener(EVENEMENT_GERER, ouvrir);
    }
    const observateur = new MutationObserver(() => {
      if (html.dataset.ageOk === "1") {
        observateur.disconnect();
        ouvrir();
      }
    });
    observateur.observe(html, { attributes: true, attributeFilter: ["data-age-ok"] });

    return () => {
      observateur.disconnect();
      window.removeEventListener(EVENEMENT_GERER, ouvrir);
    };
  }, []);

  if (!GA_ID || !visible) return null;

  const choisir = (choix: Choix) => {
    enregistrerChoix(choix);
    setVisible(false);
  };

  const bouton =
    "min-h-10 flex-1 cursor-pointer rounded-lg border px-4 text-[13px] font-semibold transition-colors sm:flex-none";

  return (
    <div
      role="dialog"
      aria-labelledby="cookies-titre"
      className="fixed inset-x-3 bottom-3 z-150 mx-auto max-w-2xl rounded-2xl border border-gv-border bg-gv-soft p-5 shadow-gv-md sm:inset-x-6 sm:bottom-6"
    >
      <p id="cookies-titre" className="text-[14px] font-semibold text-gv-text">
        Cookies de mesure d&apos;audience
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-gv-text-soft">
        Avec votre accord, nous utilisons Google Analytics pour savoir comment le site est
        utilisé et l&apos;améliorer. Les cookies nécessaires au panier et à votre compte sont
        déposés dans tous les cas.{" "}
        <Link href="/cookies" className="font-medium text-gv-text underline underline-offset-2">
          En savoir plus
        </Link>
      </p>
      <div className="mt-4 flex gap-2.5 sm:justify-end">
        <button
          onClick={() => choisir("refuse")}
          className={`${bouton} border-gv-800 bg-transparent text-gv-800 hover:bg-gv-800/5`}
        >
          Refuser
        </button>
        <button
          onClick={() => choisir("accepte")}
          className={`${bouton} border-gv-800 bg-gv-800 text-white hover:bg-gv-900`}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
