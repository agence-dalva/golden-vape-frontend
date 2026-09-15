import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-actions";
import Breadcrumbs from "@/components/breadcrumbs";
import AccountSidebar from "../account-sidebar";
import LogoutButton from "../logout-button";

/** Initiales dérivées du profil, sans photo inventée. */
function initialsOf(first: string | null, last: string | null, email: string): string {
  const letters = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.trim();
  return (letters || email[0] || "?").toUpperCase();
}

/**
 * Gabarit de l'espace client : en-tête et panneau de navigation, communs à toutes les
 * rubriques. Le contenu de droite est la page — c'est elle qui porte la transition, un
 * layout persistant d'une navigation à l'autre ne pouvant pas l'animer.
 *
 * Les pages de connexion et d'inscription vivent hors de ce groupe : pas de panneau tant
 * qu'on n'est pas entré.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/compte/connexion?redirect=/compte");
  }

  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();

  return (
    <div className="gv-container pb-16">
      <Breadcrumbs trail={[{ label: "Accueil", href: "/" }, { label: "Mon compte" }]} />

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[36px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text lg:text-[44px]">
            Mon compte
          </h1>
          <p className="mt-2 text-sm text-gv-text-soft">
            {customer.first_name
              ? `Bonjour ${customer.first_name}, ravi de vous revoir.`
              : "Bonjour, ravi de vous revoir."}
          </p>
        </div>

        <LogoutButton />
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
        <div className="lg:sticky lg:top-6">
          <AccountSidebar
            fullName={fullName || customer.email}
            initials={initialsOf(customer.first_name, customer.last_name, customer.email)}
          />
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
