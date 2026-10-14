"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { EVENEMENT_CHOIX, GA_ID, lireChoix, type Choix } from "@/lib/consentement";

// Le choix vit dans le stockage du navigateur ; on le relit à chaque nouveau choix émis.
const abonner = (prevenir: () => void) => {
  window.addEventListener(EVENEMENT_CHOIX, prevenir);
  return () => window.removeEventListener(EVENEMENT_CHOIX, prevenir);
};
const choixClient = () => lireChoix();
// Côté serveur, aucun choix n'est connu : rien n'est chargé.
const choixServeur = () => null;

/**
 * Google Analytics, chargé seulement après « Accepter » sur le bandeau de cookies.
 *
 * Un retrait du consentement en cours de visite coupe l'envoi tout de suite (drapeau
 * `ga-disable-<id>` prévu par Google) : le script déjà chargé ne peut pas être déchargé.
 */
export default function GoogleAnalytics() {
  const choix = useSyncExternalStore(abonner, choixClient, choixServeur);

  useEffect(() => {
    if (!GA_ID) return;
    const surChoix = (event: Event) => {
      const nouveau = (event as CustomEvent<Choix>).detail;
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = nouveau !== "accepte";
    };
    window.addEventListener(EVENEMENT_CHOIX, surChoix);
    return () => window.removeEventListener(EVENEMENT_CHOIX, surChoix);
  }, []);

  if (!GA_ID || choix !== "accepte") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});`}
      </Script>
    </>
  );
}
