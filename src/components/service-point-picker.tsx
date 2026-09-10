"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, MapPin, Search, X } from "lucide-react";
import {
  formatDistance,
  horaireDuJour,
  searchServicePoints,
  type ServicePoint,
} from "@/lib/service-points";

// Leaflet touche à `window` dès son évaluation : la carte ne peut pas être rendue côté
// serveur. Le squelette occupe sa place pour éviter que la mise en page ne saute.
const ServicePointMap = dynamic(() => import("./service-point-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] animate-pulse rounded-lg bg-brand-chocolate/5 sm:h-[360px]" />
  ),
});

type Props = {
  carriers: string[];
  defaultPostalCode?: string;
  defaultCity?: string;
  selected: ServicePoint | null;
  onSelect: (point: ServicePoint) => void;
  /** Prix du service, rappelé en regard du titre. */
  priceLabel?: string;
  /**
   * Faux quand le sélecteur est replié — livraison à domicile choisie.
   *
   * Il reste monté pour que le repli s'anime dans les deux sens, mais il ne doit alors
   * ni chercher ni consommer de quota : une recherche pour un mode que le client vient
   * d'écarter ne servirait personne.
   */
  active: boolean;
};

/**
 * Sélecteur de point relais : recherche, carte et liste.
 *
 * La liste porte l'information — nom, distance, adresse, horaires — et reste navigable au
 * clavier ; la carte l'accompagne pour situer les points les uns par rapport aux autres.
 * Les deux se répondent : choisir dans l'une met l'autre à jour.
 */
