import { getProductsFromDB } from '@/lib/db/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Sparkles, Award, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function ProductsPage() {
    const { products: allProducts } = await getProductsFromDB();
    const featuredProducts = allProducts.filter(p => p.featured);
    const bestsellers = allProducts.filter(p => p.bestseller);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Hero Section */}
            <section className="relative py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="relative max-w-7xl mx-auto text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                        Choose Your
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-2">
                            Perfect Canvas
                        </span>
                    </h1>

                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto flex items-center justify-center gap-4">
                        <span>✨ 100% Customizable</span>
                        <span className="hidden sm:inline">•</span>
                        <span>★ 4.8 Avg. Rating</span>
                        <span className="hidden sm:inline">•</span>
                        <span>🚀 Fast Shipping</span>
                    </p>
                </div>
            </section>

            {/* Main Product Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <ProductGrid products={allProducts} showFilters={true} />
                </div>
            </section>

            {/* Trust Badges / USPs */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-3">
                            <div className="text-4xl">🎨</div>
                            <h3 className="font-bold text-lg text-gray-900">Full Customization</h3>
                            <p className="text-gray-600 text-sm">
                                Add text, images, or create your own avatar. Total creative freedom.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="text-4xl">🚚</div>
                            <h3 className="font-bold text-lg text-gray-900">Fast Shipping</h3>
                            <p className="text-gray-600 text-sm">
                                Get your custom mug delivered in 5-7 business days worldwide.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="text-4xl">✨</div>
                            <h3 className="font-bold text-lg text-gray-900">Premium Quality</h3>
                            <p className="text-gray-600 text-sm">
                                Dishwasher safe, vibrant prints, and built to last years.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-center text-white shadow-2xl">
                        <h2 className="text-4xl font-black mb-4">
                            Ready to Create?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Choose any product above and start designing your masterpiece
                        </p>
                        <Link href="#top" className="inline-block">
                            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                                Browse Products
                                <ChevronRight size={20} />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
