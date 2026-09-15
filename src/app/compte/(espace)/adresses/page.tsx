import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-actions";
import PageTransition from "@/components/page-transition";
import AddressManager from "../../address-manager";

export default async function AccountAddressesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/compte/connexion?redirect=/compte/adresses");

  return (
    <PageTransition>
      <section>
        <AddressManager addresses={customer.addresses ?? []} />
      </section>
    </PageTransition>
  );
}
