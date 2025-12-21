import { getProductsFromDB } from '@/lib/db/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Sparkles, Award, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function ProductsPage() {
    const allProducts = await getProductsFromDB();
    const featuredProducts = allProducts.filter(p => p.featured);
    const bestsellers = allProducts.filter(p => p.bestseller);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Hero Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                        <Sparkles size={16} />
                        <span>Personalized Just for You</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                        Choose Your
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Perfect Canvas
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Premium quality mugs ready for your creativity. Design, preview in 3D, and bring your ideas to life.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center gap-8 pt-8">
                        <div className="text-center">
                            <div className="text-3xl font-black text-blue-600">{allProducts.length}+</div>
                            <div className="text-sm text-gray-500 font-medium">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-purple-600">100%</div>
                            <div className="text-sm text-gray-500 font-medium">Customizable</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-pink-600">★ 4.8</div>
                            <div className="text-sm text-gray-500 font-medium">Avg. Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Highlight */}
            {featuredProducts.length > 0 && (
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Award size={28} className="text-yellow-300" />
                                <h2 className="text-2xl md:text-3xl font-black">
                                    Featured Collection
                                </h2>
                            </div>
                            <p className="text-blue-100 mb-6 max-w-2xl">
                                Our hand-picked selection of bestsellers and new arrivals. Start with these crowd favorites!
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp size={16} />
                                <span className="font-semibold">Most popular this month</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

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
