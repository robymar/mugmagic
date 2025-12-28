"use client";

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types/product';
import { VariantSelector } from './VariantSelector';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';
import { ShoppingCart, Sparkles, ChevronRight, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductPurchaseProps {
    product: Product;
}

export const ProductPurchase: React.FC<ProductPurchaseProps> = ({ product }) => {
    const { addItem } = useCartStore();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
        product.variants && product.variants.length > 0 ? product.variants[0] : undefined
    );

    // Calculate dynamic price
    const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

    // Calculate regular price (if discount exists)
    // Assuming compareAtPrice is on the product level for now, 
    // but ideally variants could have their own compare prices.
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > currentPrice;
    const savePercentage = hasDiscount
        ? Math.round(((product.compareAtPrice! - currentPrice) / product.compareAtPrice!) * 100)
        : 0;

    const handleAddToCart = () => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            toast.error('Please select a variant');
            return;
        }

        addItem({
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            productId: product.id,
            product: product,
            quantity: 1, // Default to 1 for now, could add quantity selector
            selectedVariant: selectedVariant,
            price: currentPrice
        });
        toast.success('Added to cart');
    };

    return (
        <div className="space-y-6">
            {/* Price Display */}
            <div className="flex items-baseline gap-4">
                <div className="text-4xl font-black text-gray-900">
                    {formatCurrency(currentPrice)}
                </div>
                {hasDiscount && (
                    <>
                        <div className="text-2xl text-gray-400 line-through">
                            {formatCurrency(product.compareAtPrice!)}
                        </div>
                        <div className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-lg">
                            Save {savePercentage}%
                        </div>
                    </>
                )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && selectedVariant && (
                <div className="border-t border-b border-gray-200 py-6">
                    <VariantSelector
                        variants={product.variants}
                        selectedVariant={selectedVariant}
                        onSelectVariant={setSelectedVariant}
                        basePrice={product.basePrice}
                    />
                </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
                {product.customizable !== false ? (
                    <Link href={`/editor/${product.slug}`} className="block">
                        <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3">
                            <Sparkles size={24} />
                            Customize Your Design
                            <ChevronRight size={24} />
                        </button>
                    </Link>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className="w-full px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3"
                    >
                        <ShoppingCart size={24} />
                        Add to Cart
                    </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        <Heart size={20} />
                        Save
                    </button>
                    <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        <Share2 size={20} />
                        Share
                    </button>
                </div>
            </div>

            {/* Trust Badges - relocated here to be part of the buy box */}
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="text-green-600">✓</div>
                    Free shipping on orders over €50
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="text-green-600">✓</div>
                    30-day money-back guarantee
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="text-green-600">✓</div>
                    Premium print quality guaranteed
                </div>
            </div>
        </div>
    );
};
