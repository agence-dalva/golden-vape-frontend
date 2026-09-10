"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Clock, Check } from "lucide-react";
import {
  formatAddress,
  formatOpeningTimes,
  searchServicePoints,
  type ServicePoint,
} from "@/lib/service-points";

// Leaflet touche à `window` dès son évaluation : la carte ne peut pas être rendue côté
// serveur. Le squelette occupe sa place pour éviter que la page ne saute au chargement.
const ServicePointMap = dynamic(() => import("./service-point-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full animate-pulse rounded-lg bg-brand-chocolate/5 sm:h-[380px]" />
  ),
});

type Props = {
  /** Codes des réseaux desservis par le service choisi, pour ne montrer que ses points. */
  carriers: string[];
  /** Code postal de l'adresse de livraison, point de départ de la recherche. */
  defaultPostalCode?: string;
  defaultCity?: string;
  selected: ServicePoint | null;
  onSelect: (point: ServicePoint) => void;
};

/**
 * Sélecteur de point relais : recherche, carte et liste.
 *
 * La liste reste l'interface principale — elle porte l'adresse et les horaires, elle est
 * navigable au clavier et lisible par un lecteur d'écran. La carte l'accompagne pour
 * situer les points les uns par rapport aux autres.
 */
export default function ServicePointPicker({
  carriers,
  defaultPostalCode,
  defaultCity,
  selected,
  onSelect,
}: Props) {
  const [recherche, setRecherche] = useState(defaultPostalCode ?? "");
  const [points, setPoints] = useState<ServicePoint[]>([]);
  const [center, setCenter] = useState<{ latitude?: number; longitude?: number } | null>(null);
  const [chargement, setChargement] = useState(Boolean(defaultPostalCode));
  const [erreur, setErreur] = useState<string | null>(null);
  const [detailOuvert, setDetailOuvert] = useState<string | null>(null);

  // Une frappe rapide ou un déplacement de carte peuvent enchaîner les requêtes : seule
  // la dernière doit aboutir, sinon un résultat périmé écraserait le plus récent.
  const enCours = useRef<AbortController | null>(null);

  const lancer = useCallback(
    async (query: Parameters<typeof searchServicePoints>[0]) => {
      enCours.current?.abort();
      const controleur = new AbortController();
      enCours.current = controleur;

      setChargement(true);
      setErreur(null);

      try {
        const resultat = await searchServicePoints({ ...query, carriers }, controleur.signal);
        if (controleur.signal.aborted) return;
        setPoints(resultat.points);
        setCenter(resultat.center);
        if (resultat.points.length === 0) {
          setErreur("Aucun point relais trouvé dans cette zone.");
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErreur((e as Error).message);
      } finally {
        if (!controleur.signal.aborted) setChargement(false);
      }
    },
    [carriers]
  );

  // Première recherche depuis l'adresse de livraison : le client n'a rien à saisir dans
  // le cas courant.
  //
  // L'appel n'emprunte pas `lancer`, qui pose son état de chargement de façon synchrone :
  // le faire depuis un effet déclencherait un rendu en cascade. Ici, l'état n'est touché
  // qu'une fois la réponse revenue, et `chargement` part déjà à vrai à l'initialisation.
  const codesTransporteurs = carriers.join(",");
  useEffect(() => {
    if (!defaultPostalCode) return;

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
        setCenter(resultat.center);
        setErreur(resultat.points.length === 0 ? "Aucun point relais trouvé dans cette zone." : null);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError" || controleur.signal.aborted) return;
        setErreur(e.message);
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargement(false);
      });

    return () => controleur.abort();
  }, [defaultPostalCode, defaultCity, codesTransporteurs]);

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (recherche.trim()) void lancer({ postalCode: recherche.trim() });
        }}
        className="flex gap-2"
      >
        <label className="sr-only" htmlFor="recherche-point-relais">
          Code postal
        </label>
        <input
          id="recherche-point-relais"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          inputMode="numeric"
          placeholder="Code postal"
          className="flex-1 rounded-lg border border-brand-chocolate/20 px-3 py-2 text-sm text-brand-chocolate placeholder:text-brand-chocolate/40 focus:border-brand-gold-dark focus:outline-none"
        />
        <button
          type="submit"
          disabled={chargement}
          className="flex items-center gap-2 rounded-lg bg-brand-chocolate px-4 py-2 text-sm font-medium text-brand-cream disabled:opacity-50"
        >
          <Search size={15} />
          Chercher
        </button>
      </form>

      <ServicePointMap
        points={points}
        selectedKey={selected?.key ?? null}
        center={center}
        onSelect={onSelect}
        onSearchArea={(bounds) => void lancer({ bounds })}
      />

      {erreur && <p className="text-sm text-brand-chocolate/70">{erreur}</p>}

      {chargement && points.length === 0 ? (
        <p className="text-sm text-brand-chocolate/60">Recherche des points relais…</p>
      ) : (
        <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
          {points.map((point) => {
            const actif = point.key === selected?.key;
            const horaires = formatOpeningTimes(point.opening_times);

            return (
              <li key={point.key}>
                <div
                  className={[
                    "rounded-lg border px-4 py-3 transition-colors",
                    actif
                      ? "border-brand-gold-dark bg-brand-gold-dark/5"
                      : "border-brand-chocolate/15",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(point)}
                    className="flex w-full items-start gap-3 text-left"
                    aria-pressed={actif}
                  >
                    <MapPin
                      size={16}
                      className={actif ? "mt-0.5 text-brand-gold-dark" : "mt-0.5 text-brand-chocolate/40"}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-chocolate">
                          {point.name}
                        </span>
                        {actif && <Check size={14} className="text-brand-gold-dark" />}
                      </span>
                      <span className="mt-0.5 block text-xs text-brand-chocolate/60">
                        {formatAddress(point)}
                      </span>
                      {/* Les logos viennent du CDN Sendcloud : rien à héberger, et ils
                          suivent l'identité du transporteur si elle change. */}
                      <span className="mt-1.5 flex items-center gap-1.5">
                        {point.carriers.map((transporteur) =>
                          transporteur.icon_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={transporteur.code}
                              src={transporteur.icon_url}
                              alt={transporteur.name}
                              title={transporteur.name}
                              className="h-4 w-auto"
                            />
                          ) : (
                            <span
                              key={transporteur.code}
                              className="rounded bg-brand-chocolate/10 px-1.5 py-0.5 text-[10px] uppercase text-brand-chocolate/70"
                            >
                              {transporteur.name}
                            </span>
                          )
                        )}
                      </span>
                    </span>
                  </button>

                  {horaires.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setDetailOuvert(detailOuvert === point.key ? null : point.key)
                        }
                        className="mt-2 flex items-center gap-1.5 text-xs text-brand-chocolate/60 hover:text-brand-chocolate"
                        aria-expanded={detailOuvert === point.key}
                      >
                        <Clock size={13} />
                        {detailOuvert === point.key ? "Masquer" : "Voir"} les horaires
                      </button>

                      {detailOuvert === point.key && (
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs text-brand-chocolate/70">
                          {horaires.map((ligne) => (
                            <div key={ligne.jour} className="contents">
                              <dt>{ligne.jour}</dt>
                              <dd className="tabular-nums">{ligne.creneaux}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
