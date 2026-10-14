import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import { SECTIONS_MENTIONS } from "@/lib/mentions-legales";

export const metadata: Metadata = {
  title: "Mentions légales | Golden Vape",
  description: "Éditeur, hébergeurs et informations légales du site Golden Vape.",
};

// Lisible sans répondre à la question de l'âge (voir `lib/age-gate`) : le portillon demande
// d'accepter ces mentions et les ouvre dans un nouvel onglet.
export default function MentionsLegalesPage() {
  return (
    <div className="gv-container pb-20">
      <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]} />

      <div className="max-w-3xl">
        <h1 className="mb-10 font-display text-[32px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[40px]">
          Mentions légales
        </h1>

        <div className="space-y-10">
          {SECTIONS_MENTIONS.map((section) => (
            <section key={section.titre} className="border-t border-gv-border pt-8">
              <h2 className="font-display text-[20px] font-normal text-gv-text">{section.titre}</h2>
              <div className="mt-4 space-y-2 text-[14.5px] leading-relaxed text-gv-text-soft">
                {section.contenu}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
