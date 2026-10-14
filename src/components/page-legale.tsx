import type { ReactNode } from "react";
import Breadcrumbs from "@/components/breadcrumbs";

export type SectionLegale = { titre: string; contenu: ReactNode };

/**
 * Gabarit commun des pages légales : mentions, confidentialité, cookies — et bientôt CGV et
 * CGU. Une liste de sections titrées, rien d'autre.
 */
export default function PageLegale({
  titre,
  intro,
  miseAJour,
  sections,
}: {
  titre: string;
  intro?: ReactNode;
  miseAJour?: string;
  sections: SectionLegale[];
}) {
  return (
    <div className="gv-container pb-20">
      <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: titre }]} />

      <div className="max-w-3xl">
        <h1 className="font-display text-[32px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[40px]">
          {titre}
        </h1>
        {miseAJour && <p className="mt-2 text-[13px] text-gv-text-soft">Dernière mise à jour : {miseAJour}</p>}
        {intro && <div className="mt-6 space-y-2 text-[14.5px] leading-relaxed text-gv-text-soft">{intro}</div>}

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.titre} className="border-t border-gv-border pt-8">
              <h2 className="font-display text-[20px] font-normal text-gv-text">{section.titre}</h2>
              <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-gv-text-soft [&_a]:underline [&_a]:underline-offset-2 [&_ul.puces]:list-disc [&_ul.puces]:space-y-1.5 [&_ul.puces]:pl-5 [&_strong]:font-semibold [&_strong]:text-gv-text">
                {section.contenu}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
