"use client";

import React from 'react';
import Link from 'next/link';

interface EditorUIProps {
    productId: string;
}

export default function EditorUIMinimal({ productId }: EditorUIProps) {
    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="h-16 bg-white border-b flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                            ← Back
                        </button>
                    </Link>
                    <h1 className="font-bold text-xl text-gray-800">Testing Editor - {productId}</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-green-600 mb-4">✓ Editor Loaded!</h2>
                    <p className="text-gray-600">
                        This is a minimal test version to isolate the issue.
                    </p>
                    <div className="mt-8 p-6 bg-white rounded-lg shadow">
                        <p className="font-semibold mb-2">Product ID:</p>
                        <p className="text-2xl text-blue-600">{productId}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
