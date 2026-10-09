import Link from "next/link";
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
    <section className="relative isolate flex flex-col overflow-hidden bg-gv-soft lg:block">
      {/* Sur ordinateur, ce bloc couvre toute la bannière : il laisse passer les clics, sauf sur
          son contenu, pour que les repères de l'image restent cliquables. */}
      <div className="gv-container order-1 py-12 lg:pointer-events-none lg:flex lg:min-h-[clamp(360px,22vw,430px)] lg:items-center lg:py-0">
        {/* Sur ordinateur, le texte passe en clair : il est posé sur le voile sombre de
            l'image. Sur mobile, il reste sur le fond de page, au-dessus de l'image. */}
        <div className="max-w-[480px] lg:pointer-events-auto lg:[text-shadow:0_1px_14px_rgb(0_0_0/0.28)]">
          <p className="gv-eyebrow lg:text-white/80!">{HERO.eyebrow}</p>

          <h1 className="mt-3.5 max-w-[470px] text-balance font-display text-[40px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[48px] lg:text-[58px] lg:text-white">
            {HERO.title}
          </h1>

          <p className="mb-6 mt-4 max-w-[440px] text-base leading-relaxed text-gv-text-soft lg:text-white/85">
            {HERO.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href={HERO.primaryCta.href}
              className="inline-flex min-h-12 items-center rounded-[7px] border border-gv-800 bg-gv-800 px-6 text-sm font-semibold text-white shadow-[0_8px_22px_rgb(68_54_46/0.14)] transition-all duration-200 hover:-translate-y-px hover:bg-gv-900 hover:shadow-[0_12px_28px_rgb(68_54_46/0.2)] lg:border-white lg:bg-white lg:text-gv-900 lg:[text-shadow:none] lg:hover:bg-white/90"
            >
              {HERO.primaryCta.label}
            </Link>
            <Link
              href={HERO.secondaryCta.href}
              className="text-sm font-semibold text-gv-800 underline-offset-4 hover:underline lg:text-white"
            >
              {HERO.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      {/*
        Une seule balise image pour les deux mises en page : bloc autonome sous le texte en
        mobile, fond absolu de la bannière à partir de `lg`.
      */}
      <div className="relative order-2 h-[290px] w-full sm:h-[330px] lg:absolute lg:inset-0 lg:-z-20 lg:order-none lg:h-full">
        <HeroImages sources={sources} />
      </div>

      {/* Voile sombre à gauche : il porte le texte clair sans manger la photo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{ background: "var(--gv-hero-overlay)" }}
      />
    </section>
  );
}
