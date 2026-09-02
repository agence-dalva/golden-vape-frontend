import { notFound } from "next/navigation";
import {
  getProductByHandle,
  listProductAttributes,
  listProductsByCategory,
  groupAttributesByType,
} from "@/lib/medusa";
import { getCurrentCart } from "@/lib/cart-actions";
import SectionHeading from "@/components/section-heading";
import ProductSlider from "@/components/product-slider";
import Breadcrumbs, { type Crumb } from "@/components/breadcrumbs";
import ProductGallery from "./product-gallery";
import PurchasePanel from "./purchase-panel";
import ProductDetails, { type Spec } from "./product-details";

// Caractéristiques déjà exposées ailleurs sur la fiche : les répéter dans le tableau ferait
// doublon avec la marque du panneau d'achat et le sélecteur de déclinaison.
const SPECS_SHOWN_ELSEWHERE = ["taux de nicotine"];

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

  const attributes = await listProductAttributes(product.id).catch(() => []);
  const groups = groupAttributesByType(attributes);
  const valueOf = (typeName: string) =>
    groups.find((group) => group.typeName.toLowerCase() === typeName)?.values.join(", ") ?? null;

  const brand = valueOf("marque");
  const origin = valueOf("origine");
  const contenance = valueOf("contenance");
  const ratio = valueOf("dosage pg/vg") ?? valueOf("pg/vg");
  const flavour = valueOf("saveur");

  // La liste renvoyée contient la catégorie feuille et ses parents : la feuille est la plus
  // parlante, pour le fil d'Ariane comme pour les suggestions.
  const categories = product.categories ?? [];
  const category = categories.find((item) => item.parent_category) ?? categories[0] ?? null;

  const related = category
    ? await listProductsByCategory(category.id, 13, 0)
        .then(({ products }) => products.filter((item) => item.id !== product.id).slice(0, 12))
        .catch(() => [])
    : [];

  const trail: Crumb[] = [
    { label: "Accueil", href: "/" },
    ...(category?.parent_category
      ? [
          {
            label: category.parent_category.name,
            href: `/categories/${category.parent_category.handle}`,
          },
        ]
      : []),
    ...(category ? [{ label: category.name, href: `/categories/${category.handle}` }] : []),
    { label: product.title },
  ];

  const specs: Spec[] = [
    ...(category ? [{ label: "Catégorie", value: category.name }] : []),
    ...groups
      .filter((group) => !SPECS_SHOWN_ELSEWHERE.includes(group.typeName.toLowerCase()))
      .map((group) => ({ label: group.typeName, value: group.values.join(" · ") })),
  ];

  // L'accroche reprend les attributs existants ; à défaut elle disparaît, plutôt que
  // d'inventer une promesse commerciale.
  const tagline = [flavour, contenance].filter(Boolean).join(" · ") || null;

  const cartVariantIds = cart?.items.map((item) => item.variant_id) ?? [];

  return (
    <div className="gv-container pb-16">
      <Breadcrumbs trail={trail} />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)] lg:gap-[60px]">
        <ProductGallery product={product} origin={origin} />
        <PurchasePanel
          product={product}
          brand={brand}
          tagline={tagline}
          contenance={contenance}
          cartVariantIds={cartVariantIds}
        />
      </div>

      <ProductDetails
        title={product.title}
        description={product.description}
        specs={specs}
        meta={{ origin, contenance, ratio }}
      />

      {related.length > 0 && (
        <section className="mt-16 lg:mt-20">
          <SectionHeading
            title="Vous aimerez aussi"
            link={
              category
                ? { label: `Tout ${category.name.toLowerCase()}`, href: `/categories/${category.handle}` }
                : undefined
            }
          />
          <ProductSlider products={related} label="Produits similaires" />
        </section>
      )}
    </div>
  );
}
