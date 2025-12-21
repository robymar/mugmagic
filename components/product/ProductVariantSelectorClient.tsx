"use client";

import { useState } from 'react';
import { ProductVariant } from '@/types/product';
import { VariantSelector } from '@/components/product/VariantSelector';

interface ProductVariantSelectorClientProps {
    variants: ProductVariant[];
}

export function ProductVariantSelectorClient({ variants }: ProductVariantSelectorClientProps) {
    const [selectedVariant, setSelectedVariant] = useState(variants[0]);

    return (
        <VariantSelector
            variants={variants}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
        />
    );
}
