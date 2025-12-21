"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/stores/cartStore';
import { Trash2, Plus, Minus, Edit, Sparkles } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

interface CartItemProps {
    item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeItem } = useCartStore();

    const increaseQuantity = () => {
        updateQuantity(item.id, item.quantity + 1);
    };

    const decreaseQuantity = () => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        } else {
            removeItem(item.id);
        }
    };

    const handleRemove = () => {
        removeItem(item.id);
    };

    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                    src={item.previewUrl || item.product.images.thumbnail}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                />
                {item.designId && (
                    <div className="absolute top-1 right-1 bg-blue-600 text-white p-1 rounded">
                        <Sparkles size={12} />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <Link
                            href={`/products/${item.product.slug}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                            {item.product.name}
                        </Link>

                        {item.selectedVariant && (
                            <div className="flex items-center gap-2 mt-1">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.selectedVariant.hexCode }}
                                    title={item.selectedVariant.name}
                                />
                                <span className="text-sm text-gray-600">
                                    {item.selectedVariant.name}
                                </span>
                            </div>
                        )}

                        {item.designId && (
                            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                                <Sparkles size={12} />
                                Custom Design
                            </p>
                        )}
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={handleRemove}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        aria-label="Remove item"
                    >
                        <Trash2 size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    </button>
                </div>

                {/* Price & Quantity */}
                <div className="flex items-center justify-between mt-3">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={decreaseQuantity}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={14} className="text-gray-600" />
                        </button>

                        <span className="w-8 text-center font-semibold text-gray-900">
                            {item.quantity}
                        </span>

                        <button
                            onClick={increaseQuantity}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus size={14} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <div className="font-bold text-gray-900">
                            €{(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                            <div className="text-xs text-gray-500">
                                €{item.price.toFixed(2)} each
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Design Link */}
                {item.designId && (
                    <Link
                        href={`/editor/${item.productId}?designId=${item.designId}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 hover:underline"
                    >
                        <Edit size={12} />
                        Edit Design
                    </Link>
                )}
            </div>
        </div>
    );
};
