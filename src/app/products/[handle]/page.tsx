import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/medusa";
import { getCurrentCart } from "@/lib/cart-actions";
import ProductPurchasePanel from "./product-purchase-panel";
import ProductAttributesTable from "@/components/product-attributes-table";
import ProductDescription from "@/components/product-description";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [product, cart] = await Promise.all([getProductByHandle(handle), getCurrentCart()]);

  if (!product) {
    notFound();
  }

  const cartVariantIds = cart?.items.map((item) => item.variant_id) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <ProductPurchasePanel product={product} cartVariantIds={cartVariantIds} />
      </div>

      {product.description && (
        <div className="mt-10">
          <ProductDescription description={product.description} />
        </div>
      )}

      <ProductAttributesTable product={product} />
    </div>
  );
}
