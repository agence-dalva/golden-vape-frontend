"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistance, type ServicePoint } from "@/lib/service-points";

type Bounds = { neLat: number; neLng: number; swLat: number; swLng: number };

type Props = {
  points: ServicePoint[];
  selectedKey: string | null;
  onSelect: (point: ServicePoint) => void;
  onSearchArea: (bounds: Bounds) => void;
};

/**
 * Carte des points relais.
 *
 * Leaflet est piloté à la main plutôt que via `react-leaflet` : ce dernier n'a supporté
 * React 19 que tardivement, et la surface utilisée ici — des épingles et un cadrage — ne
 * justifie pas d'y adosser le tunnel de commande.
 *
 * La vue se cale toujours sur les points trouvés : Sendcloud ne rend aucune coordonnée
 * pour la zone cherchée, et une carte ouverte sur la France entière obligerait le client à
 * zoomer avant de comprendre ce qu'il regarde.
 */
export default function ServicePointMap({ points, selectedKey, onSelect, onSearchArea }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<LeafletMap | null>(null);
  const epingles = useRef<Map<string, Marker>>(new Map());
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
        // La molette capturerait le défilement de la page au passage de la souris.
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      }).setView([47.63, 7.47], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(instance);

      carte.current = instance;
    });

    const collection = epingles.current;

    return () => {
      annule = true;
      carte.current?.remove();
      carte.current = null;
      collection.clear();
    };
  }, []);

  // Épingles refaites à chaque changement de jeu de points ou de sélection. Leur nombre
  // est plafonné par le backend : le coût est négligeable devant un rapprochement
  // incrémental.
  useEffect(() => {
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
            html: epingleHtml(actif),
            iconSize: [actif ? 30 : 24, actif ? 38 : 30],
            iconAnchor: [actif ? 15 : 12, actif ? 38 : 30],
          }),
          zIndexOffset: actif ? 1000 : 0,
        })
          .addTo(carte.current!)
          .on("click", () => onSelectRef.current(point));

        // Le point retenu porte son nom : sur une carte dense, la couleur seule oblige à
        // revenir à la liste pour savoir lequel est selectionne.
        if (actif) {
          marker
            .bindTooltip(
              `<strong>${echapper(point.name)}</strong><span>${formatDistance(point.distance)}</span>`,
              { permanent: true, direction: "top", offset: [0, -34], className: "gv-relay-tip" }
            )
            .openTooltip();
        }

        epingles.current.set(point.key, marker);
      }

      if (positions.length > 0) {
        carte.current.fitBounds(L.latLngBounds(positions), { padding: [34, 34], maxZoom: 14 });
      }
    });

    return () => {
      annule = true;
    };
  }, [points, selectedKey]);

  // Recentrage doux sur le point choisi depuis la liste, sans recadrer toute la carte.
  useEffect(() => {
    if (!selectedKey || !carte.current) return;
    const point = points.find((p) => p.key === selectedKey);
    if (point?.position) {
      carte.current.panTo([point.position.latitude, point.position.longitude], { animate: true });
    }
  }, [selectedKey, points]);

  return (
    <div className="relative h-[260px] overflow-hidden rounded-lg border border-brand-chocolate/10 sm:h-[300px]">
      <div ref={conteneur} className="h-full w-full" role="application" aria-label="Carte des points relais" />
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
        className="absolute left-1/2 top-2.5 z-[1000] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-gv-800 shadow-sm ring-1 ring-brand-chocolate/10 backdrop-blur transition-colors hover:bg-white"
      >
        Rechercher dans cette zone
      </button>
    </div>
  );
}

/** Épingle en HTML : les marqueurs par défaut de Leaflet résolvent mal leurs images une
 *  fois empaquetés, et ne se coloreraient pas selon la sélection. */
function epingleHtml(actif: boolean): string {
  const fond = actif ? "#44362e" : "#a89484";
  const taille = actif ? 26 : 20;

  return `<div style="
    width:${taille}px;height:${taille}px;
    background:${fond};border:2px solid #fff;border-radius:50% 50% 50% 3px;
    transform:rotate(-45deg);box-shadow:0 1px 4px rgba(40,30,25,.35);
    display:flex;align-items:center;justify-content:center;
  "><span style="width:6px;height:6px;background:#fff;border-radius:50%"></span></div>`;
}

function echapper(texte: string): string {
  return texte.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c
  );
}
