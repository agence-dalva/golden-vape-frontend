import HeroSection from "@/components/hero-section";
import TrustBar from "@/components/trust-bar";
import SectionHeading from "@/components/section-heading";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import { listLatestProducts, listDiscoveryCategories } from "@/lib/medusa";

export default async function Home() {
  const [latestProducts, universes] = await Promise.all([
    listLatestProducts(8),
    listDiscoveryCategories(3),
  ]);

  return (
    <>
      <HeroSection />
      <TrustBar />

      <section id="selection" className="gv-container scroll-mt-24 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="À découvrir"
          title="La sélection du moment"
          link={{ label: "Parcourir le catalogue", href: "/categories" }}
        />
        <div id="nouveautes" className="grid grid-cols-1 gap-6 scroll-mt-24 sm:grid-cols-2 lg:grid-cols-4">
          {latestProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      </section>

      {universes.length > 0 && (
        <section className="gv-container py-16 sm:py-20">
          <SectionHeading title="Achetez par univers" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {universes.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
