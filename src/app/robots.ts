import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Domaine pas encore branché : le site reste hors des moteurs (voir lib/site).
  if (!SITE_URL) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages propres à chaque visiteur, sans intérêt pour un moteur.
      disallow: ["/cart", "/checkout", "/compte", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
