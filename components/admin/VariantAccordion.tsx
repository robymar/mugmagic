'use client';

import React from 'react';
import { ProductVariant } from '@/types/product';
import { QuickEditInput } from './QuickEditInput';
import { ChevronDown, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VariantAccordionProps {
    variants: ProductVariant[];
    productId: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function VariantAccordion({ variants, productId, isOpen, onToggle }: VariantAccordionProps) {
    const handleUpdateVariant = async (variantId: string, field: 'price' | 'stock_quantity', value: number | string) => {
        try {
            const res = await fetch(`/api/products/variants/${variantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success(`${field === 'price' ? 'Price' : 'Stock'} updated`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update variant');
            throw error; // Propagate to QuickEditInput to revert
        }
    };

    if (!variants || variants.length === 0) return null;

    return (
        <div className="border-t border-gray-100 bg-gray-50/50">
            <div
                onClick={onToggle}
                className="flex items-center gap-2 px-6 py-2 cursor-pointer hover:bg-gray-100/50 transition-colors text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {variants.length} Variants
            </div>

            {isOpen && (
                <div className="px-6 pb-4 space-y-2">
                    {variants.map((variant) => (
                        <div key={variant.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm">
                            {/* Color/Attribute Indicator */}
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                                {variant.attributes?.color ? (
                                    <div
                                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                                        style={{ backgroundColor: variant.attributes.hexCode || variant.attributes.color }}
                                        title={variant.attributes.color}
                                    />
                                ) : (
                                    <span className="text-xs">{variant.sku_code?.slice(-2)}</span>
                                )}
                            </div>

                            {/* SKU & Name */}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                    {variant.name}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                    {variant.sku_code}
                                </div>
                            </div>

                            {/* Price Edit */}
                            <div className="w-24">
                                <span className="text-xs text-gray-400 block mb-0.5">Price</span>
                                <QuickEditInput
                                    value={variant.price}
                                    type="number"
                                    prefix="€"
                                    onSave={(val) => handleUpdateVariant(variant.id, 'price', val)}
                                    className="font-mono text-gray-700 font-medium"
                                />
                            </div>

                            {/* Stock Edit */}
                            <div className="w-24">
                                <span className="text-xs text-gray-400 block mb-0.5">Stock</span>
                                <QuickEditInput
                                    value={variant.stock_quantity}
                                    type="number"
                                    onSave={(val) => handleUpdateVariant(variant.id, 'stock_quantity', val)}
                                    className={`font-mono font-medium ${variant.stock_quantity === 0 ? 'text-red-600' :
                                        variant.stock_quantity < 10 ? 'text-orange-600' : 'text-green-600'
                                        }`}
                                />
                            </div>

                            {/* Status */}
                            <div className="w-8 flex justify-center">
                                {variant.stock_quantity === 0 ? (
                                    <div title="Out of stock">
                                        <AlertCircle size={16} className="text-red-500" />
                                    </div>
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-green-500" title="In stock" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
