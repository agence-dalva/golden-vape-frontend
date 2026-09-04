import {
  Apple,
  Beaker,
  Blend,
  Cable,
  Candy,
  Cigarette,
  Cog,
  CupSoda,
  Droplets,
  GlassWater,
  Layers,
  Snowflake,
  TestTube,
  Wheat,
  Zap,
  BatteryCharging,
  Cpu,
  Flame,
  Leaf,
  Wind,
  Wrench,
  FlaskConical,
  Tag,
  CircleDot,
  Package,
  type LucideIcon,
} from "lucide-react";

/**
 * Repères visuels par famille de produits, rapprochés sur le NOM et non sur le handle :
 * celui-ci porte un suffixe numérique issu de l'import Hiboutik, qui diffère d'une base à
 * l'autre. Partagé par la grille du catalogue et l'en-tête des pages de catégorie.
 *
 * Revers de ce choix : renommer une catégorie dans l'administration décroche son visuel sans
 * rien casser d'autre, donc sans rien signaler. Les clés doivent suivre les noms réels.
 */
const ICONS: Record<string, LucideIcon> = {
  liquides: Droplets,
  "cigarette electronique": Cigarette,
  kits: Zap,
  diy: FlaskConical,
  chargeurs: BatteryCharging,
  destockage: Tag,
  cbd: Leaf,
  "puffs rechargeables": Wind,
  "clearomiseurs et reconstructible": CircleDot,
  "cartouches pods": Package,
  accus: BatteryCharging,
  resistances: Flame,
  "box et batteries": Cpu,
  accessoires: Wrench,

  /*
    Sous-catégories. Sans elles, tout un menu déroulant affiche le même pictogramme générique
    et le repère visuel ne repère plus rien. Les noms suivent ceux de l'administration, aux
    accents près : la comparaison passe par `simplifyCategoryName`.
  */
  flacons: Beaker,
  aromes: Blend,
  bases: Droplets,
  booster: Zap,
  outils: Wrench,
  "fils resistifs": Cable,
  "fibres et cotons": Layers,
  pyrex: GlassWater,
  reconstructible: Cog,
  clearomiseurs: CircleDot,
  frais: Snowflake,
  gourmand: Candy,
  gourmands: Candy,
  tabac: Wheat,
  "sels de nicotine": TestTube,
  fruite: Apple,
  fruites: Apple,
  boissons: CupSoda,
};

const ILLUSTRATIONS: Record<string, string> = {
  liquides: "/categories/page/liquides.png",
  chargeurs: "/categories/page/chargeurs.png",
  destockage: "/categories/page/destockage.png",
  cbd: "/categories/page/cbd.png",
  "puffs rechargeables": "/categories/page/puffs-rechargeables.png",
  "clearomiseurs et reconstructible": "/categories/page/clearomiseurs-drippers.png",
  accus: "/categories/page/accus.png",
  resistances: "/categories/page/resistances.png",
  "box et batteries": "/categories/page/mods.png",
  accessoires: "/categories/page/accessoires.png",
};

/*
  Pictogrammes dessinés, fournis pour la barre de navigation. Ils priment sur les symboles
  d'interface : un flacon compte-gouttes dit « Flacons » mieux qu'un bécher générique.

  Plusieurs noms partagent volontairement un fichier — « Fruité » et « Fruités », les trois
  déclinaisons de clearomiseur — le catalogue employant les deux graphies. Les familles sans
  dessin retombent sur leur symbole, aucune n'a besoin d'être déclarée ici.
*/
const NAV_ICONS: Record<string, string> = {
  accus: "/navigation/accu.webp",
  aromes: "/navigation/aromes.webp",
  bases: "/navigation/bases.webp",
  boissons: "/navigation/boisson.webp",
  booster: "/navigation/booster.webp",
  "box et batteries": "/navigation/box-batterie.webp",
  "cartouches pods": "/navigation/cartouche-pods.webp",
  "clearomiseurs et reconstructible": "/navigation/clearomiseur-reconstructible.webp",
  clearomiseurs: "/navigation/clearomiseur-reconstructible.webp",
  reconstructible: "/navigation/clearomiseur-reconstructible.webp",
  "fibres et cotons": "/navigation/fibres-cotons.webp",
  "fils resistifs": "/navigation/fils-resistifs.webp",
  flacons: "/navigation/flacon.webp",
  frais: "/navigation/frais.webp",
  fruite: "/navigation/fruite.webp",
  fruites: "/navigation/fruite.webp",
  gourmand: "/navigation/gourmand.webp",
  gourmands: "/navigation/gourmand.webp",
  kits: "/navigation/kit.webp",
  pyrex: "/navigation/pyrex.webp",
  resistances: "/navigation/resistance.webp",
  "sels de nicotine": "/navigation/sel-de-nicotine.webp",
  tabac: "/navigation/tabac.webp",
};

export function simplifyCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Pictogramme dessiné d'une famille, pour la barre de navigation. `null` quand elle n'en a
 * pas : l'appelant retombe alors sur le symbole d'interface.
 */
export function categoryNavIcon(name: string): string | null {
  return NAV_ICONS[simplifyCategoryName(name)] ?? null;
}

/** L'illustration est facultative : une famille sans visuel retombe sur son pictogramme. */
export function categoryVisual(name: string): { illustration: string | null; Icon: LucideIcon } {
  const key = simplifyCategoryName(name);
  return { illustration: ILLUSTRATIONS[key] ?? null, Icon: ICONS[key] ?? Package };
}