export default function ServicePointPicker({
  carriers,
  defaultPostalCode,
  defaultCity,
  selected,
  onSelect,
  priceLabel,
  active,
}: Props) {
  const rechercheInitiale = [defaultPostalCode, defaultCity].filter(Boolean).join(" ");
  const [recherche, setRecherche] = useState(rechercheInitiale);
  const [points, setPoints] = useState<ServicePoint[]>([]);
  const [chargement, setChargement] = useState(Boolean(defaultPostalCode));
  const [erreur, setErreur] = useState<string | null>(null);

  // Une frappe rapide ou un déplacement de carte peuvent enchaîner les requêtes : seule la
  // dernière doit aboutir, sinon un résultat périmé écraserait le plus récent.
  const enCours = useRef<AbortController | null>(null);
  const codesTransporteurs = carriers.join(",");

  const lancer = useCallback(
    async (query: Parameters<typeof searchServicePoints>[0]) => {
      enCours.current?.abort();
      const controleur = new AbortController();
      enCours.current = controleur;

      setChargement(true);
      setErreur(null);

      try {
        const resultat = await searchServicePoints(
          { ...query, carriers: codesTransporteurs ? codesTransporteurs.split(",") : undefined },
          controleur.signal
        );
        if (controleur.signal.aborted) return;
        setPoints(resultat.points);
        if (resultat.points.length === 0) setErreur("Aucun point relais dans cette zone.");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErreur((e as Error).message);
      } finally {
        if (!controleur.signal.aborted) setChargement(false);
      }
    },
    [codesTransporteurs]
  );

  // Recherche d'ouverture depuis l'adresse de livraison : dans le cas courant, le client
  // n'a rien à saisir ni à cliquer.
  //
  // L'appel n'emprunte pas `lancer`, qui pose son état de chargement de façon synchrone —
  // le faire depuis un effet déclencherait un rendu en cascade.
  useEffect(() => {
    if (!active || !defaultPostalCode) return;

    const controleur = new AbortController();
    enCours.current = controleur;

    searchServicePoints(
      {
        postalCode: defaultPostalCode,
        city: defaultCity,
        carriers: codesTransporteurs ? codesTransporteurs.split(",") : undefined,
      },
      controleur.signal
    )
      .then((resultat) => {
        if (controleur.signal.aborted) return;
        setPoints(resultat.points);
        setErreur(resultat.points.length === 0 ? "Aucun point relais dans cette zone." : null);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError" || controleur.signal.aborted) return;
        setErreur(e.message);
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargement(false);
      });

    return () => controleur.abort();
  }, [active, defaultPostalCode, defaultCity, codesTransporteurs]);

  const lieu = defaultCity ?? defaultPostalCode;

  return (
    <div className="mt-5 rounded-lg border border-brand-chocolate/10 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <MapPin size={17} className="mt-0.5 shrink-0 text-gv-800" />
          <div>
            <h3 className="text-[16px] font-semibold text-gv-text">
              Choisissez votre point relais
            </h3>
            <p className="mt-0.5 text-[13.5px] text-gv-text-soft">
              {chargement && points.length === 0
                ? "Recherche en cours…"
                : `${points.length} point${points.length > 1 ? "s" : ""} disponible${points.length > 1 ? "s" : ""}${lieu ? ` autour de ${lieu}` : ""}`}
            </p>
          </div>
        </div>
        {priceLabel && (
          <span className="shrink-0 rounded-md bg-gv-50 px-2.5 py-1 text-[13px] font-medium text-gv-800">
            {priceLabel}
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (recherche.trim()) void lancer({ postalCode: recherche.trim() });
        }}
        className="mb-3 flex gap-2"
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gv-text-soft"
          />
          <label className="sr-only" htmlFor="recherche-point-relais">
            Code postal ou ville
          </label>
          <input
            id="recherche-point-relais"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Code postal ou ville"
            className="h-10 w-full rounded-md border border-gv-border bg-white pl-9 pr-8 text-sm text-gv-text placeholder:text-gv-text-soft/70 focus:border-gv-800 focus:outline-none"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gv-text-soft transition-colors hover:text-gv-text"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={chargement}
          className="h-10 shrink-0 rounded-md bg-gv-800 px-5 text-sm font-medium text-white transition-colors hover:bg-gv-900 disabled:opacity-50"
        >
          Rechercher
        </button>
      </form>

      {erreur && <p className="mb-3 text-[13px] text-gv-text-soft">{erreur}</p>}

      {/* Carte et liste côte à côte : on lit une adresse tout en la situant, sans faire
          défiler de l'une à l'autre. Elles s'empilent sous 768 px. */}
      <div className="grid gap-3 md:grid-cols-[52%_1fr]">
        <ServicePointMap
          points={points}
          selectedKey={selected?.key ?? null}
          onSelect={onSelect}
          onSearchArea={(bounds) => void lancer({ bounds })}
        />

        <ul className="gv-relay-list flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[360px]">
          {points.map((point) => {
            const actif = point.key === selected?.key;
            const horaire = horaireDuJour(point);

            return (
              <li key={point.key}>
                <button
                  type="button"
                  onClick={() => onSelect(point)}
                  aria-pressed={actif}
                  className={[
                    "w-full rounded-lg border p-3.5 text-left transition-colors",
                    actif
                      ? "border-gv-800 bg-[#fdfbf9]"
                      : "border-brand-chocolate/10 hover:border-brand-chocolate/25",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      size={15}
                      className={actif ? "mt-0.5 shrink-0 text-gv-800" : "mt-0.5 shrink-0 text-gv-500"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[15px] font-semibold text-gv-text">
                          {point.name}
                        </span>
                        <span className="shrink-0 text-[13.5px] font-medium text-gv-text-soft">
                          {formatDistance(point.distance)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12.5px] uppercase leading-snug tracking-[0.02em] text-gv-text-soft">
                        {point.address.house_number} {point.address.street}
                        <br />
                        {point.address.postal_code} {point.address.city}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px]">
                        <span
                          aria-hidden
                          className={[
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            horaire.ouvert ? "bg-emerald-500" : "bg-gv-500",
                          ].join(" ")}
                        />
                        <span className={horaire.ouvert ? "text-emerald-700" : "text-gv-text-soft"}>
                          {horaire.texte}
                        </span>
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className={[
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        actif ? "border-gv-800 bg-gv-800 text-white" : "border-gv-border-strong",
                      ].join(" ")}
                    >
                      {actif && <Check size={12} strokeWidth={3} />}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
