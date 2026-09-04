import Image from "next/image";
import type { MedusaCategory } from "@/lib/medusa";
import { categoryVisual, categoryNavIcon } from "@/lib/category-visuals";

/**
 * En-tête de page de catégorie : sur-titre, nom, description éditoriale et repère visuel.
 * Volontairement compact — la grille de produits doit commencer haut dans la page.
 */
export default function CategoryIntro({ category }: { category: MedusaCategory }) {
  /*
    L'illustration de page d'abord, le pictogramme de navigation ensuite : la première
    collection est partielle — ni Cigarette électronique ni Diy n'y figurent — et ces rubriques
    affichaient un symbole d'interface là où leurs voisines ont un dessin.

    Le pictogramme suffit à cette place : rendu au plus à 114 pixels dans ce cadre, il n'est
    jamais agrandi au-delà de ses 128.
  */
  const { illustration, Icon } = categoryVisual(category.name);
  const dessin = illustration ?? categoryNavIcon(category.name);
  const description = category.description?.trim();
  const parent = category.parent_category;

  return (
    <section className="grid grid-cols-1 items-center gap-6 pb-7 pt-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:gap-10">
      <div>
        <p className="gv-eyebrow">{parent ? parent.name : "Catalogue"}</p>
        <h1 className="mt-2.5 text-balance font-display text-[30px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[38px]">
          {category.name}
        </h1>
        <p className="mt-3.5 max-w-[560px] text-sm leading-relaxed text-gv-text-soft">
          {description ??
            `Retrouvez la sélection Golden Vape pour la catégorie ${category.name.toLowerCase()}.`}
        </p>
      </div>

      {/*
        Décoratif : masqué sous `sm`, où il prendrait la place du texte, et retiré des
        lecteurs d'écran. L'illustration est facultative — une famille sans visuel affiche
        son pictogramme sur fond ivoire plutôt qu'un cadre vide.
      */}
      <div aria-hidden className="hidden justify-self-end sm:block">
        <div className="relative flex h-[150px] w-[240px] items-center justify-center rounded-[14px] bg-gv-soft lg:h-[170px] lg:w-[300px]">
          {dessin ? (
            <Image
              src={dessin}
              alt=""
              fill
              sizes="300px"
              priority
              className="object-contain p-7"
            />
          ) : (
            <Icon size={54} strokeWidth={1.2} className="text-gv-300" />
          )}
        </div>
      </div>
    </section>
  );
}
