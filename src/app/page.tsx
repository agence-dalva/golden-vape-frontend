import HeroSlider from "@/components/hero-slider";
import ProductCarousel from "@/components/product-carousel";
import ProductCard from "@/components/product-card";
import { listLatestProducts, listFeaturedProducts } from "@/lib/medusa";

export default async function Home() {
  const [latestProducts, featuredProducts] = await Promise.all([
    listLatestProducts(10),
    listFeaturedProducts(8),
  ]);

  return (
    <div>
      <HeroSlider />

      <section id="nouveautes" className="py-12">
        <h2 className="mx-auto max-w-6xl px-6 text-xl font-semibold tracking-tight text-brand-chocolate mb-6">
          Nouveautés
        </h2>
        <ProductCarousel products={latestProducts} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-xl font-semibold tracking-tight text-brand-chocolate mb-6">
          Nos incontournables
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}
