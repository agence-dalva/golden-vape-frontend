import {
  Droplets,
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
 */
const ICONS: Record<string, LucideIcon> = {
  liquides: Droplets,
  kits: Zap,
  diy: FlaskConical,
  chargeurs: BatteryCharging,
  destockage: Tag,
  cbd: Leaf,
  "puffs rechargeables": Wind,
  "clearomiseurs et dripper": CircleDot,
  accus: BatteryCharging,
  resistances: Flame,
  mods: Cpu,
  "pyrex et reconstructibles": Wrench,
};

const ILLUSTRATIONS: Record<string, string> = {
  liquides: "/categories/page/liquides.png",
  chargeurs: "/categories/page/chargeurs.png",
  destockage: "/categories/page/destockage.png",
  cbd: "/categories/page/cbd.png",
  "puffs rechargeables": "/categories/page/puffs-rechargeables.png",
  "clearomiseurs et dripper": "/categories/page/clearomiseurs-drippers.png",
  accus: "/categories/page/accus.png",
  resistances: "/categories/page/resistances.png",
  mods: "/categories/page/mods.png",
  "pyrex et reconstructibles": "/categories/page/pyrex-reconstructibles.png",
  accessoires: "/categories/page/accessoires.png",
};

export function simplifyCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** L'illustration est facultative : une famille sans visuel retombe sur son pictogramme. */
export function categoryVisual(name: string): { illustration: string | null; Icon: LucideIcon } {
  const key = simplifyCategoryName(name);
  return { illustration: ILLUSTRATIONS[key] ?? null, Icon: ICONS[key] ?? Package };
}
