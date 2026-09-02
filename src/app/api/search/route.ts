import { searchCatalog } from "@/lib/medusa";

// Relais entre la barre de recherche et Medusa : la clé publiable et l'URL du backend
// restent côté serveur, et le navigateur n'a pas à dialoguer avec Medusa directement.
export async function GET(request: Request): Promise<Response> {
  const term = new URL(request.url).searchParams.get("q") ?? "";

  try {
    return Response.json(await searchCatalog(term));
  } catch {
    // Une panne de la recherche ne doit pas casser la page : on renvoie un résultat vide.
    return Response.json({ products: [], brands: [] });
  }
}
