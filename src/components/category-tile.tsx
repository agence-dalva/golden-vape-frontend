import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { MedusaCategory } from "@/lib/medusa";
import { categoryVisual, categoryNavIcon } from "@/lib/category-visuals";

const MAX_SUBCATEGORIES = 3;

export default function CategoryTile({ category }: { category: MedusaCategory }) {
  /*
    Les pictogrammes de `navigation` sont préférés aux illustrations de page : ils couvrent
    toutes les familles et sont tous recadrés de la même façon, là où la collection des
    illustrations est partielle. Une famille absente des deux retombait sur un symbole
    d'interface de 22 pixels, minuscule à côté d'un dessin qui remplit son cadre — d'où des
    tuiles de tailles inégales.
  */
  const { illustration, Icon } = categoryVisual(category.name);
  const dessin = categoryNavIcon(category.name) ?? illustration;
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
        {dessin ? (
          <Image src={dessin} alt="" fill sizes="56px" className="object-contain p-1.5" />
        ) : (
          <Icon size={30} strokeWidth={1.5} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="break-words text-[17px] font-semibold leading-[1.25] text-gv-text">
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
