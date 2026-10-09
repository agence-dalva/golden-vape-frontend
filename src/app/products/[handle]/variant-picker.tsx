"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MedusaVariant } from "@/lib/medusa";

// Au-delà, les déclinaisons suivantes passent dans un menu déroulant : les 42 cartouches
// Le Pod Switch faisaient onze rangées de boutons et repoussaient le bouton panier hors de
// l'écran.
const VISIBLE_VARIANTS = 8;

const GRID_CLASSES = "grid grid-cols-2 gap-3 sm:grid-cols-4";

const isUnavailable = (variant: MedusaVariant) =>
  variant.inventory_quantity !== null && variant.inventory_quantity <= 0;

const labelOf = (variant: MedusaVariant) => variant.options[0]?.value ?? variant.title;

function VariantButton({
  variant,
  isSelected,
  onSelect,
}: {
  variant: MedusaVariant;
  isSelected: boolean;
  onSelect: (variantId: string) => void;
}) {
  const unavailable = isUnavailable(variant);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      // Une déclinaison en rupture reste visible : la masquer laisserait croire qu'elle
      // n'existe pas.
      disabled={unavailable}
      onClick={() => onSelect(variant.id)}
      className={`min-h-[50px] cursor-pointer rounded-[7px] border px-2 text-sm font-semibold transition-all duration-200 ${
        isSelected
          ? "border-gv-800 bg-gv-800 text-white shadow-[0_7px_18px_rgb(68_54_46/0.16)]"
          : "border-gv-border-strong bg-white text-gv-text hover:border-gv-800"
      } ${unavailable ? "cursor-not-allowed line-through opacity-45" : ""}`}
    >
      {labelOf(variant)}
      {unavailable && <span className="sr-only"> — indisponible</span>}
    </button>
  );
}

export default function VariantPicker({
  variants,
  selectedId,
  optionTitle,
  onSelect,
}: {
  variants: MedusaVariant[];
  selectedId: string | undefined;
  optionTitle: string;
  onSelect: (variantId: string) => void;
}) {
  const visible = variants.slice(0, VISIBLE_VARIANTS);
  const more = variants.slice(VISIBLE_VARIANTS);
  const selectedInMore = more.find((variant) => variant.id === selectedId);
  const legend = `Choisissez votre ${optionTitle.toLowerCase()}`;

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-gv-text">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className={GRID_CLASSES}>
        {visible.map((variant) => (
          <VariantButton
            key={variant.id}
            variant={variant}
            isSelected={variant.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {more.length > 0 && (
        <MoreVariants
          variants={more}
          selected={selectedInMore}
          optionTitle={optionTitle}
          onSelect={onSelect}
        />
      )}
    </fieldset>
  );
}

/**
 * Les déclinaisons au-delà des huit premières, dans un panneau qui reprend les mêmes boutons.
 *
 * Le panneau flotte au-dessus de la fiche plutôt que de s'insérer dans le flux : l'ouvrir ne
 * repousse ni le bouton panier ni la suite de la page, et au-delà de quatre rangées il défile
 * de lui-même.
 */
function MoreVariants({
  variants,
  selected,
  optionTitle,
  onSelect,
}: {
  variants: MedusaVariant[];
  selected: MedusaVariant | undefined;
  optionTitle: string;
  onSelect: (variantId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Un clic hors du menu ou la touche Échap le referment ; Échap rend aussi le focus au
  // déclencheur, pour que le clavier ne se perde pas dans un panneau disparu.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // À l'ouverture, le focus va sur la déclinaison choisie, sinon sur la première disponible,
  // et le panneau défile jusqu'à elle.
  useEffect(() => {
    if (!open) return;
    const target =
      panelRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]') ??
      panelRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest" });
  }, [open]);

  const choose = (variantId: string) => {
    onSelect(variantId);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative mt-3">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        // Le déclencheur prend l'allure d'un bouton choisi quand la déclinaison retenue vient
        // du menu : sans cela, aucune case ne paraîtrait sélectionnée.
        className={`flex min-h-[50px] w-full cursor-pointer items-center justify-between gap-3 rounded-[7px] border px-3.5 text-left text-sm font-semibold transition-all duration-200 ${
          selected
            ? "border-gv-800 bg-gv-800 text-white shadow-[0_7px_18px_rgb(68_54_46/0.16)]"
            : "border-gv-border-strong bg-white text-gv-text hover:border-gv-800"
        }`}
      >
        <span>
          {selected ? labelOf(selected) : `${variants.length} autres choix`}
          <span className="sr-only">
            {selected
              ? ` — changer de ${optionTitle.toLowerCase()}, ${variants.length} autres choix`
              : ` de ${optionTitle.toLowerCase()}`}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
            selected ? "text-white/80" : "text-gv-text-muted"
          }`}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[min(296px,60vh)] overflow-y-auto overscroll-contain rounded-xl border border-gv-border bg-white p-3 shadow-gv-raised-strong"
        >
          <div
            role="radiogroup"
            aria-label={`Autres choix de ${optionTitle.toLowerCase()}`}
            className={GRID_CLASSES}
          >
            {variants.map((variant) => (
              <VariantButton
                key={variant.id}
                variant={variant}
                isSelected={variant.id === selected?.id}
                onSelect={choose}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
