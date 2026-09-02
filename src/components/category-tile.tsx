import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, type LucideIcon } from "lucide-react";
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
} from "lucide-react";
import type { MedusaCategory } from "@/lib/medusa";

const MAX_SUBCATEGORIES = 3;

// Repère visuel par famille, rapproché sur le nom : les handles portent un suffixe issu de
// l'import Hiboutik, qui diffère d'une base à l'autre.
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

// Illustrations fournies pour le catalogue, rapprochées sur le nom de catégorie — les
// handles portent un suffixe issu de l'import Hiboutik, variable d'une base à l'autre.
// Les familles sans illustration retombent sur l'icône vectorielle ci-dessus.
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

function simplify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export default function CategoryTile({ category }: { category: MedusaCategory }) {
  const key = simplify(category.name);
  const illustration = ILLUSTRATIONS[key];
  const Icon = ICONS[key] ?? Package;
  const children = category.category_children ?? [];
  const visible = children.slice(0, MAX_SUBCATEGORIES);
  const hidden = children.length - visible.length;
  // La description prend le relais quand la famille n'a pas de sous-catégorie, pour éviter
  // une carte aux trois quarts vide. Elle est vide sur toutes les catégories aujourd'hui.
  const description = category.description?.trim();

  return (
    // Le lien du titre couvre toute la carte via `after`, ce qui la rend cliquable sans
    // imbriquer les liens de sous-catégorie dans un autre lien — HTML invalide.
    <article className="group relative flex min-h-[164px] gap-4 rounded-[14px] border border-gv-border bg-gv-card p-[22px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-gv-border-strong hover:shadow-[0_14px_34px_rgba(68,54,46,0.08)]">
      <span
        aria-hidden
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gv-50 text-gv-800"
      >
        {illustration ? (
          <Image src={illustration} alt="" fill sizes="56px" className="object-contain p-1.5" />
        ) : (
          <Icon size={22} strokeWidth={1.5} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[22px] font-semibold leading-tight text-gv-text">
          <Link
            href={`/categories/${category.handle}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {category.name}
          </Link>
        </h3>

        {visible.length === 0 && description && (
          <p className="mt-2 line-clamp-2 text-sm leading-snug text-gv-text-soft">{description}</p>
        )}

        {visible.length > 0 && (
          <ul className="mt-2 flex flex-col gap-0.5">
            {visible.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categories/${child.handle}`}
                  className="relative z-10 text-sm text-gv-text-soft transition-colors hover:text-gv-800"
                >
                  {child.name}
                </Link>
              </li>
            ))}
            {hidden > 0 && (
              <li className="text-sm text-gv-text-muted">
                + {hidden} sous-catégorie{hidden > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        )}
      </div>

      <ArrowRight
        size={18}
        aria-hidden
        className="absolute bottom-[22px] right-[22px] text-gv-text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gv-800"
      />
    </article>
  );
}
