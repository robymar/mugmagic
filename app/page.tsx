import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getProductsFromDB } from '@/lib/db/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight, Sparkles, Palette } from 'lucide-react';

export default async function Home() {
  const { products } = await getProductsFromDB(1, 8);

  // Filter for specific sections
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const baseProducts = products.slice(0, 4); // Just taking the first 4 as base products for now

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 py-8 md:py-12 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight leading-tight">
            Design Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Dream Mug
            </span>
          </h1>
          <p className="text-base md:text-lg text-blue-100 mb-6 max-w-lg leading-relaxed">
            Create unique personalized gifts with our easy drag-and-drop editor and view them in stunning 3D.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products">
              <Button className="text-sm px-5 py-2.5 h-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold">
                Start Designing Now
              </Button>
            </Link>
            <Link href="#templates">
              <Button variant="secondary" className="text-sm px-5 py-2.5 h-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/30 font-semibold">
                View Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Start From Scratch Section */}
      <section className="py-12 container mx-auto px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Palette className="text-blue-600" size={24} />
              Start from Scratch
            </h2>
            <p className="text-gray-600 text-base">Choose a base product and unleash your creativity.</p>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 hover:underline text-sm">
            View All Products <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {baseProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/products">
            <Button variant="secondary" className="w-full">View All Products</Button>
          </Link>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section id="templates" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Designs</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Not feeling creative? Pick one of our community favorites and customize it to make it yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? featuredProducts.map((product, i) => (
              <ProductCard key={`featured-${product.id}`} product={product} index={i} />
            )) : (
              <p className="col-span-full text-center text-gray-500">No featured designs available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
            <p className="text-gray-500">Get your custom mugs in 3-5 days.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
            <p className="text-gray-500">Durable ceramics and high-quality prints.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Satisfaction Guarantee</h3>
            <p className="text-gray-500">Love your design or we'll remake it.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
