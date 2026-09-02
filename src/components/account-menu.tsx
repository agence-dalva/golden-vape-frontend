"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { logoutAction } from "@/lib/customer-actions";
import type { MedusaCustomer } from "@/lib/medusa-customer";
import { useHoverMenu, menuPanelClasses } from "@/lib/use-hover-menu";

export default function AccountMenu({ customer }: { customer: MedusaCustomer | null }) {
  const router = useRouter();
  const { open, closeNow, toggle, hoverProps } = useHoverMenu();

  const handleLogout = async () => {
    closeNow();
    await logoutAction();
    router.refresh();
  };

  if (!customer) {
    return (
      <Link
        href="/compte/connexion"
        className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center justify-center gap-1 text-gv-text transition-[color,transform] duration-200 hover:-translate-y-px hover:text-gv-800"
      >
        <UserRound size={24} strokeWidth={1.6} aria-hidden />
        <span className="hidden text-xs sm:block">Compte</span>
        <span className="sr-only">Connexion</span>
      </Link>
    );
  }

  return (
    <div className="relative" {...hoverProps}>
      {/* Le clic reste actif : sur écran tactile il n'y a pas de survol. */}
      <button
        onClick={toggle}
        aria-label="Mon compte"
        aria-expanded={open}
        className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center justify-center gap-1 text-gv-text transition-[color,transform] duration-200 hover:-translate-y-px hover:text-gv-800"
      >
        <UserRound size={24} strokeWidth={1.6} aria-hidden />
        <span className="hidden text-xs sm:block">Compte</span>
      </button>

      <div className={`absolute right-0 top-full z-40 min-w-48 pt-1.5 ${menuPanelClasses(open)}`}>
        <div className="rounded-[10px] border border-gv-border bg-white py-2 shadow-gv-sm">
          <p className="truncate px-4 py-2 text-sm text-gv-text-soft">
            {customer.first_name ? `Bonjour ${customer.first_name}` : customer.email}
          </p>
          <Link
            href="/compte"
            onClick={closeNow}
            className="block px-4 py-2 text-sm text-gv-text transition-colors duration-150 hover:bg-gv-soft"
          >
            Mon compte
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gv-text transition-colors duration-150 hover:bg-gv-soft"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
