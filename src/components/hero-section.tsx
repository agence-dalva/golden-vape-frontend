import Image from "next/image";
import Link from "next/link";
import { HERO } from "@/lib/hero";

export default function HeroSection() {
  return (
    // `isolate` confine les z-index négatifs à la bannière : sans lui, l'image passerait
    // derrière le fond de page et disparaîtrait.
    <section className="relative isolate flex flex-col overflow-hidden bg-gv-soft lg:block">
      <div className="gv-container order-1 py-12 lg:flex lg:min-h-[clamp(360px,22vw,430px)] lg:items-center lg:py-0">
        <div className="max-w-[480px]">
          <p className="gv-eyebrow">{HERO.eyebrow}</p>

          <h1 className="mt-3.5 max-w-[470px] text-balance font-display text-[40px] font-semibold leading-[0.94] tracking-[-0.035em] text-gv-text sm:text-[48px] lg:text-[58px]">
            {HERO.title}
          </h1>

          <p className="mb-6 mt-4 max-w-[440px] text-base leading-relaxed text-gv-text-soft">
            {HERO.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href={HERO.primaryCta.href}
              className="inline-flex min-h-12 items-center rounded-[7px] border border-gv-800 bg-gv-800 px-6 text-sm font-semibold text-white shadow-[0_8px_22px_rgb(68_54_46/0.14)] transition-all duration-200 hover:-translate-y-px hover:bg-gv-900 hover:shadow-[0_12px_28px_rgb(68_54_46/0.2)]"
            >
              {HERO.primaryCta.label}
            </Link>
            <Link
              href={HERO.secondaryCta.href}
              className="text-sm font-semibold text-gv-800 underline-offset-4 hover:underline"
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
        <Image
          src={HERO.imageUrl}
          alt=""
          fill
          // Plus grand élément visible au chargement : il ne doit pas attendre son tour.
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] lg:object-[center_right]"
        />
      </div>

      {/* Voile ivoire : il dégage la moitié gauche pour que le texte reste lisible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{ background: "var(--gv-hero-overlay)" }}
      />
    </section>
  );
}
