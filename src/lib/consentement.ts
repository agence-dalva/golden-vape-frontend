/**
 * Consentement aux cookies de mesure d'audience (Google Analytics).
 *
 * Seuls ces cookies-là demandent un accord : panier, connexion et réponse à la question de
 * l'âge sont strictement nécessaires, et la CNIL les exempte. Google Analytics, lui, n'est
 * chargé qu'après « Accepter » — jamais avant, jamais sur un refus.
 *
 * Le choix est gardé sur l'appareil, daté, et redemandé à échéance, comme le recommande la
 * CNIL : 13 mois au plus pour un accord, 6 mois pour un refus.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || null;

const CLE = "gv-consentement";
const MOIS = 30 * 24 * 60 * 60 * 1000;
const DUREE = { accepte: 13 * MOIS, refuse: 6 * MOIS } as const;

export type Choix = keyof typeof DUREE;

/** Événement que le lien « Gérer les cookies » envoie pour rouvrir le bandeau. */
export const EVENEMENT_GERER = "gv:gerer-cookies";
/** Événement émis à chaque nouveau choix, pour charger ou non Google Analytics. */
export const EVENEMENT_CHOIX = "gv:consentement";

export function lireChoix(): Choix | null {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return null;
    const { choix, date } = JSON.parse(brut) as { choix: Choix; date: number };
    if (!(choix in DUREE) || Date.now() - date > DUREE[choix]) return null;
    return choix;
  } catch {
    // Stockage indisponible ou valeur illisible : on considère qu'aucun choix n'est fait,
    // donc rien n'est chargé — le comportement prudent.
    return null;
  }
}

export function enregistrerChoix(choix: Choix) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ choix, date: Date.now() }));
  } catch {
    // Non mémorisable : la question reviendra au prochain chargement.
  }
  if (choix === "refuse") effacerCookiesAnalytics();
  window.dispatchEvent(new CustomEvent(EVENEMENT_CHOIX, { detail: choix }));
}

/**
 * Un refus après un accord doit retirer ce que Google a déjà déposé : `_ga` et `_ga_<id>`,
 * posés sur le domaine du site et sur son domaine parent.
 */
function effacerCookiesAnalytics() {
  const noms = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((nom) => nom === "_ga" || nom.startsWith("_ga_"));
  const domaines = [location.hostname, `.${location.hostname.split(".").slice(-2).join(".")}`];
  for (const nom of noms) {
    document.cookie = `${nom}=; Max-Age=0; path=/`;
    for (const domaine of domaines) {
      document.cookie = `${nom}=; Max-Age=0; path=/; domain=${domaine}`;
    }
  }
}
