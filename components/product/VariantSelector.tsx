"use client";

import React from 'react';
import { ProductVariant } from '@/types/product';
import { Check } from 'lucide-react';

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedVariant: ProductVariant;
    onSelectVariant: (variant: ProductVariant) => void;
    basePrice?: number;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
    variants,
    selectedVariant,
    onSelectVariant,
    basePrice
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                    Color: <span className="text-blue-600">{selectedVariant.name}</span>
                </h3>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {variants.map((variant) => {
                    const priceDiff = basePrice ? variant.price - basePrice : 0;
                    return (
                        <button
                            key={variant.id}
                            onClick={() => onSelectVariant(variant)}
                            className="group relative"
                        >
                            {/* Color Circle */}
                            <div
                                className={`w-full aspect-square rounded-full border-2 transition-all ${selectedVariant.id === variant.id
                                    ? 'border-blue-600 ring-2 ring-blue-200 scale-110'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                style={{ backgroundColor: variant.attributes?.hexCode || '#000000' }}
                            >
                                {/* Checkmark for selected variant */}
                                {selectedVariant.id === variant.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white rounded-full p-0.5">
                                            <Check size={16} className="text-blue-600" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-center">
                                <p className={`text-xs font-medium ${selectedVariant.id === variant.id
                                    ? 'text-blue-600'
                                    : 'text-gray-600'
                                    }`}>
                                    {variant.name}
                                </p>
                            </div>

                            {/* Hover Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                {variant.name}
                                {priceDiff > 0 && ` (+€${priceDiff.toFixed(2)})`}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Price Impact Notice */}
            {(() => {
                const diff = basePrice ? selectedVariant.price - basePrice : 0;
                return diff !== 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        {diff > 0 ? '+' : ''}€{diff.toFixed(2)} for {selectedVariant.name}
                    </p>
                ) : null;
            })()}
        </div>
    );
};
