"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { TEMPLATES } from '@/data/templates';

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

export default function EditorPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const productId = params.productId as string;
    const templateId = searchParams.get('templateId');
    const designId = searchParams.get('designId');

    const template = templateId ? TEMPLATES.find(t => t.id === templateId) : null;

    return <MugMasterEditor productId={productId} initialDesign={template?.designData} designId={designId || undefined} />;
}
