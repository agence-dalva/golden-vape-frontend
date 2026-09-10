"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ServicePoint } from "@/lib/service-points";

type Bounds = { neLat: number; neLng: number; swLat: number; swLng: number };

type Props = {
  points: ServicePoint[];
  selectedKey: string | null;
  center: { latitude?: number; longitude?: number } | null;
  onSelect: (point: ServicePoint) => void;
  /** Appelé quand le client demande à chercher dans la zone qu'il vient de cadrer. */
  onSearchArea: (bounds: Bounds) => void;
};

/**
 * Carte des points relais.
 *
 * Leaflet est piloté à la main plutôt que via `react-leaflet` : ce dernier n'a supporté
 * React 19 que tardivement, et la surface utilisée ici — une carte, des épingles, un
 * recadrage — ne justifie pas d'y adosser le tunnel de commande.
 *
 * Les épingles sont des `divIcon` en HTML plutôt que les marqueurs par défaut, dont les
 * images se résolvent mal une fois empaquetées, et qui ne se coloreraient pas par réseau.
 */
export default function ServicePointMap({
  points,
  selectedKey,
  center,
  onSelect,
  onSearchArea,
}: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<LeafletMap | null>(null);
  const epingles = useRef<Map<string, Marker>>(new Map());
  // Les gestionnaires changent à chaque rendu ; la carte, elle, n'est construite qu'une
  // fois. On lit donc toujours la version courante à travers une référence, mise à jour
  // après le rendu — y toucher pendant violerait la pureté du rendu.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!conteneur.current || carte.current) return;

    let annule = false;

    // Import différé : Leaflet touche à `window` dès son évaluation et ne survit pas au
    // rendu serveur.
    void import("leaflet").then((L) => {
      if (annule || !conteneur.current) return;

      const instance = L.map(conteneur.current, {
        scrollWheelZoom: false, // sinon la molette capture le défilement de la page
        attributionControl: true,
      }).setView([46.6, 2.4], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(instance);

      carte.current = instance;
    });

    // La collection d'épingles est capturée ici : au moment du nettoyage, la référence
    // pourrait déjà pointer ailleurs.
    const collection = epingles.current;

    return () => {
      annule = true;
      carte.current?.remove();
      carte.current = null;
      collection.clear();
    };
  }, []);

  // Épingles : on repart de zéro à chaque changement de jeu de points. Leur nombre est
  // plafonné à cent par le backend, le coût est négligeable devant la complexité d'un
  // rapprochement incrémental.
  useEffect(() => {
    const instance = carte.current;
    if (!instance) return;

    let annule = false;

    void import("leaflet").then((L) => {
      if (annule || !carte.current) return;

      for (const epingle of epingles.current.values()) epingle.remove();
      epingles.current.clear();

      const positions: [number, number][] = [];

      for (const point of points) {
        if (!point.position) continue;

        const coord: [number, number] = [point.position.latitude, point.position.longitude];
        positions.push(coord);

        const actif = point.key === selectedKey;
        const marker = L.marker(coord, {
          title: point.name,
          icon: L.divIcon({
            className: "",
            html: epingleHtml(point, actif),
            iconSize: [30, 38],
            iconAnchor: [15, 38],
          }),
          zIndexOffset: actif ? 1000 : 0,
        })
          .addTo(carte.current!)
          .on("click", () => onSelectRef.current(point));

        epingles.current.set(point.key, marker);
      }

      if (positions.length > 0) {
        carte.current.fitBounds(L.latLngBounds(positions), { padding: [32, 32], maxZoom: 15 });
      } else if (center?.latitude && center?.longitude) {
        carte.current.setView([center.latitude, center.longitude], 13);
      }
    });

    return () => {
      annule = true;
    };
  }, [points, selectedKey, center]);

  // Recentrage sur le point choisi depuis la liste, sans recadrer toute la carte.
  useEffect(() => {
    if (!selectedKey || !carte.current) return;
    const point = points.find((p) => p.key === selectedKey);
    if (point?.position) {
      carte.current.panTo([point.position.latitude, point.position.longitude]);
    }
  }, [selectedKey, points]);

  return (
    <div className="relative">
      <div
        ref={conteneur}
        className="h-[320px] w-full rounded-lg border border-brand-chocolate/15 sm:h-[380px]"
        role="application"
        aria-label="Carte des points relais"
      />
      <button
        type="button"
        onClick={() => {
          const limites = carte.current?.getBounds();
          if (!limites) return;
          onSearchArea({
            neLat: limites.getNorth(),
            neLng: limites.getEast(),
            swLat: limites.getSouth(),
            swLng: limites.getWest(),
          });
        }}
        className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-medium text-brand-chocolate shadow-md ring-1 ring-brand-chocolate/10 hover:bg-brand-cream"
      >
        Rechercher dans cette zone
      </button>
    </div>
  );
}

/**
 * Épingle en HTML.
 *
 * Le point choisi passe en doré et grandit : sur une carte dense, la couleur seule ne
 * suffit pas à le retrouver du regard.
 */
function epingleHtml(point: ServicePoint, actif: boolean): string {
  const fond = actif ? "#b8892b" : "#4a3728";
  const taille = actif ? 34 : 26;
  const initiale = point.carriers[0]?.code.charAt(0).toUpperCase() ?? "?";

  return `<div style="
    width:${taille}px;height:${taille}px;margin-left:${(30 - taille) / 2}px;
    background:${fond};color:#fff;border:2px solid #fff;border-radius:50% 50% 50% 4px;
    transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);
    display:flex;align-items:center;justify-content:center;font:600 ${actif ? 13 : 11}px system-ui;
  "><span style="transform:rotate(45deg)">${initiale}</span></div>`;
}
