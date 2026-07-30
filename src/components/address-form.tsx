"use client";

import type { MedusaAddress } from "@/lib/medusa-cart";

const inputClass =
  "rounded-lg border border-brand-chocolate/15 px-4 py-2.5 text-sm text-brand-chocolate outline-none focus:border-brand-gold-dark";
const labelClass = "text-sm font-medium text-brand-chocolate";

export default function AddressForm({
  value,
  onChange,
  idPrefix,
}: {
  value: MedusaAddress;
  onChange: (next: MedusaAddress) => void;
  idPrefix: string;
}) {
  const setField = (field: keyof MedusaAddress) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [field]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-first_name`} className={labelClass}>
            Prénom
          </label>
          <input
            id={`${idPrefix}-first_name`}
            type="text"
            required
            value={value.first_name ?? ""}
            onChange={setField("first_name")}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-last_name`} className={labelClass}>
            Nom
          </label>
          <input
            id={`${idPrefix}-last_name`}
            type="text"
            required
            value={value.last_name ?? ""}
            onChange={setField("last_name")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-address_1`} className={labelClass}>
          Adresse
        </label>
        <input
          id={`${idPrefix}-address_1`}
          type="text"
          required
          value={value.address_1 ?? ""}
          onChange={setField("address_1")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-address_2`} className={labelClass}>
          Complément d&apos;adresse (optionnel)
        </label>
        <input
          id={`${idPrefix}-address_2`}
          type="text"
          value={value.address_2 ?? ""}
          onChange={setField("address_2")}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-postal_code`} className={labelClass}>
            Code postal
          </label>
          <input
            id={`${idPrefix}-postal_code`}
            type="text"
            required
            value={value.postal_code ?? ""}
            onChange={setField("postal_code")}
            className={inputClass}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>
            Ville
          </label>
          <input
            id={`${idPrefix}-city`}
            type="text"
            required
            value={value.city ?? ""}
            onChange={setField("city")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-phone`} className={labelClass}>
          Téléphone
        </label>
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          value={value.phone ?? ""}
          onChange={setField("phone")}
          className={inputClass}
        />
      </div>
    </div>
  );
}
