import type { NextConfig } from "next";
import path from "path";

/*
  En-têtes de sécurité, sur toutes les pages.

  - Cadres : seul le site lui-même peut afficher ses pages dans un cadre. Ailleurs, une page
    piégée pouvait superposer la nôtre (clickjacking) et faire cliquer à l'aveugle sur
    « Payer ma commande » ou « Supprimer l'adresse ». Pas `'none'` : en mode iframe de
    Monetico, la page de retour s'affiche dans un cadre de notre propre page.
  - Type MIME : le navigateur s'en tient au type annoncé, sans deviner.
  - Référent : les autres sites ne reçoivent que le domaine, jamais le chemin — qui porte
    un identifiant de commande ou un jeton de réinitialisation.
  - Caméra, micro et position : le site ne s'en sert pas, personne ne pourra les demander
    en son nom.

  Pas de politique de contenu complète (CSP) : elle demanderait de lister chaque source
  (Monetico, Google, R2, tuiles de carte, backend) et de la tenir à jour à chaque service
  ajouté. `frame-ancestors` en est la seule directive posée.
*/
const EN_TETES_SECURITE = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Inutile d'annoncer le framework et sa version.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: EN_TETES_SECURITE },
      // Ces adresses portent un jeton ou un identifiant de commande : la page suivante ne
      // doit pas les recevoir comme référent, qu'un outil de mesure relèverait. Placées
      // après la règle générale, qu'elles remplacent pour cet en-tête.
      ...["/compte/reinitialisation", "/checkout/confirmation/:path*"].map((source) => ({
        source,
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      })),
    ];
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-e8add125590343a2b2abc50dc4f20555.r2.dev",
      },
    ],
    // Les visuels de `public/` sont servis sans Cache-Control : sans ceci, Vercel
    // re-transforme (et facture) chacune de leurs variantes toutes les 4 h — le défaut
    // de Next 16. Les images R2 portent déjà un max-age d'un an et ne sont pas
    // concernées. 31 jours est la valeur que Vercel recommande.
    //
    // Revers : le cache d'images ne s'invalide pas. Un visuel local remplacé sous le
    // même nom peut rester visible dans son ancienne version jusqu'à un mois : renommer
    // le fichier quand on le change.
    minimumCacheTTL: 2678400,
    // Sans 2048 et 3840 : ces largeurs ne servaient qu'à décliner le hero pour des
    // écrans 4K, et chaque largeur est une transformation de plus à payer.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
