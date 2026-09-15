import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-actions";
import PageTransition from "@/components/page-transition";

export default async function AccountProfilePage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/compte/connexion?redirect=/compte/informations");

  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();

  const lignes: { libelle: string; valeur: string }[] = [
    { libelle: "Nom", valeur: fullName || "—" },
    { libelle: "Email", valeur: customer.email },
    { libelle: "Téléphone", valeur: customer.phone || "—" },
  ];

  return (
    <PageTransition>
      <section>
        <h2 className="mb-[18px] font-display text-2xl font-normal text-gv-text sm:text-[28px]">
          Mes informations
        </h2>
        <dl className="max-w-xl rounded-xl border border-gv-border bg-gv-card p-5 sm:p-6">
          {lignes.map(({ libelle, valeur }, index) => (
            <div
              key={libelle}
              className={`flex items-baseline justify-between gap-4 py-2.5 ${
                index < lignes.length - 1 ? "border-b border-gv-border" : ""
              }`}
            >
              <dt className="text-[13px] text-gv-text-soft">{libelle}</dt>
              <dd className="min-w-0 truncate text-[13px] font-semibold text-gv-text">{valeur}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageTransition>
  );
}
