"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AGE_STORAGE_KEY } from "@/lib/age-gate";

/**
 * Doit rester aligné sur la durée de transition de `[data-leaving]` dans globals.css : le
 * portillon n'est démonté, et le défilement rendu, qu'une fois le fondu terminé.
 */
const FADE_OUT_MS = 260;

type Phase = "asking" | "refused" | "leaving" | "gone";

export default function AgeGate() {
  const [phase, setPhase] = useState<Phase>("asking");
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  /*
    Le portillon est rendu par le serveur pour couvrir la page dès la première peinture :
    sans cela, un nouveau visiteur apercevrait la boutique avant la question.

    Pour qui a déjà répondu, rien n'est à faire ici : le script d'amorçage a posé
    `data-age-ok` sur <html>, le CSS masque le panneau avant peinture et ne verrouille pas
    le défilement. Le balisage reste dans le document, inerte — il n'y a que le focus à ne
    pas déplacer vers un bouton invisible.
  */
  useEffect(() => {
    if (document.documentElement.dataset.ageOk === "1") return;
    acceptRef.current?.focus();
  }, []);

  // Le bouton cliqué disparaît avec la question : sans cela le focus retomberait sur le
  // document, derrière un panneau qui couvre tout l'écran.
  useEffect(() => {
    if (phase === "refused") backRef.current?.focus();
  }, [phase]);

  const accept = () => {
    try {
      localStorage.setItem(AGE_STORAGE_KEY, "1");
    } catch {
      // Réponse non mémorisable : la question reviendra au prochain chargement, ce qui est
      // le comportement prudent.
    }
    setPhase("leaving");
    window.setTimeout(() => {
      // Lève le verrou de défilement que le CSS pose sur <html>.
      document.documentElement.dataset.ageOk = "1";
      setPhase("gone");
    }, FADE_OUT_MS);
  };

  // Le reste de la page est toujours dans le document, derrière le panneau : sans ce
  // cantonnement, la tabulation irait promener le focus dans une boutique invisible.
  const keepFocusInside = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (phase === "gone") return null;

  const refused = phase === "refused";

  return (
    <div
      id="age-gate"
      data-leaving={phase === "leaving" ? "true" : undefined}
      onKeyDown={keepFocusInside}
      className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-gv-950 px-4 py-10"
      style={{
        // Fond opaque, mais pas une dalle plate : la lueur haute donne du relief au panneau.
        backgroundImage:
          "radial-gradient(120% 90% at 50% -10%, #3d312a 0%, #2c231f 52%, #1d1714 100%)",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-gv-800 shadow-[0_40px_90px_rgb(0_0_0/0.55)]"
      >
        {/* Le fond du fichier est exactement celui du panneau : le logotype s'y pose sans
            raccord visible, jusqu'aux filets dorés qui rejoignent les bords. */}
        <Image
          src="/logos/golden-vape-horizontal-ligne-fond-marron.png"
          alt="Golden Vape"
          width={4901}
          height={988}
          sizes="(max-width: 520px) 100vw, 480px"
          className="h-auto w-full"
        />

        <div className="px-7 pb-8 sm:px-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gv-300">
            {refused ? "Accès refusé" : "Vérification de l'âge"}
          </p>

          <h2
            id="age-gate-title"
            className="mt-3 font-display text-[19px] font-normal leading-[1.35] text-white sm:text-[21px]"
          >
            {refused ? "Réservé aux personnes majeures" : "Avez-vous 18 ans ou plus ?"}
          </h2>

          <p className="mt-3.5 text-[13.5px] leading-relaxed text-gv-200">
            La vente de produits du vapotage est interdite aux mineurs de moins de 18 ans.
            {refused
              ? " Vous ne pouvez pas accéder à cette boutique."
              : " Confirmez votre âge pour accéder à la boutique."}
          </p>

          {refused ? (
            <button
              ref={backRef}
              onClick={() => setPhase("asking")}
              className="mt-7 min-h-11 w-full cursor-pointer rounded-[8px] border border-white/20 px-4 text-[13px] font-semibold text-gv-100 transition-colors hover:bg-white/10"
            >
              Revenir à la question
            </button>
          ) : (
            <div className="mt-7 flex flex-col gap-2.5">
              <button
                ref={acceptRef}
                onClick={accept}
                className="min-h-11 cursor-pointer rounded-[8px] bg-white px-4 text-[13px] font-semibold text-gv-900 transition-colors hover:bg-gv-50"
              >
                Oui, j&apos;ai 18 ans ou plus
              </button>
              <button
                onClick={() => setPhase("refused")}
                className="min-h-11 cursor-pointer rounded-[8px] border border-white/20 px-4 text-[13px] font-semibold text-gv-100 transition-colors hover:bg-white/10"
              >
                Non, j&apos;ai moins de 18 ans
              </button>
            </div>
          )}

          {!refused && (
            <p className="mt-5 text-[11.5px] leading-relaxed text-gv-300/80">
              Votre réponse est conservée sur cet appareil.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
