"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "@/lib/slides";

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
    <div className="relative overflow-hidden bg-brand-chocolate">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-72 flex-col items-start justify-center gap-4 py-16"
          >
            <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-brand-cream text-balance">
              {slide.title}
            </h1>
            <p className="max-w-md text-brand-cream/80">{slide.subtitle}</p>
            <a
              href={slide.ctaHref}
              className="mt-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-medium text-brand-chocolate transition-colors hover:bg-brand-gold-dark"
            >
              {slide.ctaLabel}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {hasMultipleSlides && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Slide précédent"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-cream/10 p-2 text-brand-cream hover:bg-brand-cream/20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Slide suivant"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-cream/10 p-2 text-brand-cream hover:bg-brand-cream/20"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Aller au slide ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-brand-gold" : "bg-brand-cream/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
