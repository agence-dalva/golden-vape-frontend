import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
  Robots qui collectent de quoi entraîner des modèles : ils n'amènent aucun client. Le 28/10,
  ClaudeBot a fait 96 % du trafic et l'essentiel de la facture Vercel du jour. Les robots qui
  alimentent les réponses des assistants (Claude-SearchBot, OAI-SearchBot…) restent admis :
  eux peuvent envoyer des visiteurs.
*/
const ROBOTS_ENTRAINEMENT = [
  "ClaudeBot",
  "anthropic-ai",
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "meta-externalagent",
];

/*
  Filtres, tri et pagination du catalogue. Chaque combinaison est une URL distincte, et chaque
  page filtrée en propose une centaine d'autres : un robot qui suit les liens n'en voit jamais
  le bout, et chacune est rendue à la demande. Les fiches sont toutes dans le sitemap, et les
  pages filtrées pointent vers la catégorie en `canonical` : rien n'est perdu pour l'index.

  Motifs sur le nom du paramètre, et non `/*?` : les fichiers JS et CSS portent un `?dpl=` que
  Google doit pouvoir charger pour rendre les pages.
*/
const PARAMETRES_CATALOGUE = ["f_", "tri=", "page="].flatMap((nom) => [`/*?${nom}`, `/*&${nom}`]);

export default function robots(): MetadataRoute.Robots {
  // Domaine pas encore branché : le site reste hors des moteurs (voir lib/site).
  if (!SITE_URL) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Pages propres à chaque visiteur, sans intérêt pour un moteur.
        disallow: ["/cart", "/checkout", "/compte", "/api/", ...PARAMETRES_CATALOGUE],
      },
      { userAgent: ROBOTS_ENTRAINEMENT, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
