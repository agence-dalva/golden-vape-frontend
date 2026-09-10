import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";

/** Un réseau desservant un lieu. Un même commerce peut en servir plusieurs. */
export type ServicePointCarrier = {
  code: string;
  name: string;
  icon_url?: string;
  /** Identifiant chez le transporteur : c'est lui qui part à l'affranchissement. */
  service_point_id: string;
  sendcloud_id: number;
};

export type ServicePoint = {
  key: string;
  name: string;
  address: {
    street: string;
    house_number: string;
    postal_code: string;
    city: string;
    country_code: string;
  };
  position?: { latitude: number; longitude: number };
  shop_type?: string;
  opening_times?: Record<string, { start_time: string; end_time: string }[] | null>;
  /** En mètres, depuis le lieu cherché. */
  distance?: number;
  is_open_tomorrow?: boolean;
  next_open_at?: string | null;
  carriers: ServicePointCarrier[];
};

export type ServicePointSearch = {
  /** Adresse reconnue par Sendcloud. Il ne rend pas de coordonnées : la carte se cadre
      sur les points eux-mêmes. */
  place: string | null;
  points: ServicePoint[];
};

export type ServicePointQuery = {
  postalCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  bounds?: { neLat: number; neLng: number; swLat: number; swLng: number };
  carriers?: string[];
  countryCode?: string;
};

/**
 * Interroge la recherche de points relais du backend.
 *
 * Le front ne parle jamais à Sendcloud directement : la clé secrète resterait exposée à
 * tous les visiteurs. Medusa sert d'intermédiaire et ne rend que l'utile à l'affichage.
 */
export async function searchServicePoints(
  query: ServicePointQuery,
  signal?: AbortSignal
): Promise<ServicePointSearch> {
  const params = new URLSearchParams();

  if (query.countryCode) params.set("country_code", query.countryCode);
  if (query.carriers?.length) params.set("carriers", query.carriers.join(","));

  // Une seule source de localisation à la fois — le backend applique la même règle que
  // Sendcloud, qui refuse un mélange.
  if (query.bounds) {
    params.set("ne_lat", String(query.bounds.neLat));
    params.set("ne_lng", String(query.bounds.neLng));
    params.set("sw_lat", String(query.bounds.swLat));
    params.set("sw_lng", String(query.bounds.swLng));
  } else if (query.latitude !== undefined && query.longitude !== undefined) {
    params.set("latitude", String(query.latitude));
    params.set("longitude", String(query.longitude));
    if (query.radius) params.set("radius", String(query.radius));
  } else {
    if (query.postalCode) params.set("postal_code", query.postalCode);
    if (query.city) params.set("city", query.city);
  }

  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/delivery/service-points?${params.toString()}`,
    {
      headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
      signal,
    }
  );

  if (!res.ok) {
    throw new Error(`Recherche de points relais indisponible (${res.status}).`);
  }

  return res.json();
}

const JOURS: [string, string][] = [
  ["monday", "Lundi"],
  ["tuesday", "Mardi"],
  ["wednesday", "Mercredi"],
  ["thursday", "Jeudi"],
  ["friday", "Vendredi"],
  ["saturday", "Samedi"],
  ["sunday", "Dimanche"],
];

/** Horaires d'un point, prêts à afficher : jours fermés compris, dans l'ordre de la semaine. */
export function formatOpeningTimes(
  times: ServicePoint["opening_times"]
): { jour: string; creneaux: string }[] {
  if (!times) return [];

  return JOURS.map(([cle, libelle]) => {
    const creneaux = times[cle];
    return {
      jour: libelle,
      creneaux:
        creneaux && creneaux.length > 0
          ? creneaux.map((c) => `${c.start_time} – ${c.end_time}`).join(", ")
          : "Fermé",
    };
  });
}

/** Adresse sur une ligne, telle qu'on l'affiche sous le nom du commerce. */
export function formatAddress(point: ServicePoint): string {
  const rue = [point.address.house_number, point.address.street].filter(Boolean).join(" ");
  return `${rue}, ${point.address.postal_code} ${point.address.city}`;
}

/** « 650 m » en deçà du kilomètre, « 2,1 km » au-delà : la précision au mètre n'aide plus. */
export function formatDistance(metres?: number): string {
  if (metres === undefined) return "";
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1).replace(".", ",")} km`;
}

const CLES_JOURS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * Ouverture du jour, telle qu'on l'annonce dans la liste.
 *
 * On ne montre que l'heure de fermeture : devant choisir un point où passer ce soir, on
 * cherche jusqu'à quand il reste ouvert, pas la liste de ses créneaux.
 */
export function horaireDuJour(point: ServicePoint): { ouvert: boolean; texte: string } {
  const creneaux = point.opening_times?.[CLES_JOURS[new Date().getDay()]];

  if (!creneaux || creneaux.length === 0) {
    return {
      ouvert: false,
      texte: point.is_open_tomorrow ? "Fermé · ouvre demain" : "Fermé aujourd'hui",
    };
  }

  const fermeture = creneaux[creneaux.length - 1].end_time.replace(":", "h");
  return { ouvert: true, texte: `Ouvert aujourd'hui · jusqu'à ${fermeture}` };
}
