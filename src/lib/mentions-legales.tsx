import type { ReactNode } from "react";

/*
  Texte des mentions légales, affiché par la page `/mentions-legales` — celle vers laquelle
  le portillon d'âge renvoie avant d'accepter. Les CGV et CGU suivront la même forme.

  Les champs entre crochets sont à fournir par le marchand avant la mise en ligne.
*/

export type SectionLegale = { titre: string; contenu: ReactNode };

type Hebergeur = { role: string; nom: string; adresse: string; site: string; detail?: string };

const HEBERGEURS: Hebergeur[] = [
  {
    role: "Site (interface)",
    nom: "Vercel Inc.",
    adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    site: "https://vercel.com",
  },
  {
    role: "Serveur, base de données et traitement des commandes",
    nom: "Railway Corporation",
    adresse: "548 Market St PMB 68956, San Francisco, CA 94104, États-Unis",
    site: "https://railway.com",
    detail: "Serveurs situés dans l'Union européenne.",
  },
  {
    role: "Stockage des images et des sauvegardes",
    nom: "Cloudflare, Inc.",
    adresse: "101 Townsend Street, San Francisco, CA 94107, États-Unis — +1 888 993 5273",
    site: "https://www.cloudflare.com",
  },
];

export const SECTIONS_MENTIONS: SectionLegale[] = [
  {
    titre: "Éditeur du site",
    contenu: (
      <>
        <p>[Raison sociale] — [forme juridique] au capital de [montant] €</p>
        <p>Siège social : [adresse]</p>
        <p>RCS : [ville et numéro] — SIRET : [numéro]</p>
        <p>TVA intracommunautaire : [numéro]</p>
        <p>Contact : [email] — [téléphone]</p>
        <p>Directeur de la publication : [nom et prénom]</p>
      </>
    ),
  },
  {
    titre: "Hébergement",
    contenu: (
      <>
        <p>Le site est hébergé par plusieurs prestataires :</p>
        <ul className="mt-3 space-y-4">
          {HEBERGEURS.map((h) => (
            <li key={h.nom}>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] opacity-80">{h.role}</p>
              <p className="mt-0.5 font-semibold">{h.nom}</p>
              <p>{h.adresse}</p>
              {h.detail && <p>{h.detail}</p>}
              <a href={h.site} target="_blank" rel="noopener" className="underline underline-offset-2">
                {h.site.replace("https://", "")}
              </a>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    titre: "Vente aux mineurs",
    contenu: (
      <p>
        La vente de produits du vapotage est interdite aux mineurs de moins de 18 ans. L&apos;accès à
        la boutique est réservé aux personnes majeures.
      </p>
    ),
  },
];
