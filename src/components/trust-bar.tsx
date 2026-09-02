import { Truck, ShieldCheck, Headset, BadgeCheck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Expédition 24/48h", detail: "Rapide et soignée" },
  { icon: ShieldCheck, title: "Paiement sécurisé", detail: "Transactions 100 % sécurisées" },
  { icon: Headset, title: "Conseils d'experts", detail: "À votre écoute" },
  { icon: BadgeCheck, title: "Produits authentiques", detail: "Marques officielles et certifiées" },
];

export default function TrustBar() {
  return (
    <section
      aria-label="Nos engagements"
      className="border-y border-gv-border bg-gv-card"
    >
      <ul className="gv-container grid grid-cols-2 gap-y-5 py-5 lg:grid-cols-4 lg:gap-0 lg:py-0">
        {ITEMS.map(({ icon: Icon, title, detail }, index) => (
          <li
            key={title}
            className={`flex items-center gap-3 px-2 lg:min-h-[76px] lg:px-6 ${
              index > 0 ? "lg:border-l lg:border-gv-border" : ""
            }`}
          >
            <Icon size={26} strokeWidth={1.5} aria-hidden className="shrink-0 text-gv-800" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gv-text">{title}</span>
              <span className="block text-xs text-gv-text-soft">{detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
