import { notFound } from "next/navigation";
import ProductCard from "@/components/product-card";
import { listBrands, listProductsByBrand } from "@/lib/medusa";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ value: string }>;
}) {
  const { value } = await params;
  const decodedValue = decodeURIComponent(value);

  const brands = await listBrands();
  const brand = brands.find((b) => b.value === decodedValue);

  if (!brand) {
    notFound();
  }

  const { products } = await listProductsByBrand(brand.value, brand.attribute_type_id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate mb-8">
        {brand.value}
      </h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-brand-chocolate/60">Aucun produit pour cette marque.</p>
      )}
    </div>
  );
}
