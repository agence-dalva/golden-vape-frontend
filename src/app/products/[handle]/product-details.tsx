import { MapPin, Droplets, FlaskConical } from "lucide-react";
import CollapsibleText from "@/components/collapsible-text";

export type Spec = { label: string; value: string };

export default function ProductDetails({
  title,
  description,
  specs,
  meta,
}: {
  title: string;
  description: string | null;
  specs: Spec[];
  /** Ligne compacte sous la description : origine, contenance, ratio. */
  meta: { origin: string | null; contenance: string | null; ratio: string | null };
}) {
  const metaItems = [
    meta.origin && { icon: MapPin, label: `Fabriqué en ${meta.origin}` },
    meta.contenance && { icon: Droplets, label: `Contenance ${meta.contenance}` },
    meta.ratio && { icon: FlaskConical, label: `PG/VG ${meta.ratio}` },
  ].filter((item): item is { icon: typeof MapPin; label: string } => Boolean(item));

  if (!description && specs.length === 0) {
    return null;
  }

  // Le filet séparateur et la colonne étroite n'ont de sens que si les deux blocs coexistent.
  const twoColumns = Boolean(description) && specs.length > 0;

  return (
    <div
      className={`mt-11 grid grid-cols-1 gap-9 rounded-xl border border-gv-border bg-white p-6 sm:p-8 lg:p-9 ${
        twoColumns ? "lg:grid-cols-[minmax(0,1.75fr)_minmax(300px,1fr)]" : ""
      }`}
    >
      {description && (
        <div>
          <p className="gv-eyebrow text-[11px]">La description</p>
          <h2 className="mb-3 mt-2 font-display text-[26px] font-normal leading-[1.2] text-gv-text sm:text-[32px]">
            {title}
          </h2>
          <CollapsibleText>{description}</CollapsibleText>

          {metaItems.length > 0 && (
            <ul className="mt-[22px] flex flex-wrap gap-x-6 gap-y-2">
              {metaItems.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[13px] text-gv-text-soft">
                  <Icon size={16} aria-hidden className="text-gv-800" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Seul, le tableau est bridé en largeur : étiré sur 1320px, la valeur se retrouverait
          à des centimètres de son libellé. */}
      {specs.length > 0 && (
        <div className={twoColumns ? "lg:border-l lg:border-gv-border lg:pl-9" : "max-w-2xl"}>
          <h2 className="mb-3.5 font-display text-2xl font-normal text-gv-text">Caractéristiques</h2>
          <dl>
            {specs.map((spec, index) => (
              <div
                key={spec.label}
                className={`flex items-baseline justify-between gap-4 py-2.5 ${
                  index < specs.length - 1 ? "border-b border-gv-border" : ""
                }`}
              >
                <dt className="text-[13px] text-gv-text-soft">{spec.label}</dt>
                <dd className="text-right text-[13px] font-semibold text-gv-text">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
