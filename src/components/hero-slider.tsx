"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "@/lib/slides";
import SearchBar from "@/components/search-bar";

const AUTOPLAY_MS = 6000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const hasMultipleSlides = HERO_SLIDES.length > 1;

  const goTo = useCallback((i: number) => {
    setIndex((i + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (!hasMultipleSlides) return;
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, goTo, hasMultipleSlides]);

  const slide = HERO_SLIDES[index];

  return (
    <section className="relative overflow-hidden bg-brand-chocolate">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-32 flex-col items-center justify-center"
          >
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-brand-cream sm:text-4xl">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-md text-balance text-brand-cream/70">{slide.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/*
          Volontairement hors de l'AnimatePresence : au changement de slide, React démonterait
          le champ et détruirait la saisie en cours — toutes les six secondes.
        */}
        <div className="mt-10 w-full">
          <SearchBar />
        </div>

        {hasMultipleSlides && (
          <div className="mt-10 flex gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Aller au slide ${i + 1}`}
                className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${
                  i === index ? "bg-brand-gold" : "bg-brand-cream/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {hasMultipleSlides && (
        <>
          {/* Masqués sur mobile : ils chevaucheraient la barre de recherche. */}
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Slide précédent"
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full bg-brand-cream/10 p-2 text-brand-cream transition-colors hover:bg-brand-cream/20 sm:block"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Slide suivant"
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full bg-brand-cream/10 p-2 text-brand-cream transition-colors hover:bg-brand-cream/20 sm:block"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </section>
  );
}
