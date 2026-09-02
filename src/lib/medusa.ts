export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
export const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

// country_code est requis pour que Medusa calcule le prix TTC (taxe configurée sur la région France)
export const DEFAULT_COUNTRY_CODE = "fr"

type MedusaRegion = {
  id: string
  countries?: { iso_2: string }[]
}

// L'identifiant de région change d'une base à l'autre — local, staging, production. Le coder
// en dur liait le frontend à une base précise : Medusa répond alors « Region with id … not
// found » et toute page qui affiche un prix tombe. On le résout donc au premier appel.
let regionIdPromise: Promise<string> | null = null

export function getDefaultRegionId(): Promise<string> {
  regionIdPromise ??= resolveDefaultRegionId().catch((error) => {
    // Une panne passagère ne doit pas figer l'échec pour toute la vie du process.
    regionIdPromise = null
    throw error
  })
  return regionIdPromise
}

async function resolveDefaultRegionId(): Promise<string> {
  const { regions } = await medusaFetch<{ regions: MedusaRegion[] }>("/store/regions", {})
  const region =
    regions.find((r) => r.countries?.some((c) => c.iso_2 === DEFAULT_COUNTRY_CODE)) ?? regions[0]

  if (!region) {
    throw new Error("Aucune région n'est configurée sur le backend Medusa.")
  }
  return region.id
}

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
  created_at: string | null
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

export type MedusaBrand = {
  value: string
  image_url: string
  attribute_type_id: string
}

export type MedusaCategoryRef = {
  id: string
  name: string
  handle: string
  // Renvoyé en ligne par /store/products : la hiérarchie du fil d'Ariane n'exige donc
  // aucune requête supplémentaire.
  parent_category?: { id: string; name: string; handle: string } | null
}

export type MedusaCategory = MedusaCategoryRef & {
  parent_category_id: string | null
  parent_category: MedusaCategoryRef | null
  category_children: MedusaCategoryRef[]
}

// Le catalogue tolère une minute de retard, pas le stock : une fiche produit qui annonce
// « en stock » alors que la dernière unité vient de partir fait échouer la commande. Les
// appels qui portent une information transactionnelle passent donc en `fresh`.
//
// Attention en développement : un rechargement forcé du navigateur envoie
// `cache-control: no-cache`, ce qui fait ignorer `revalidate` par Next. Un problème de
// fraîcheur peut donc être invisible en local et bien réel en production.
async function medusaFetch<T>(
  path: string,
  searchParams: Record<string, string>,
  { fresh = false }: { fresh?: boolean } = {}
): Promise<T> {
  const url = new URL(`${MEDUSA_BACKEND_URL}${path}`)
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url, {
    headers: {
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
  })

  if (!res.ok) {
    throw new Error(`Medusa store API a répondu ${res.status} sur ${path}`)
  }

  return res.json()
}

// created_at date le badge « Nouveau », inventory_quantity conditionne le bouton panier.
const PRODUCT_LIST_FIELDS =
  "id,title,handle,thumbnail,created_at,*images,*variants,*variants.calculated_price,*variants.inventory_quantity"
const PRODUCT_DETAIL_FIELDS =
  "id,title,description,handle,thumbnail,*images,*options,*options.values,*variants,*variants.calculated_price,*variants.options,*variants.inventory_quantity,*variants.images,height,width,length,weight,origin_country,*categories"

export async function listProducts(limit = 24, offset = 0, order?: string) {
  const { products, count } = await medusaFetch<{ products: MedusaProduct[]; count: number }>(
    "/store/products",
    {
      region_id: await getDefaultRegionId(),
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
  const { products } = await medusaFetch<{ products: MedusaProduct[] }>(
    "/store/products",
    {
      handle,
      region_id: await getDefaultRegionId(),
      country_code: DEFAULT_COUNTRY_CODE,
      fields: PRODUCT_DETAIL_FIELDS,
    },
    // La fiche produit affiche le stock et pilote le bouton d'ajout au panier.
    { fresh: true }
  )
  return products[0] ?? null
}

export type SearchResultVariant = {
  id: string
  title: string | null
  price: { amount: number; currency_code: string } | null
  // `null` signale une variante sans niveau d'inventaire : une information absente, pas une rupture.
  stock: number | null
  allow_backorder: boolean
}

export type SearchResultProduct = {
  id: string
  title: string
  handle: string
  image_url: string | null
  variants: SearchResultVariant[]
}

export type SearchResultBrand = {
  value: string
  image_url: string
}

export type SearchResults = {
  products: SearchResultProduct[]
  brands: SearchResultBrand[]
}

// Chaque frappe produit une requête différente : les mettre en cache remplirait le cache de
// données pour rien, d'où `fresh`. Le backend répond en une vingtaine de millisecondes.
export async function searchCatalog(term: string): Promise<SearchResults> {
  if (term.trim().length < 2) {
    return { products: [], brands: [] }
  }

  return medusaFetch<SearchResults>("/store/search", { q: term.trim() }, { fresh: true })
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
      region_id: await getDefaultRegionId(),
      country_code: DEFAULT_COUNTRY_CODE,
      fields: PRODUCT_LIST_FIELDS,
      limit: String(limit),
      offset: String(offset),
    }
  )
  return { products, count }
}

