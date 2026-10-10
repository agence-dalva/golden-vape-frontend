import { notFound } from "next/navigation";
import {
  getProductByHandle,
  listBrands,
  listProductAttributes,
  listProductsByCategory,
  groupAttributesByType,
} from "@/lib/medusa";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import SectionHeading from "@/components/section-heading";
import ProductSlider from "@/components/product-slider";
import Breadcrumbs, { type Crumb } from "@/components/breadcrumbs";
import ProductGallery from "./product-gallery";
import { VariantSelection } from "./variant-selection";
import PurchasePanel from "./purchase-panel";
import ProductDetails, { type BrandLink, type Spec } from "./product-details";

// Caractéristiques déjà exposées ailleurs sur la fiche : les répéter dans le tableau ferait
// doublon avec le sélecteur de déclinaison. La marque, elle, y reste : c'est un lien vers sa
// page, et on la cherche autant sous le titre que dans le tableau.
const SPECS_SHOWN_ELSEWHERE = ["taux de nicotine"];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  // Le client connecté n'a pas à saisir son email pour une alerte de retour en stock. Sans
  // session, aucun appel n'est fait.
  const [product, cart, customer] = await Promise.all([
    getProductByHandle(handle),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);

  if (!product) {
    notFound();
  }

  // La liste des marques donne le logo, et dit lesquelles ont une page : un nom qu'elle ne
  // connaît pas reste du texte plutôt que de mener à une 404.
  const [attributes, knownBrands] = await Promise.all([
    listProductAttributes(product.id).catch(() => []),
    listBrands().catch(() => []),
  ]);
  const groups = groupAttributesByType(attributes);
  const valuesOf = (typeName: string) =>
    groups.find((group) => group.typeName.toLowerCase() === typeName)?.values ?? [];
  const valueOf = (typeName: string) => valuesOf(typeName).join(", ") || null;

  const brands: BrandLink[] = valuesOf("marque").map((value) => {
    const known = knownBrands.find((b) => b.value === value);
    return {
      value,
      href: known ? `/marques/${encodeURIComponent(value)}` : null,
      logoUrl: known?.image_url || null,
    };
  });
  const origin = valueOf("origine");
  const contenance = valueOf("contenance");
  const ratio = valueOf("dosage pg/vg") ?? valueOf("pg/vg");
  const flavour = valueOf("saveur");

  // La liste renvoyée contient la catégorie feuille et ses parents : la feuille est la plus
  // parlante, pour le fil d'Ariane comme pour les suggestions.
  const categories = product.categories ?? [];
  const category = categories.find((item) => item.parent_category) ?? categories[0] ?? null;

  const related = category
    ? await listProductsByCategory(category.id, { limit: 13 })
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
      .map((group) =>
        group.typeName.toLowerCase() === "marque"
          ? { label: group.typeName, value: group.values.join(" · "), links: brands }
          : { label: group.typeName, value: group.values.join(" · ") }
      ),
  ];

  // L'accroche vient du sous-titre saisi à l'administration, seul texte écrit pour être lu
  // ici. À défaut elle reprend les attributs existants, et à défaut encore elle disparaît,
  // plutôt que d'inventer une promesse commerciale.
  const tagline =
    product.subtitle?.trim() || [flavour, contenance].filter(Boolean).join(" · ") || null;

  const cartVariantIds = cart?.items.map((item) => item.variant_id) ?? [];

  return (
    <div className="gv-container pb-16">
      <Breadcrumbs trail={trail} />

      {/* La fiche s'ouvre sur la première déclinaison en stock : ouvrir sur une rupture
          cacherait le bouton panier alors que d'autres déclinaisons sont achetables. */}
      <VariantSelection
        initialVariantId={
          (
            product.variants.find((v) => v.inventory_quantity === null || v.inventory_quantity > 0) ??
            product.variants[0]
          )?.id ?? ""
        }
      >
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)] lg:gap-[60px]">
          <ProductGallery product={product} origin={origin} />
          <PurchasePanel
            product={product}
            brands={brands}
            tagline={tagline}
            cartVariantIds={cartVariantIds}
            customerEmail={customer?.email ?? null}
          />
        </div>
      </VariantSelection>

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
