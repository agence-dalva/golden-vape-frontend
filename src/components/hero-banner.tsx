import Image from "next/image";
import { HERO } from "@/lib/hero";
import SearchBar from "@/components/search-bar";

// Composant serveur : hors la barre de recherche, la bannière n'embarque aucun JavaScript.
export default function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-chocolate">
      {HERO.imageUrl && (
        <>
          <Image
            src={HERO.imageUrl}
            alt=""
            fill
            // Première image visible de la page : elle est chargée sans attendre.
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          {/* Sans ce voile, le texte crème deviendrait illisible sur une photo claire. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-brand-chocolate/70" />
        </>
      )}

      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-24">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-brand-cream sm:text-4xl">
          {HERO.title}
        </h1>
        <p className="mt-4 max-w-md text-balance text-brand-cream/70">{HERO.subtitle}</p>

        <div className="mt-10 w-full">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
