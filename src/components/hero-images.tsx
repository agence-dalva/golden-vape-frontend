"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Le temps de lire le titre avant que l'image change ; le fondu, lui, doit se remarquer à
// peine.
const DUREE_AFFICHAGE_MS = 6000;
const DUREE_FONDU_MS = 1400;

const IMAGE_CLASSES = "object-cover object-[72%_center] lg:object-[center_right]";

/**
 * Images de la bannière d'accueil.
 *
 * Une image : posée telle quelle. Plusieurs : empilées, et la suivante apparaît en fondu par
 * dessus — aucun glissement. Le défilement attend que l'image suivante soit chargée, pour ne
 * jamais fondre vers un vide ; il s'arrête quand l'onglet est caché, et ne démarre pas du
 * tout si le visiteur a demandé à réduire les animations.
 */
export default function HeroImages({ sources }: { sources: string[] }) {
  const [active, setActive] = useState(0);
  const [chargees, setChargees] = useState<Set<number>>(() => new Set());
  const plusieurs = sources.length > 1;

  useEffect(() => {
    if (!plusieurs) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const minuterie = window.setInterval(() => {
      if (document.hidden) return;
      setActive((courante) => {
        const suivante = (courante + 1) % sources.length;
        return chargees.has(suivante) ? suivante : courante;
      });
    }, DUREE_AFFICHAGE_MS);

    return () => window.clearInterval(minuterie);
  }, [plusieurs, sources.length, chargees]);

  if (!plusieurs) {
    return (
      <Image
        src={sources[0]}
        alt=""
        fill
        // Plus grand élément visible au chargement : il ne doit pas attendre son tour.
        priority
        sizes="100vw"
        className={IMAGE_CLASSES}
      />
    );
  }

  return (
    <>
      {sources.map((source, index) => (
        <Image
          key={source}
          src={source}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          onLoad={() => setChargees((avant) => new Set(avant).add(index))}
          className={`${IMAGE_CLASSES} transition-opacity ease-in-out motion-reduce:transition-none ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${DUREE_FONDU_MS}ms` }}
        />
      ))}

      {/* Repères discrets : ils disent qu'il y a plusieurs images et permettent d'en choisir
          une. Placés à droite, loin du texte. */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2 lg:bottom-6 lg:right-8">
        {sources.map((source, index) => (
          <button
            key={source}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Afficher l'image ${index + 1} sur ${sources.length}`}
            aria-current={index === active}
            className={`h-2 cursor-pointer rounded-full shadow-[0_1px_4px_rgb(0_0_0/0.25)] transition-all duration-300 ${
              index === active ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/85"
            }`}
          />
        ))}
      </div>
    </>
  );
}
