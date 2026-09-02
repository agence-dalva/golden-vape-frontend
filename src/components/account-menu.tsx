"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { logoutAction } from "@/lib/customer-actions";
import type { MedusaCustomer } from "@/lib/medusa-customer";

export default function AccountMenu({ customer }: { customer: MedusaCustomer | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

  const handleLogout = async () => {
    setOpen(false);
    await logoutAction();
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Mon compte"
        aria-expanded={open}
        className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center justify-center gap-1 text-gv-text transition-[color,transform] duration-200 hover:-translate-y-px hover:text-gv-800"
      >
        <UserRound size={24} strokeWidth={1.6} aria-hidden />
        <span className="hidden text-xs sm:block">Compte</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 min-w-48 rounded-[10px] border border-gv-border bg-white py-2 shadow-gv-sm">
          <p className="truncate px-4 py-2 text-sm text-gv-text-soft">
            {customer.first_name ? `Bonjour ${customer.first_name}` : customer.email}
          </p>
          <Link
            href="/compte"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gv-text hover:bg-gv-soft"
          >
            Mon compte
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gv-text hover:bg-gv-soft"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
