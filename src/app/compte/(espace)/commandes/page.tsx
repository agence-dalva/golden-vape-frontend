import { Package } from "lucide-react";
import { getMyOrders } from "@/lib/customer-actions";
import EmptyState from "@/components/empty-state";
import PageTransition from "@/components/page-transition";
import OrderRow from "../../order-row";

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();

  return (
    <PageTransition>
      <section>
        <h2 className="mb-[18px] font-display text-2xl font-normal text-gv-text sm:text-[28px]">
          Mes commandes
        </h2>

        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune commande pour le moment"
            description="Vos prochaines commandes apparaîtront ici."
            primary={{ label: "Découvrir la boutique", href: "/categories" }}
            secondary={{ label: "Voir les nouveautés", href: "/" }}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderRow order={order} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageTransition>
  );
}
