"use client";

import React from 'react';
import Link from 'next/link';

export default function TestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    ✓ Test Route Works!
                </h1>
                <p className="text-gray-600 mb-6">
                    This is a completely independent test route to verify Next.js is working.
                </p>
                <Link href="/">
                    <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Go Home
                    </button>
                </Link>
            </div>
        </div>
    );
}
