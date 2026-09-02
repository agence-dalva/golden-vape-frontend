import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRound, UserPlus, ShoppingBag } from "lucide-react";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import CheckoutStepper from "@/components/checkout-stepper";

// Écran de choix présenté juste après le panier. Un client déjà connecté n'a rien à
// décider : il passe directement au tunnel.
export default async function CheckoutIdentificationPage() {
  const [cart, customer] = await Promise.all([getCurrentCart(), getCurrentCustomer()]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  if (customer) {
    redirect("/checkout");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <CheckoutStepper current={2} />

      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Comment souhaitez-vous commander ?
      </h1>

      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
          <h2 className="mb-1 text-lg font-semibold text-brand-chocolate">
            Commander en tant que client
          </h2>
          <p className="mb-5 text-sm text-brand-chocolate/70">
            Votre adresse est préremplie à chaque commande, et vous retrouvez l&apos;historique
            de vos achats dans votre espace client.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/compte/connexion?redirect=/checkout"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-chocolate px-6 py-3 text-sm font-medium text-brand-cream transition-opacity hover:opacity-90"
            >
              <UserRound size={18} />
              J&apos;ai déjà un compte
            </Link>
            <Link
              href="/compte/inscription?redirect=/checkout"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-chocolate/20 px-6 py-3 text-sm font-medium text-brand-chocolate transition-colors hover:border-brand-gold-dark"
            >
              <UserPlus size={18} />
              Créer un compte
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-brand-chocolate/10 bg-white p-6">
          <h2 className="mb-1 text-lg font-semibold text-brand-chocolate">
            Commander en tant qu&apos;invité
          </h2>
          <p className="mb-5 text-sm text-brand-chocolate/70">
            Sans création de compte. Vous ne pourrez pas consulter cette commande en ligne
            par la suite.
          </p>
          <Link
            href="/checkout?invite=1"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-chocolate/20 px-6 py-3 text-sm font-medium text-brand-chocolate transition-colors hover:border-brand-gold-dark"
          >
            <ShoppingBag size={18} />
            Continuer sans compte
          </Link>
        </section>
      </div>
    </div>
  );
}
