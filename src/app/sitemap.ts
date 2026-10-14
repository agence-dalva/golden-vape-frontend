import type { MetadataRoute } from "next";
import { listBrands, listCategoryHandles, listProductHandles } from "@/lib/medusa";
import { DOMAINE_PREVU, SITE_URL } from "@/lib/site";

// Calculé à la demande plutôt qu'au build : le build Vercel n'a pas à dépendre du backend,
// et le catalogue change sans redéploiement. Les appels au backend, eux, sont gardés une
// heure en cache (lib/medusa).
export const dynamic = "force-dynamic";

const PAGES_FIXES = ["", "/categories", "/marques", "/mentions-legales", "/confidentialite", "/cookies"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL ?? DOMAINE_PREVU;
  const [produits, categories, marques] = await Promise.all([
    listProductHandles(),
    listCategoryHandles(),
    listBrands(),
  ]);

  const date = (valeur?: string | null) => (valeur ? new Date(valeur) : undefined);

  return [
    ...PAGES_FIXES.map((chemin) => ({ url: `${base}${chemin}` })),
    ...categories.map((c) => ({ url: `${base}/categories/${c.handle}`, lastModified: date(c.updated_at) })),
    ...marques.map((m) => ({ url: `${base}/marques/${encodeURIComponent(m.value)}` })),
    ...produits.map((p) => ({ url: `${base}/products/${p.handle}`, lastModified: date(p.updated_at) })),
  ];
}
