export type Hero = {
  title: string;
  subtitle: string;
  /**
   * Image de fond de la bannière. Dépose le fichier dans `public/` et mets son chemin ici
   * (par exemple `/banniere.jpg`). Tant que la valeur est `null`, la bannière reste sur le
   * brun uni — aucune image cassée ne s'affiche.
   */
  imageUrl: string | null;
};

export const HERO: Hero = {
  title: "Golden Vape, votre boutique de vape en ligne",
  subtitle: "Liquides, matériel et accessoires sélectionnés pour vous.",
  imageUrl: null,
};
