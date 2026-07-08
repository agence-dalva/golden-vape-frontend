"use client";

import { useState } from "react";
import type { MedusaProduct } from "@/lib/medusa";
import ProductGallery from "./product-gallery";
import VariantPicker from "./variant-picker";

export default function ProductPurchasePanel({
  product,
  cartVariantIds,
}: {
  product: MedusaProduct;
  cartVariantIds: string[];
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const selectedImageUrl = selectedVariant?.images[0]?.url ?? null;

  return (
    <>
      <ProductGallery product={product} selectedImageUrl={selectedImageUrl} />

      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-chocolate">
          {product.title}
        </h1>

        <VariantPicker
          product={product}
          cartVariantIds={cartVariantIds}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
        />
      </div>
    </>
  );
}
