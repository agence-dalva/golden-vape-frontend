export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
export const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

// Région par défaut utilisée pour calculer les prix affichés (une seule région existe : Europe)
export const DEFAULT_REGION_ID = "reg_01KWE2MGV9BXFJER78NW5GF0CQ"
// country_code est requis pour que Medusa calcule le prix TTC (taxe configurée sur la région France)
export const DEFAULT_COUNTRY_CODE = "fr"

export type MedusaImage = {
  id: string
  url: string
}

export type MedusaCalculatedPrice = {
  calculated_amount: number
  calculated_amount_with_tax?: number
  currency_code: string
}

export type MedusaOptionValue = {
  id: string
  value: string
  option_id: string
}

export type MedusaVariant = {
  id: string
  title: string
  sku: string | null
  calculated_price: MedusaCalculatedPrice | null
  options: MedusaOptionValue[]
  inventory_quantity: number | null
  images: MedusaImage[]
}

export type MedusaProductOption = {
  id: string
  title: string
  values: { id: string; value: string }[]
}

export type MedusaProduct = {
  id: string
  title: string
  description: string | null
  handle: string
  // thumbnail n'est jamais renseigné sur le catalogue migré — utiliser images[0]?.url pour l'affichage
  thumbnail: string | null
  images: MedusaImage[]
  options: MedusaProductOption[]
  variants: MedusaVariant[]
  height: number | null
  width: number | null
  length: number | null
  weight: number | null
  origin_country: string | null
  categories: MedusaCategoryRef[]
}

export type MedusaAttributeType = {
  id: string
  name: string
  allow_multiple: boolean
}

export type MedusaAttributeValue = {
  id: string
  value: string
  attribute_type: MedusaAttributeType
}

export type MedusaCategoryRef = { id: string; name: string; handle: string }

export type MedusaCategory = MedusaCategoryRef & {
  parent_category_id: string | null
  parent_category: MedusaCategoryRef | null
  category_children: MedusaCategoryRef[]
}

async function medusaFetch<T>(path: string, searchParams: Record<string, string>): Promise<T> {
  const url = new URL(`${MEDUSA_BACKEND_URL}${path}`)
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url, {
    headers: {
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Medusa store API a répondu ${res.status} sur ${path}`)
  }

  return res.json()
}

const PRODUCT_LIST_FIELDS = "id,title,handle,thumbnail,*images,*variants.calculated_price"
const PRODUCT_DETAIL_FIELDS =
  "id,title,description,handle,thumbnail,*images,*options,*options.values,*variants,*variants.calculated_price,*variants.options,*variants.inventory_quantity,*variants.images,height,width,length,weight,origin_country,*categories"

export async function listProducts(limit = 24, offset = 0, order?: string) {
  const { products, count } = await medusaFetch<{ products: MedusaProduct[]; count: number }>(
    "/store/products",
    {
      region_id: DEFAULT_REGION_ID,
      country_code: DEFAULT_COUNTRY_CODE,
      fields: PRODUCT_LIST_FIELDS,
      limit: String(limit),
      offset: String(offset),
      ...(order ? { order } : {}),
    }
  )
  return { products, count }
}

export async function listLatestProducts(limit = 10) {
  const { products } = await listProducts(limit, 0, "-created_at")
  return products
}

// Pas de vrai mécanisme de sélection de produits phares pour l'instant : on prend un lot
// différent des "derniers ajoutés" (tri par titre) pour éviter le chevauchement visuel.
// À remplacer par metadata.featured + widget admin si un vrai contrôle éditorial est nécessaire.
export async function listFeaturedProducts(limit = 8) {
  const { products } = await listProducts(limit, 0, "title")
  return products
}

export async function getProductByHandle(handle: string) {
  const { products } = await medusaFetch<{ products: MedusaProduct[] }>("/store/products", {
    handle,
    region_id: DEFAULT_REGION_ID,
    country_code: DEFAULT_COUNTRY_CODE,
    fields: PRODUCT_DETAIL_FIELDS,
  })
  return products[0] ?? null
}

export async function listCategories() {
  const { product_categories } = await medusaFetch<{ product_categories: MedusaCategory[] }>(
    "/store/product-categories",
    {
      fields: "id,name,handle,*category_children",
      parent_category_id: "null",
      limit: "100",
    }
  )
  return product_categories
}

export async function getCategoryByHandle(handle: string) {
  const { product_categories } = await medusaFetch<{ product_categories: MedusaCategory[] }>(
    "/store/product-categories",
    {
      handle,
      fields: "id,name,handle,parent_category_id,*parent_category,*category_children",
    }
  )
  return product_categories[0] ?? null
}

export async function listProductsByCategory(categoryId: string, limit = 24, offset = 0) {
  const { products, count } = await medusaFetch<{ products: MedusaProduct[]; count: number }>(
    "/store/products",
    {
      category_id: categoryId,
      region_id: DEFAULT_REGION_ID,
      country_code: DEFAULT_COUNTRY_CODE,
      fields: PRODUCT_LIST_FIELDS,
      limit: String(limit),
      offset: String(offset),
    }
  )
  return { products, count }
}

export async function listProductAttributes(productId: string) {
  const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/${productId}/attributes`)
  const res = await fetch(url, {
    headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Medusa store API a répondu ${res.status} sur /store/products/${productId}/attributes`)
  }

  const { attributes } = (await res.json()) as { attributes: MedusaAttributeValue[] }
  return attributes
}

// Regroupe les valeurs par type de caractéristique (un type "allow_multiple" peut avoir
// plusieurs valeurs pour un même produit, ex: Saveur = Fruités + Fruités Frais).
export function groupAttributesByType(attributes: MedusaAttributeValue[]) {
  const groups = new Map<string, { typeName: string; values: string[] }>()

  for (const attr of attributes) {
    const key = attr.attribute_type.id
    if (!groups.has(key)) {
      groups.set(key, { typeName: attr.attribute_type.name, values: [] })
    }
    groups.get(key)!.values.push(attr.value)
  }

  return Array.from(groups.values())
}

export function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

// Le prix à afficher au client est toujours le TTC (calculated_amount_with_tax) — Medusa le
// calcule côté serveur à partir de la taxe configurée sur la région. Repli sur le montant HT
// (calculated_amount) uniquement si aucune taxe n'est applicable (ex: région sans tax_rate).
export function getDisplayAmount(price: MedusaCalculatedPrice): number {
  return price.calculated_amount_with_tax ?? price.calculated_amount
}
