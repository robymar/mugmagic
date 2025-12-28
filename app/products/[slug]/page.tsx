import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlugFromDB, getProductsFromDB } from '@/lib/db/products';
import { getProductBySlug } from '@/data/products';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductVariantSelectorClient } from '@/components/product/ProductVariantSelectorClient';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { formatCurrency } from '@/lib/format';
import {
    Star, ShoppingCart, Sparkles, Package, Shield, Truck,
    Check, Heart, Share2, ChevronRight
} from 'lucide-react';

import { createClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';

export async function generateStaticParams() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { products } = await getProductsFromDB(1, 100, supabase);
    return products.map((product) => ({
        slug: product.slug,
    }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Try database first, then fallback to local data
    let product: Product | null = await getProductBySlugFromDB(slug);

    if (!product) {
        // Fallback to local products data
        product = (getProductBySlug(slug) as Product) || null;
    }

    if (!product) {
        notFound();
    }

    // Get related products (same category, excluding current)
    const { products: allProducts } = await getProductsFromDB();
    const relatedProducts = allProducts
        .filter(p => p.category === product!.category && p.id !== product!.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight size={16} />
                        <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
                        <ChevronRight size={16} />
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left: Gallery */}
                    <div>
                        <ProductGallery
                            images={product.images.gallery}
                            productName={product.name}
                        />
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            {product.bestseller && (
                                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                    🔥 BESTSELLER
                                </span>
                            )}
                            {product.new && (
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <Sparkles size={12} /> NEW
                                </span>
                            )}
                            {product.inStock ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                    <Check size={12} /> In Stock
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 mb-3">
                                {product.name}
                            </h1>
                            {product.rating && (
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={20}
                                                className={star <= Math.round(product!.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-600">
                                        {product.rating} ({product.reviewCount} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Purchase Section (Price, Variants, Buttons) */}
                        <ProductPurchase product={product} />

                        {/* Description */}
                        <div className="prose prose-gray">
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {product.longDescription || product.description}
                            </p>
                        </div>

                        {/* Specifications Quick View */}
                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-200">
                            {product.specifications.capacity && (
                                <div className="flex items-center gap-3">
                                    <Package className="text-blue-600" size={20} />
                                    <div>
                                        <div className="text-sm text-gray-500">Capacity</div>
                                        <div className="font-semibold text-gray-900">{product.specifications.capacity}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Shield className="text-green-600" size={20} />
                                <div>
                                    <div className="text-sm text-gray-500">Material</div>
                                    <div className="font-semibold text-gray-900">{product.specifications.material}</div>
                                </div>
                            </div>
                            {product.specifications.dishwasherSafe && (
                                <div className="flex items-center gap-3">
                                    <Check className="text-green-600" size={20} />
                                    <div>
                                        <div className="text-sm text-gray-500">Dishwasher Safe</div>
                                        <div className="font-semibold text-gray-900">Yes</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Truck className="text-purple-600" size={20} />
                                <div>
                                    <div className="text-sm text-gray-500">Shipping</div>
                                    <div className="font-semibold text-gray-900">5-7 Days</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="mt-20 space-y-16">
                    {/* Full Specifications */}
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-8">Specifications</h2>
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <dl className="grid md:grid-cols-2 gap-6">
                                {product.specifications.capacity && (
                                    <div className="flex justify-between border-b border-gray-200 pb-4">
                                        <dt className="font-semibold text-gray-700">Capacity</dt>
                                        <dd className="text-gray-900">{product.specifications.capacity}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-gray-200 pb-4">
                                    <dt className="font-semibold text-gray-700">Material</dt>
                                    <dd className="text-gray-900">{product.specifications.material}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-4">
                                    <dt className="font-semibold text-gray-700">Dimensions</dt>
                                    <dd className="text-gray-900">
                                        {product.specifications.dimensions.height}mm (H) × {product.specifications.dimensions.diameter}mm (Ø)
                                    </dd>
                                </div>
                                {product.specifications.weight && (
                                    <div className="flex justify-between border-b border-gray-200 pb-4">
                                        <dt className="font-semibold text-gray-700">Weight</dt>
                                        <dd className="text-gray-900">{product.specifications.weight}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-gray-200 pb-4">
                                    <dt className="font-semibold text-gray-700">Dishwasher Safe</dt>
                                    <dd className="text-gray-900">{product.specifications.dishwasherSafe ? 'Yes' : 'No'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-4">
                                    <dt className="font-semibold text-gray-700">Microwave Safe</dt>
                                    <dd className="text-gray-900">{product.specifications.microwaveSafe ? 'Yes' : 'No'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Reviews */}
                    {product.rating && product.reviewCount && (
                        <ProductReviews
                            productId={product.id}
                            averageRating={product.rating}
                            totalReviews={product.reviewCount}
                        />
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-8">You May Also Like</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedProducts.map((relatedProduct: Product, index: number) => (
                                    <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
