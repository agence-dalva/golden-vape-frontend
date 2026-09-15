import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
