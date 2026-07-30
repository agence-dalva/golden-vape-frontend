"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { logoutAction } from "@/lib/customer-actions";
import type { MedusaCustomer } from "@/lib/medusa-customer";

export default function AccountMenu({ customer }: { customer: MedusaCustomer | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!customer) {
    return (
      <Link
        href="/compte/connexion"
        className="flex cursor-pointer items-center justify-center p-2 text-brand-chocolate"
        aria-label="Connexion"
      >
        <User size={22} />
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
        className="flex cursor-pointer items-center justify-center p-2 text-brand-chocolate"
      >
        <User size={22} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 min-w-48 rounded-lg border border-brand-chocolate/10 bg-white py-2 shadow-lg">
          <p className="truncate px-4 py-2 text-sm text-brand-chocolate/60">
            {customer.first_name ? `Bonjour ${customer.first_name}` : customer.email}
          </p>
          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-brand-chocolate hover:bg-brand-cream"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
