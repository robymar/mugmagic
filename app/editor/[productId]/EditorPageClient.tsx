'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Product } from '@/types/product';


// Lazy load the heavy editor component
const MugMasterEditor = dynamic(
    () => import('@/components/editor/mugmaster/MugMasterEditor'),
    {
        loading: () => (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Editor...</p>
                </div>
            </div>
        ),
        ssr: false, // Editor requires client-side only (fabric.js)
    }
);

interface DesignData {
    text?: string;
    textColor?: string;
    fontFamily?: string;
    image?: string;
}

interface EditorPageClientProps {
    productId: string;
    product: Product;
    initialDesign?: DesignData;
    designId?: string;
    cartItemId?: string;
}

export default function EditorPageClient({
    productId,
    product,
    initialDesign,
    designId,
    cartItemId
}: EditorPageClientProps) {
    return (
        <MugMasterEditor
            productId={productId}
            product={product}
            initialDesign={initialDesign}
            designId={designId}
            cartItemId={cartItemId}
        />
    );
}
