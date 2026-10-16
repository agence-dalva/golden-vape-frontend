import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/*
  Accès privé avant le lancement.

  Tant que la variable `SITE_ACCES` (« identifiant:motdepasse ») est posée, chaque visiteur
  doit s'identifier : le navigateur affiche sa fenêtre de connexion et retient la réponse pour
  le reste de la visite. Le jour du lancement, on supprime la variable et on redéploie — le
  site s'ouvre à tous, sans changer de code.

  Pages et code du site sont couverts : le JavaScript, et la clé publique de l'API qu'il
  contient, ne se téléchargent pas sans identifiant. Les retours de paiement de Monetico
  passent par le navigateur du client, déjà identifié ; les notifications de Monetico et de
  Sendcloud vont au backend, pas ici.

  Seules les images restent libres (voir `config`) : l'optimiseur d'images va chercher
  l'original par une requête à part, sans identifiant, et les bloquer les cassait toutes.
*/
export function proxy(request: NextRequest) {
  const attendu = process.env.SITE_ACCES?.trim();
  if (!attendu) return NextResponse.next();

  const entete = request.headers.get("authorization") ?? "";
  const [schema, encode] = entete.split(" ");
  if (schema === "Basic" && encode && memeValeur(Buffer.from(encode, "base64").toString(), attendu)) {
    return NextResponse.next();
  }

  return new NextResponse("Accès réservé : la boutique ouvre bientôt.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Golden Vape", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      // Ni le navigateur ni Vercel ne doivent garder cette réponse en cache.
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  // Tout, sauf l'optimiseur d'images et les fichiers image eux-mêmes.
  matcher: ["/((?!_next/image|.*\\.(?:png|jpe?g|webp|gif|svg|ico|avif)$).*)"],
};

/** Comparaison à temps constant : la durée de la réponse ne trahit pas le mot de passe. */
function memeValeur(recu: string, attendu: string): boolean {
  const a = Buffer.from(recu);
  const b = Buffer.from(attendu);
  return a.length === b.length && timingSafeEqual(a, b);
}
