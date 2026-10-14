/*
  Adresse publique du site, sans barre finale (ex. https://golden-vape.fr).

  Elle ne se renseigne (NEXT_PUBLIC_SITE_URL, sur Vercel) que le jour où le domaine est
  branché : tant qu'elle est vide, robots.txt interdit l'indexation, pour que Google ne
  référence pas l'adresse provisoire en .vercel.app.
*/
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || null;

/** Domaine prévu, pour les adresses absolues du sitemap tant que SITE_URL est vide. */
export const DOMAINE_PREVU = "https://golden-vape.fr";
