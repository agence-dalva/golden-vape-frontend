import type { Metadata } from "next";
import Link from "next/link";
import PageLegale, { type SectionLegale } from "@/components/page-legale";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Golden Vape",
  description: "Quelles données Golden Vape collecte, pourquoi, avec qui elles sont partagées et comment exercer vos droits.",
};

/*
  Rédigée d'après ce que le site fait réellement (14/10/2026) : données des comptes et des
  commandes, prestataires effectivement branchés, durées tenues. À relire si un prestataire
  change.
*/

const SECTIONS: SectionLegale[] = [
  {
    titre: "Qui est responsable de vos données",
    contenu: (
      <>
        <p>
          Golden Vape — SARL, 18 Av. de la République, 70200 Lure — est responsable des
          données collectées sur ce site. Pour toute question : <a href="mailto:goldenvap.lure@gmail.com">goldenvap.lure@gmail.com</a>.
        </p>
      </>
    ),
  },
  {
    titre: "Les données que nous collectons",
    contenu: (
      <ul className="puces">
        <li>
          <strong>Votre commande</strong> : nom, prénom, email, téléphone, adresses de livraison et
          de facturation, point relais choisi, articles et montants.
        </li>
        <li>
          <strong>Votre compte</strong>, si vous en créez un : email, mot de passe (stocké chiffré,
          jamais lisible), adresses enregistrées, historique de commandes.
        </li>
        <li>
          <strong>Les alertes « retour en stock »</strong> : l&apos;email que vous laissez et le
          produit concerné.
        </li>
        <li>
          <strong>La mesure d&apos;audience</strong>, seulement si vous l&apos;acceptez : pages
          consultées et parcours sur le site, via Google Analytics (voir la{" "}
          <Link href="/cookies">politique de cookies</Link>).
        </li>
      </ul>
    ),
  },
  {
    titre: "Votre carte bancaire",
    contenu: (
      <p>
        Le paiement se fait sur la page sécurisée de Monetico (Crédit Mutuel). Vos coordonnées
        bancaires y sont saisies directement : <strong>elles ne transitent jamais par notre site</strong>{" "}
        et nous ne les conservons pas. Nous recevons seulement le résultat du paiement et sa
        référence.
      </p>
    ),
  },
  {
    titre: "Pourquoi nous les utilisons",
    contenu: (
      <ul className="puces">
        <li>
          Traiter et livrer vos commandes, gérer votre compte, vous envoyer les emails liés à vos
          commandes et vos alertes — c&apos;est l&apos;<strong>exécution du contrat</strong> qui nous lie.
        </li>
        <li>
          Tenir notre comptabilité et répondre aux obligations légales, dont l&apos;interdiction de
          vente aux mineurs — c&apos;est une <strong>obligation légale</strong>.
        </li>
        <li>
          Sécuriser le site et sauvegarder ses données — c&apos;est notre <strong>intérêt légitime</strong>.
        </li>
        <li>
          Mesurer l&apos;audience du site — uniquement avec votre <strong>consentement</strong>, que vous
          pouvez retirer à tout moment.
        </li>
      </ul>
    ),
  },
  {
    titre: "Avec qui elles sont partagées",
    contenu: (
      <>
        <p>Nous ne vendons ni ne louons vos données. Elles sont confiées aux seuls prestataires dont le site a besoin :</p>
        <ul className="puces">
          <li><strong>Vercel</strong> (États-Unis) : hébergement de l&apos;interface du site.</li>
          <li><strong>Railway</strong> (États-Unis, serveurs dans l&apos;Union européenne) : serveur et base de données.</li>
          <li><strong>Cloudflare</strong> (États-Unis) : stockage des images et des sauvegardes.</li>
          <li><strong>Monetico — Crédit Mutuel</strong> (France) : paiement.</li>
          <li>
            <strong>Sendcloud</strong> (Pays-Bas) et les transporteurs <strong>Colissimo</strong> et{" "}
            <strong>Chronopost</strong> : nom, adresse, téléphone et email, pour livrer et vous tenir informé du suivi.
          </li>
          <li><strong>Resend</strong> (États-Unis) : envoi des emails de commande et d&apos;alerte.</li>
          <li><strong>Hiboutik</strong> (France) : notre caisse, qui reçoit le contenu des ventes, sans votre identité.</li>
          <li><strong>Google</strong> (États-Unis) : mesure d&apos;audience, seulement avec votre accord.</li>
        </ul>
      </>
    ),
  },
  {
    titre: "Transferts hors de l'Union européenne",
    contenu: (
      <p>
        Certains prestataires sont des sociétés américaines. Ces transferts sont encadrés par le
        cadre de protection des données UE–États-Unis (« Data Privacy Framework ») ou par les
        clauses contractuelles types de la Commission européenne, prévues dans leurs contrats de
        traitement des données.
      </p>
    ),
  },
  {
    titre: "Combien de temps nous les gardons",
    contenu: (
      <ul className="puces">
        <li><strong>Commandes et factures</strong> : 10 ans, durée imposée par la loi pour les documents comptables.</li>
        <li><strong>Compte client</strong> : tant qu&apos;il existe ; vous pouvez en demander la suppression à tout moment.</li>
        <li><strong>Sauvegardes</strong> : 30 jours, puis remplacées par les suivantes.</li>
        <li><strong>Mesure d&apos;audience</strong> : 13 mois au plus.</li>
      </ul>
    ),
  },
  {
    titre: "Vos droits",
    contenu: (
      <>
        <p>
          Vous pouvez accéder à vos données, les faire corriger ou supprimer, vous opposer à leur
          utilisation, en limiter l&apos;usage ou les récupérer dans un format lisible. Écrivez-nous à{" "}
          <a href="mailto:goldenvap.lure@gmail.com">goldenvap.lure@gmail.com</a> : nous répondons sous
          un mois.
        </p>
        <p>
          Votre accord à la mesure d&apos;audience se retire à tout moment avec le lien « Gérer les
          cookies », en bas de chaque page.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL :{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>.
        </p>
      </>
    ),
  },
  {
    titre: "Mineurs",
    contenu: <p>La boutique est réservée aux personnes majeures : nous ne collectons pas sciemment de données de mineurs.</p>,
  },
];

export default function ConfidentialitePage() {
  return <PageLegale titre="Politique de confidentialité" miseAJour="14 octobre 2026" sections={SECTIONS} />;
}
