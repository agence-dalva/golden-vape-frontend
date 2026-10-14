/**
 * Réponse à la vérification d'âge, conservée sur l'appareil du visiteur.
 *
 * Dans son propre module, et non exportée depuis le composant : celui-ci est un module
 * `"use client"`, et un composant serveur qui en importe une constante n'en reçoit pas la
 * valeur mais une référence — le script d'amorçage du gabarit lisait alors la clé
 * `undefined`, et le portillon reparaissait à chaque chargement.
 */
export const AGE_STORAGE_KEY = "gv-age-confirmed";

/**
 * Pages lisibles sans avoir répondu à la question de l'âge.
 *
 * Le portillon demande d'accepter les mentions légales et les ouvre dans un nouvel onglet :
 * s'il les recouvrait aussi, le visiteur ne pourrait pas lire ce qu'on lui demande
 * d'accepter.
 */
export const PAGES_SANS_PORTILLON = ["/mentions-legales"];

export function estPageSansPortillon(chemin: string | null): boolean {
  return chemin !== null && PAGES_SANS_PORTILLON.some((page) => chemin === page || chemin.startsWith(`${page}/`));
}
