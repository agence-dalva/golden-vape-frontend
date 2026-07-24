import Link from "next/link";
import Image from "next/image";
import type { MedusaBrand } from "@/lib/medusa";

export default function BrandMenu({ brands }: { brands: MedusaBrand[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {brands.map((brand) => (
        <Link
          key={brand.value}
          href={`/marques/${encodeURIComponent(brand.value)}`}
          className="flex aspect-square items-center justify-center rounded-lg border border-brand-chocolate/10 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <Image
            src={brand.image_url}
            alt={brand.value}
            width={120}
            height={120}
            className="h-full w-full object-contain"
          />
        </Link>
      ))}
    </div>
  );
}
