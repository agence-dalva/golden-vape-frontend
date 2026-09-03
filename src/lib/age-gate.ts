/**
 * Réponse à la vérification d'âge, conservée sur l'appareil du visiteur.
 *
 * Dans son propre module, et non exportée depuis le composant : celui-ci est un module
 * `"use client"`, et un composant serveur qui en importe une constante n'en reçoit pas la
 * valeur mais une référence — le script d'amorçage du gabarit lisait alors la clé
 * `undefined`, et le portillon reparaissait à chaque chargement.
 */
export const AGE_STORAGE_KEY = "gv-age-confirmed";
