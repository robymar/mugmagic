"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Star, ShoppingCart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import WishlistButton from './WishlistButton';
import { formatCurrency } from '@/lib/format';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
    const discount = product.compareAtPrice
        ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.new && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles size={12} /> NEW
                    </span>
                )}
                {product.bestseller && (
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                        🔥 BESTSELLER
                    </span>
                )}
                {discount > 0 && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        -{discount}%
                    </span>
                )}
            </div>

            {/* Image Container */}
            <Link href={`/products/${product.slug}`} className="block relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <div className="absolute top-3 right-3 z-20">
                    <WishlistButton productId={product.id} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <Image
                        src={product.images?.thumbnail || 'https://placehold.co/400x400/ececec/333333?text=No+Image'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="text-white font-semibold text-sm flex items-center gap-2">
                        View Details →
                    </span>
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 space-y-3">
                {/* Category & Rating */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 uppercase tracking-wider font-medium">
                        {product.category}
                    </span>
                    {product.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-700">{product.rating}</span>
                            {product.reviewCount && (
                                <span className="text-gray-400">({product.reviewCount})</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Title */}
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                {/* Specs Preview */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {product.specifications.capacity && (
                        <span className="px-2 py-1 bg-gray-100 rounded-lg">
                            {product.specifications.capacity}
                        </span>
                    )}
                    {product.specifications.dishwasherSafe && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg">
                            Dishwasher Safe
                        </span>
                    )}
                </div>

                {/* Color Variants Preview */}
                {product.variants && product.variants.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Colors:</span>
                        <div className="flex gap-1.5">
                            {product.variants.slice(0, 4).map((variant) => (
                                <div
                                    key={variant.id}
                                    className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer shadow-sm"
                                    style={{ backgroundColor: variant.hexCode }}
                                    title={variant.name}
                                />
                            ))}
                            {product.variants.length > 4 && (
                                <span className="text-xs text-gray-400 self-center">
                                    +{product.variants.length - 4}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Price & CTA */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900">
                                {formatCurrency(product.basePrice)}
                            </span>

                            {product.compareAtPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(product.compareAtPrice)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">
                            {product.variants && product.variants.length > 1 && '+ variants'}
                        </span>
                    </div>

                    <Link href={`/editor/${product.id}`}>
                        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 text-sm">
                            Customize
                            <ShoppingCart size={16} />
                        </button>
                    </Link>
                </div>

                {/* Stock Status */}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-lg">Out of Stock</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
