import Link from "next/link";
import type { MedusaProduct } from "@/lib/medusa";
import { listProductAttributes, groupAttributesByType } from "@/lib/medusa";

const BADGE_CLASS =
  "inline-flex items-center rounded-full bg-brand-gold/25 px-3 py-1 text-sm font-medium text-brand-chocolate";

type DimensionRow = { label: string; value: string };

function buildDimensionRows(product: MedusaProduct): DimensionRow[] {
  const rows: DimensionRow[] = [];
  if (product.height != null) rows.push({ label: "Hauteur", value: `${product.height} mm` });
  if (product.width != null) rows.push({ label: "Largeur", value: `${product.width} mm` });
  if (product.length != null) rows.push({ label: "Longueur", value: `${product.length} mm` });
  if (product.weight != null) rows.push({ label: "Poids", value: `${product.weight} g` });
  // Pays d'origine volontairement omis : déjà couvert par l'attribut custom "Origine" si présent.
  return rows;
}

function TableHeader({ title }: { title: string }) {
  return (
    <div className="bg-brand-chocolate px-5 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-cream">{title}</p>
    </div>
  );
}

function TableRow({
  label,
  children,
  index,
}: {
  label: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:py-3.5 ${
        index % 2 === 1 ? "bg-brand-cream/60" : ""
      } ${index > 0 ? "border-t border-brand-chocolate/10" : ""}`}
    >
      <dt className="text-xs font-semibold uppercase tracking-wide text-brand-chocolate/60">{label}</dt>
      <dd className="flex flex-wrap gap-1.5">{children}</dd>
    </div>
  );
}

export default async function ProductAttributesTable({ product }: { product: MedusaProduct }) {
  const attributes = await listProductAttributes(product.id);
  const groups = groupAttributesByType(attributes);
  const dimensionRows = buildDimensionRows(product);
  const hasCategories = product.categories.length > 0;
  const hasCharacteristics = groups.length > 0 || hasCategories;
  const hasDimensions = dimensionRows.length > 0;

  if (!hasCharacteristics && !hasDimensions) return null;

  return (
    <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-start">
      {hasCharacteristics && (
        <dl className="flex-1 overflow-hidden rounded-xl border border-brand-chocolate/10 bg-white">
          <TableHeader title="Caractéristiques" />

          {hasCategories && (
            <TableRow label="Catégories" index={0}>
              {product.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className={`${BADGE_CLASS} hover:bg-brand-gold/40 transition-colors`}
                >
                  {category.name}
                </Link>
              ))}
            </TableRow>
          )}

          {groups.map(({ typeName, values }, i) => (
            <TableRow key={typeName} label={typeName} index={hasCategories ? i + 1 : i}>
              {values.map((value) => (
                <span key={value} className={BADGE_CLASS}>
                  {value}
                </span>
              ))}
            </TableRow>
          ))}
        </dl>
      )}

      {hasDimensions && (
        <dl className="flex-1 overflow-hidden rounded-xl border border-brand-chocolate/10 bg-white">
          <TableHeader title="Dimensions" />

          {dimensionRows.map((row, i) => (
            <TableRow key={row.label} label={row.label} index={i}>
              <span className={BADGE_CLASS}>{row.value}</span>
            </TableRow>
          ))}
        </dl>
      )}
    </div>
  );
}
