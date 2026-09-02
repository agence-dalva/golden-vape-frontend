"use client";

import { useState, useTransition } from "react";
import { Home, Plus, Trash2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import type { MedusaCustomerAddress } from "@/lib/medusa-customer";
import type { MedusaAddress } from "@/lib/medusa-cart";
import AddressForm from "@/components/address-form";
import {
  saveAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/customer-actions";

const EMPTY: MedusaAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  postal_code: "",
  city: "",
  phone: "",
  country_code: "fr",
};

export default function AddressManager({ addresses }: { addresses: MedusaCustomerAddress[] }) {
  const [editing, setEditing] = useState<MedusaCustomerAddress | "new" | null>(null);
  const [draft, setDraft] = useState<MedusaAddress>(EMPTY);
  const [isPending, startTransition] = useTransition();

  const openNew = () => {
    setDraft(EMPTY);
    setEditing("new");
  };

  const openEdit = (address: MedusaCustomerAddress) => {
    setDraft({
      first_name: address.first_name ?? "",
      last_name: address.last_name ?? "",
      address_1: address.address_1 ?? "",
      address_2: address.address_2 ?? "",
      postal_code: address.postal_code ?? "",
      city: address.city ?? "",
      phone: address.phone ?? "",
      country_code: address.country_code ?? "fr",
    });
    setEditing(address);
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const isFirst = addresses.length === 0;
      const result = await saveAddressAction(
        // La première adresse enregistrée devient celle par défaut : sans quoi le tunnel
        // n'aurait rien à préremplir.
        isFirst ? { ...draft, is_default_shipping: true, is_default_billing: true } : draft,
        editing !== "new" && editing ? editing.id : undefined
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setEditing(null);
    });
  };

  const remove = (address: MedusaCustomerAddress) => {
    const label = [address.address_1, address.city].filter(Boolean).join(", ");
    if (!window.confirm(`Supprimer l'adresse « ${label} » ?`)) return;

    startTransition(async () => {
      const result = await deleteAddressAction(address.id);
      if (result.error) toast.error(result.error);
    });
  };

  const setDefault = (address: MedusaCustomerAddress) => {
    startTransition(async () => {
      const result = await setDefaultAddressAction(address.id);
      if (result.error) toast.error(result.error);
    });
  };

  const dashedCard =
    "flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gv-border-strong p-5 text-sm font-medium text-gv-text-soft transition-colors hover:border-gv-800 hover:bg-gv-50 hover:text-gv-800";

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-medium text-gv-text sm:text-[28px]">
          Mes adresses
        </h2>
        <button
          onClick={openNew}
          className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[7px] border border-gv-border-strong bg-white px-4 text-sm font-medium text-gv-text transition-colors hover:border-gv-800 hover:text-gv-800"
        >
          <Plus size={18} aria-hidden />
          Ajouter une adresse
        </button>
      </div>

      {editing && (
        <form
          onSubmit={save}
          className="mb-6 rounded-xl border border-gv-border bg-gv-card p-5 shadow-gv-xs sm:p-6"
        >
          <h3 className="mb-4 text-sm font-semibold text-gv-text">
            {editing === "new" ? "Nouvelle adresse" : "Modifier l'adresse"}
          </h3>
          <AddressForm value={draft} onChange={setDraft} idPrefix="account-address" />
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[46px] cursor-pointer rounded-[7px] border border-gv-800 bg-gv-800 px-[22px] text-sm font-semibold text-white transition-colors hover:bg-gv-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer text-sm text-gv-text-soft hover:underline"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {addresses.map((address) => (
          <article
            key={address.id}
            className="flex min-h-[150px] gap-4 rounded-xl border border-gv-border bg-gv-card p-5"
          >
            <span
              aria-hidden
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-gv-50 text-gv-800"
            >
              <Home size={20} strokeWidth={1.6} />
            </span>

            <div className="min-w-0 flex-1">
              {address.is_default_shipping && (
                <span className="mb-2 inline-block rounded-[5px] bg-gv-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gv-800">
                  Adresse par défaut
                </span>
              )}

              <address className="not-italic text-sm leading-relaxed text-gv-text-soft">
                <span className="block font-semibold text-gv-text">
                  {address.first_name} {address.last_name}
                </span>
                <span className="block">{address.address_1}</span>
                {address.address_2 && <span className="block">{address.address_2}</span>}
                <span className="block">
                  {address.postal_code} {address.city}
                </span>
              </address>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                <button
                  onClick={() => openEdit(address)}
                  className="flex min-h-9 cursor-pointer items-center gap-1.5 font-medium text-gv-800 hover:underline"
                >
                  <Pencil size={14} aria-hidden />
                  Modifier
                </button>
                {!address.is_default_shipping && (
                  <button
                    onClick={() => setDefault(address)}
                    disabled={isPending}
                    className="flex min-h-9 cursor-pointer items-center gap-1.5 text-gv-text-soft hover:text-gv-800 disabled:cursor-not-allowed"
                  >
                    <Star size={14} aria-hidden />
                    Par défaut
                  </button>
                )}
                <button
                  onClick={() => remove(address)}
                  disabled={isPending}
                  className="flex min-h-9 cursor-pointer items-center gap-1.5 text-gv-text-soft hover:text-[var(--gv-danger)] disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} aria-hidden />
                  Supprimer
                  <span className="sr-only"> l&apos;adresse {address.address_1}</span>
                </button>
              </div>
            </div>
          </article>
        ))}

        {!editing && (
          <button onClick={openNew} className={dashedCard}>
            <Plus size={34} strokeWidth={1.4} aria-hidden />
            Ajouter une adresse
          </button>
        )}
      </div>
    </>
  );
}
