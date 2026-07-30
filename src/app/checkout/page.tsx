import { redirect } from "next/navigation";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { listShippingOptionsForCart } from "@/lib/medusa-checkout";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const cart = await getCurrentCart();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const [customer, shippingOptions] = await Promise.all([
    getCurrentCustomer(),
    listShippingOptionsForCart(cart.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Commander
      </h1>
      <CheckoutForm cart={cart} customer={customer} shippingOptions={shippingOptions} />
    </div>
  );
}
