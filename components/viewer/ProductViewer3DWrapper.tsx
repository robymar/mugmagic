"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import with no SSR
const ProductViewer3DDynamic = dynamic(
    () => import('./ProductViewer3D'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-600">Loading 3D Viewer...</p>
                </div>
            </div>
        )
    }
);

export default function ProductViewer3DWrapper() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-600">Initializing...</p>
                </div>
            </div>
        );
    }

    return <ProductViewer3DDynamic />;
}
