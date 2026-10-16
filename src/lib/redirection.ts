/**
 * Destination après connexion ou inscription, lue dans `?redirect=` : un chemin du site,
 * sinon l'accueil.
 *
 * Sans ce contrôle, un lien piégé connectait le client sur le vrai site puis l'envoyait sur
 * un site imitant la boutique (« session expirée, ressaisissez votre mot de passe »).
 * `//exemple.com` et `/\exemple.com` sont des adresses externes pour le navigateur.
 */
export function cheminInterne(valeur: string | string[] | undefined): string {
  if (typeof valeur !== "string") return "/";
  if (!valeur.startsWith("/") || valeur.startsWith("//") || valeur.startsWith("/\\")) return "/";
  return valeur;
}
