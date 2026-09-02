import { redirect } from "next/navigation";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { listShippingOptionsForCart } from "@/lib/medusa-checkout";
import CheckoutStepper from "@/components/checkout-stepper";
import CheckoutForm from "./checkout-form";

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

  const shippingOptions = await listShippingOptionsForCart(cart.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <CheckoutStepper current={2} />

      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Commander
      </h1>

      <CheckoutForm cart={cart} customer={customer} shippingOptions={shippingOptions} />
    </div>
  );
}
