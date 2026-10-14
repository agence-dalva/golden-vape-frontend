import type { Metadata } from "next";
import PageLegale from "@/components/page-legale";
import { SECTIONS_MENTIONS } from "@/lib/mentions-legales";

export const metadata: Metadata = {
  title: "Mentions légales | Golden Vape",
  description: "Éditeur, hébergeurs et informations légales du site Golden Vape.",
};

// Lisible sans répondre à la question de l'âge (voir `lib/age-gate`) : le portillon demande
// d'accepter ces mentions et les ouvre dans un nouvel onglet.
export default function MentionsLegalesPage() {
  return <PageLegale titre="Mentions légales" sections={SECTIONS_MENTIONS} />;
}
