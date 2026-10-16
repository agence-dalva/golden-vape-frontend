"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  CHEMINS_SANS_MESURE,
  EVENEMENT_CHOIX,
  GA_ID,
  lireChoix,
} from "@/lib/consentement";

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
  const pathname = usePathname();

  // Mesure coupée sans accord, ou sur une page qui ne doit jamais l'être. Le drapeau est relu
  // par Google à chaque envoi : il suit le choix et la page en cours.
  useEffect(() => {
    if (!GA_ID) return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] =
      choix !== "accepte" || CHEMINS_SANS_MESURE.test(pathname);
  }, [choix, pathname]);

  if (!GA_ID || choix !== "accepte") return null;

  // Le drapeau est aussi posé dans le script d'initialisation : arrivé directement sur une
  // page sans mesure (lien de réinitialisation reçu par email), la première page vue
  // partirait sinon avant l'effet ci-dessus.
  const id = JSON.stringify(GA_ID);
  const sansMesure = CHEMINS_SANS_MESURE.source;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`if(new RegExp(${JSON.stringify(sansMesure)}).test(location.pathname))window['ga-disable-'+${id}]=true;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${id});`}
      </Script>
    </>
  );
}