export type DiscoveryCategory = {
  id: string
  name: string
  handle: string
  imageUrl: string | null
}

// Univers mis en avant sur l'accueil. Le rapprochement se fait sur le nom et non sur le
// handle : celui-ci porte un suffixe numérique issu de l'import Hiboutik, qui diffère d'une
// base à l'autre. À défaut de correspondance, on retombe sur les premières racines.
const DISCOVERY_PREFERENCES = ["liquides", "kits", "diy"]

function simplify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export async function listDiscoveryCategories(count = 3): Promise<DiscoveryCategory[]> {
  const categories = await listCategories()

  const preferred = DISCOVERY_PREFERENCES.map((wanted) =>
    categories.find((category) => simplify(category.name) === wanted)
  ).filter((category): category is MedusaCategory => Boolean(category))

  const selection = [
    ...preferred,
    ...categories.filter((category) => !preferred.includes(category)),
  ].slice(0, count)

  // L'illustration de chaque univers vient d'un vrai produit du catalogue : aucune image
  // décorative à maintenir en plus.
  return Promise.all(
    selection.map(async (category) => {
      const { products } = await listProductsByCategory(category.id, 1, 0).catch(() => ({
        products: [] as MedusaProduct[],
        count: 0,
      }))
      const product = products[0]

      return {
        id: category.id,
        name: category.name,
        handle: category.handle,
        imageUrl: product?.images?.[0]?.url ?? product?.thumbnail ?? null,
      }
    })
  )
}

export async function listBrands() {
  const url = new URL(`${MEDUSA_BACKEND_URL}/store/brands`)
  const res = await fetch(url, {
    headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Medusa store API a répondu ${res.status} sur /store/brands`)
  }

  const { brands } = (await res.json()) as { brands: MedusaBrand[] }
  return brands
}

export async function listProductsByBrand(value: string, attributeTypeId: string, limit = 24, offset = 0) {
  const brandProductsUrl = new URL(`${MEDUSA_BACKEND_URL}/store/brands/${encodeURIComponent(value)}/products`)
  brandProductsUrl.searchParams.set("attribute_type_id", attributeTypeId)

  const idsRes = await fetch(brandProductsUrl, {
    headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
    next: { revalidate: 60 },
  })
  if (!idsRes.ok) {
    throw new Error(`Medusa store API a répondu ${idsRes.status} sur /store/brands/${value}/products`)
  }
  const { product_ids } = (await idsRes.json()) as { product_ids: string[] }

  if (product_ids.length === 0) {
    return { products: [] as MedusaProduct[], count: 0 }
  }

  return listProductsByIds(product_ids, limit, offset)
}

/**
 * Repasse une liste d'identifiants à /store/products pour récupérer les produits complets.
 * Les routes personnalisées du backend ne renvoient que des identifiants : le calcul de prix
 * reste ainsi au même endroit pour tout le site, et les prix ne divergent pas d'une section
 * à l'autre.
 */
export async function listProductsByIds(ids: string[], limit = 24, offset = 0) {
  if (ids.length === 0) {
    return { products: [] as MedusaProduct[], count: 0 }
  }

  // medusaFetch ne gère pas les paramètres tableau, d'où la construction manuelle de l'URL.
  const url = new URL(`${MEDUSA_BACKEND_URL}/store/products`)
  ids.forEach((id) => url.searchParams.append("id[]", id))
  url.searchParams.set("region_id", await getDefaultRegionId())
  url.searchParams.set("country_code", DEFAULT_COUNTRY_CODE)
  url.searchParams.set("fields", PRODUCT_LIST_FIELDS)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("offset", String(offset))

  const res = await fetch(url, {
    headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error(`Medusa store API a répondu ${res.status} sur /store/products (par identifiants)`)
  }

  const { products, count } = (await res.json()) as { products: MedusaProduct[]; count: number }
  // /store/products ne garantit pas l'ordre demandé : on le rétablit, la pertinence des
  // suggestions étant portée par leur rang.
  const byId = new Map(products.map((product) => [product.id, product]))
  return { products: ids.map((id) => byId.get(id)).filter((p): p is MedusaProduct => Boolean(p)), count }
}

export type RelatedProducts = { similar: MedusaProduct[]; complementary: MedusaProduct[] }

/**
 * Suggestions calculées par le backend : produits similaires (même marque, puis même
 * catégorie) et univers complémentaires. La règle de rapprochement vit côté Medusa, où le
 * commerçant peut l'ajuster par les métadonnées de catégorie.
 */
export async function listRelatedProducts(productId: string, limit = 4): Promise<RelatedProducts> {
  const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/${productId}/related`)
  url.searchParams.set("limit", String(limit))

  const res = await fetch(url, {
    headers: { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return { similar: [], complementary: [] }
  }

  const { similar, complementary } = (await res.json()) as {
    similar: string[]
    complementary: string[]
  }

  const [similarProducts, complementaryProducts] = await Promise.all([
    listProductsByIds(similar, limit),
    listProductsByIds(complementary, limit),
  ])

  return { similar: similarProducts.products, complementary: complementaryProducts.products }
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
