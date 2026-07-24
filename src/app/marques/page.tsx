import BrandMenu from "@/components/brand-menu";
import { listBrands } from "@/lib/medusa";

export default async function BrandsPage() {
  const brands = await listBrands();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate mb-8">
        Nos marques
      </h1>

      {brands.length > 0 ? (
        <BrandMenu brands={brands} />
      ) : (
        <p className="text-sm text-brand-chocolate/60">Aucune marque disponible pour le moment.</p>
      )}
    </div>
  );
}
