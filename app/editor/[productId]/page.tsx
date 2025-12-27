import React from 'react';
import { TEMPLATES } from '@/data/templates';
import { getProductBySlugFromDB } from '@/lib/db/products';
import { getProductBySlug } from '@/data/products';
import { notFound } from 'next/navigation';
import EditorPageClient from './EditorPageClient';

interface EditorPageProps {
    params: Promise<{ productId: string }>;
    searchParams: Promise<{ templateId?: string; designId?: string; cartItemId?: string }>;
}

export default async function EditorPage({ params, searchParams }: EditorPageProps) {
    const { productId } = await params;
    const { templateId, designId, cartItemId } = await searchParams;

    // Fetch product data on the server (productId is actually the slug here)
    // Try database first, then fallback to local data
    let product = await getProductBySlugFromDB(productId);

    if (!product) {
        // Fallback to local products data
        product = getProductBySlug(productId) || null;
    }

    if (!product) {
        notFound();
    }

    const template = templateId ? TEMPLATES.find(t => t.id === templateId) : null;

    return (
        <EditorPageClient
            productId={product.slug}
            product={product}
            initialDesign={template?.designData}
            designId={designId}
            cartItemId={cartItemId}
        />
    );
}
