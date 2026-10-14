import { redirect } from "next/navigation";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { listShippingOptionsForCart } from "@/lib/medusa-checkout";
import { getOptionsRetrait } from "@/lib/retrait-boutique";
import CheckoutForm from "./checkout-form";
import PageTransition from "@/components/page-transition";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const [{ invite }, cart, customer] = await Promise.all([
    searchParams,
    getCurrentCart(),
    getCurrentCustomer(),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // Un visiteur doit d'abord choisir entre compte et commande invité. Un panier déjà
  // renseigné signale un tunnel repris en cours : on ne lui repose pas la question.
  const guestChosen = invite === "1" || Boolean(cart.shipping_address && cart.email);

  if (!customer && !guestChosen) {
    redirect("/checkout/identification");
  }

  const [shippingOptions, optionsRetrait] = await Promise.all([
    listShippingOptionsForCart(cart.id),
    getOptionsRetrait(),
  ]);
  // Une seule boutique : ses horaires valent pour toute option de retrait.
  const horairesRetrait = [...optionsRetrait.values()][0]?.horaires;

  return (
    <PageTransition>
    <div className="gv-container pb-20 pt-8">
      <CheckoutForm
        cart={cart}
        customer={customer}
        shippingOptions={shippingOptions}
        horairesRetrait={horairesRetrait}
      />
    </div>
    </PageTransition>
  );
}
