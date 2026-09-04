"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ouverture au survol, fermeture légèrement différée.
 *
 * Entre un déclencheur et son panneau il reste toujours quelques pixels que le pointeur
 * traverse : sans ce délai, `mouseleave` referme le menu puis `mouseenter` le rouvre
 * aussitôt, ce qui produit un clignotement à chaque passage. Le délai laisse aussi le
 * temps de revenir en arrière après avoir dépassé le panneau.
 */
export function useHoverMenu(closeDelay = 140) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingClose = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const openMenu = useCallback(() => {
    cancelPendingClose();
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    cancelPendingClose();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  /** Fermeture immédiate : clic sur un lien du menu, déconnexion, échappement. */
  const closeNow = useCallback(() => {
    cancelPendingClose();
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    cancelPendingClose();
    setOpen((value) => !value);
  }, []);

  useEffect(() => cancelPendingClose, []);

  return {
    open,
    openMenu,
    closeMenu,
    closeNow,
    toggle,
    /** À poser sur l'élément qui englobe le déclencheur *et* le panneau. */
    hoverProps: { onMouseEnter: openMenu, onMouseLeave: closeMenu },
  };
}

/**
 * Panneau maintenu dans le DOM et animé en opacité : monter/démonter au survol ne laisse
 * aucune chance à une transition de s'exécuter. `visibility` fait partie des propriétés
 * animées pour que le panneau reste cliquable pendant toute la durée du fondu sortant.
 *
 * Fondu seul, sans déplacement. Le panneau montait auparavant de quatre pixels à l'ouverture :
 * sur un menu qui s'ouvre au simple survol, ce glissement se lisait comme un sursaut plutôt
 * que comme une animation — d'autant que le pointeur, lui, ne bouge pas.
 */
export function menuPanelClasses(open: boolean) {
  return `transition-[opacity,visibility] duration-200 ease-out ${
    open ? "visible opacity-100" : "invisible opacity-0"
  }`;
}
