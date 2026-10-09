import { HERO } from "@/lib/hero";
import { getImagesBanniere } from "@/lib/banniere";
import HeroImages from "./hero-images";

export default async function HeroSection() {
  // Les images viennent de l'administration ; sans elles, le visuel livré avec le site.
  const images = await getImagesBanniere();
  const sources = images.length > 0 ? images.map((image) => image.url) : [HERO.imageUrl];

  return (
    // `isolate` confine les z-index négatifs à la bannière : sans lui, l'image passerait
    // derrière le fond de page et disparaîtrait.
    <section className="relative isolate overflow-hidden bg-gv-900">
      {/* Le texte est posé sur l'image à toutes les tailles. Ce bloc couvre la bannière : il
          laisse passer les clics, sauf sur son contenu, pour que les repères de l'image restent
          cliquables. Les marges verticales l'empêchent de toucher les bords quand il est plus
          haut que la bannière — elle grandit alors avec lui. */}
      <div className="gv-container pointer-events-none flex min-h-[420px] items-center py-10 sm:py-12 lg:min-h-[clamp(360px,22vw,430px)] lg:py-5">
        <div className="pointer-events-auto max-w-[480px] [text-shadow:0_1px_14px_rgb(0_0_0/0.28)]">
          <p className="gv-eyebrow text-white/80!">{HERO.eyebrow}</p>

          <h1 className="mt-3.5 max-w-[470px] text-balance font-display text-[40px] font-normal leading-[1.2] tracking-[0.01em] text-white sm:text-[48px] lg:text-[58px]">
            {HERO.title}
          </h1>

          <p className="mt-4 max-w-[440px] text-base leading-relaxed text-white/85">
            {HERO.description}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 -z-20">
        <HeroImages sources={sources} />
      </div>

      {/* Voile sombre sous le texte. Sur ordinateur il ne couvre que la gauche, où se trouve le
          texte ; sur tablette et mobile le texte prend toute la largeur, le voile aussi. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:var(--gv-hero-overlay-compact)] lg:[background:var(--gv-hero-overlay)]"
      />
    </section>
  );
}
