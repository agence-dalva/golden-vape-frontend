import Image from "next/image";
import Link from "next/link";
import { Headset, ArrowRight, FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import { listCategories } from "@/lib/medusa";
import Breadcrumbs from "@/components/breadcrumbs";
import CategoryTile from "@/components/category-tile";
import EmptyState from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Catalogue : toutes nos catégories | Golden Vape",
  description:
    "Explorez toutes les catégories Golden Vape : e-liquides, kits, résistances, DIY et accessoires.",
};

export default async function CataloguePage() {
  const categories = await listCategories().catch(() => []);

  return (
    <div>
      <div className="gv-container">
        <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Catalogue" }]} />

        <section className="relative isolate flex min-h-[190px] items-center overflow-hidden rounded-[16px] border border-gv-border bg-gv-soft">
          <div className="relative z-10 max-w-xl px-6 py-8 sm:px-9 sm:py-10">
            <p className="gv-eyebrow">Catalogue</p>
            <h1 className="mt-2 text-balance font-display text-[30px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[38px]">
              Trouvez l&apos;univers qui vous correspond.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gv-text-soft">
              Explorez toutes nos catégories et accédez rapidement aux produits sélectionnés par
              Golden Vape.
            </p>
          </div>

          {/* Masquée sous `sm` : à cette largeur elle mangerait la place du texte. */}
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[52%] sm:block">
            <Image
              src="/banner/banner-golden-vape.png"
              alt=""
              fill
              sizes="52vw"
              className="object-cover object-[center_right]"
            />
            {/* Fond dégradé : la coupure entre l'image et la zone de texte ne doit pas se voir. */}
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgb(246 242 238) 0%, rgb(246 242 238 / 0.6) 32%, rgb(246 242 238 / 0) 68%)",
              }}
            />
          </div>
        </section>
      </div>

      {/*
        Sol ivoire sous la grille, d'un bord à l'autre. Les tuiles sont blanches : sur un fond de
        page à deux points du blanc, elles ne se détachaient de rien et la section se lisait comme
        un vide entre le bandeau et le bloc d'aide. Le fond traverse toute la largeur, sans quoi la
        bande n'aurait pas de tenue.
      */}
      <section className="mt-14 border-y border-gv-border bg-gv-soft">
        <div className="gv-container py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="gv-eyebrow">Tout le catalogue</p>
              <h2 className="mt-2 font-display text-[28px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[34px]">
                Toutes les catégories
              </h2>
            </div>
            {/* Compteur calculé, jamais figé. */}
            <p className="text-sm text-gv-text-soft">
              {categories.length} catégorie{categories.length > 1 ? "s" : ""}
            </p>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Aucune catégorie n'est disponible pour le moment"
              description="Le catalogue sera bientôt de retour."
              primary={{ label: "Retour à l'accueil", href: "/" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </div>
          )}

        </div>
      </section>

      <div className="gv-container">
        <aside className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-gv-border bg-gv-card px-6 py-6">
          <div className="flex items-center gap-4">
            <span aria-hidden className="text-gv-800">
              <Headset size={28} strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-display text-xl font-normal text-gv-text">
                Besoin d&apos;aide pour choisir ?
              </p>
              <p className="mt-0.5 text-sm text-gv-text-soft">
                Notre équipe vous accompagne vers le matériel adapté à vos besoins.
              </p>
            </div>
          </div>

          <Link
            href="/marques"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gv-800"
          >
            Parcourir nos marques
            <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
