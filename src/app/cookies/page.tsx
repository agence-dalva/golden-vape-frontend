import type { Metadata } from "next";
import Link from "next/link";
import PageLegale, { type SectionLegale } from "@/components/page-legale";
import GererCookies from "@/components/gerer-cookies";
import { GA_ID } from "@/lib/consentement";

export const metadata: Metadata = {
  title: "Politique de cookies | Golden Vape",
  description: "Les cookies et données stockées par le site Golden Vape, leur durée et comment gérer votre choix.",
};

/*
  Inventaire tiré du code (14/10/2026) : `cart_id` et `customer_token` (lib/cart-actions,
  lib/customer-actions), `gv-age-confirmed` (lib/age-gate), `gv-consentement`
  (lib/consentement), et Google Analytics s'il est configuré. À tenir à jour si l'un d'eux
  change.
*/

type Ligne = { nom: string; role: string; duree: string };

const NECESSAIRES: Ligne[] = [
  { nom: "cart_id", role: "Garde votre panier d'une page à l'autre.", duree: "30 jours" },
  { nom: "customer_token", role: "Vous garde connecté à votre compte.", duree: "30 jours" },
  {
    nom: "gv-age-confirmed",
    role: "Se souvient que vous avez confirmé avoir 18 ans (stockage du navigateur).",
    duree: "Jusqu'à effacement",
  },
  {
    nom: "gv-consentement",
    role: "Se souvient de votre choix sur la mesure d'audience (stockage du navigateur).",
    duree: "13 mois (accord) ou 6 mois (refus)",
  },
];

const AUDIENCE: Ligne[] = [
  { nom: "_ga", role: "Google Analytics : distingue les visiteurs, de façon anonyme.", duree: "13 mois" },
  { nom: "_ga_<identifiant>", role: "Google Analytics : suit la visite en cours.", duree: "13 mois" },
];

function Tableau({ lignes }: { lignes: Ligne[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-gv-border text-gv-text">
            <th className="py-2 pr-4 font-semibold">Nom</th>
            <th className="py-2 pr-4 font-semibold">Rôle</th>
            <th className="py-2 font-semibold">Durée</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.nom} className="border-b border-gv-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-[12.5px] text-gv-text">{l.nom}</td>
              <td className="py-2 pr-4">{l.role}</td>
              <td className="py-2 whitespace-nowrap">{l.duree}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: SectionLegale[] = [
  {
    titre: "Les cookies nécessaires",
    contenu: (
      <>
        <p>
          Ils font fonctionner le site — panier, compte, vérification de l&apos;âge — et ne servent à
          rien d&apos;autre. Ils sont exemptés de consentement et ne peuvent pas être refusés sans
          empêcher le site de marcher.
        </p>
        <Tableau lignes={NECESSAIRES} />
      </>
    ),
  },
  {
    titre: "La mesure d'audience",
    contenu: (
      <>
        <p>
          Avec votre accord seulement, nous utilisons Google Analytics pour savoir quelles pages sont
          consultées et améliorer le site. Tant que vous n&apos;avez pas cliqué sur « Accepter »,
          aucun de ces cookies n&apos;est déposé et rien n&apos;est envoyé à Google.
        </p>
        <Tableau lignes={AUDIENCE} />
      </>
    ),
  },
  {
    titre: "Le paiement",
    contenu: (
      <p>
        La page de paiement est celle de Monetico (Crédit Mutuel), sur son propre site : les cookies
        qu&apos;elle utilise relèvent de sa politique, pas de la nôtre.
      </p>
    ),
  },
  {
    titre: "Gérer votre choix",
    contenu: (
      <>
        <p>
          Vous pouvez changer d&apos;avis à tout moment
          {GA_ID ? (
            <>
              {" "}: <GererCookies className="font-semibold text-gv-text underline underline-offset-2" />.
            </>
          ) : (
            " avec le lien « Gérer les cookies », en bas de chaque page."
          )}{" "}
          Un refus après un accord efface les cookies de mesure déjà déposés.
        </p>
        <p>
          Vous pouvez aussi bloquer ou supprimer les cookies dans les réglages de votre navigateur ;
          le panier et la connexion ne fonctionneront alors plus. Pour en savoir plus sur vos données,
          voir la <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </>
    ),
  },
];

export default function CookiesPage() {
  return <PageLegale titre="Politique de cookies" miseAJour="14 octobre 2026" sections={SECTIONS} />;
}
