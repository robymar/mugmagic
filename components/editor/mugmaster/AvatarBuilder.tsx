"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useDesignStore } from '@/stores/designStore';

// MOCK DATA
const BASES = [
    { id: 'base1', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'base2', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { id: 'base3', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
];

const HAIRSTYLES = [
    { id: 'hair1', name: 'Short', seed: 'hair1' },
    { id: 'hair2', name: 'Long', seed: 'hair2' },
    { id: 'hair3', name: 'Curly', seed: 'hair3' },
];

const GLASSES = [
    { id: 'none', name: 'No Glasses' },
    { id: 'round', name: 'Round' },
    { id: 'square', name: 'Square' },
];

export const AvatarBuilder = () => {
    const [selectedBase, setSelectedBase] = useState(0);
    const { addImage } = useDesignStore();

    const handleAddToMug = () => {
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBase}`;
        addImage(avatarUrl);
    };

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">Build Your Character</h3>
                <p className="text-sm text-gray-500">Make it look just like you!</p>
            </div>

            {/* PREVIEW OF CHARACTER */}
            <div className="flex justify-center py-4">
                <div className="w-40 h-40 bg-blue-50 rounded-full border-4 border-white shadow-xl overflow-hidden relative">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBase}`}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* SELECTORS (Carousels) */}
            <div className="space-y-6">

                {/* 1. BODY TYPE */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Body Type</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedBase(i)}
                                className={`
                                    flex-shrink-0 w-16 h-16 rounded-2xl border-2 overflow-hidden snap-center
                                    ${selectedBase === i ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                                    bg-white transition-all
                                `}
                            >
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=transparent`} className="w-full h-full" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. HAIR */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Hair Style</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {['Short', 'Long', 'Bun', 'Crazy'].map((style, i) => (
                            <button key={i} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 whitespace-nowrap">
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. ACCESSORIES */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Accessories</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button className="h-10 rounded-lg bg-gray-100 text-xs font-medium hover:bg-gray-200">Glasses</button>
                        <button className="h-10 rounded-lg bg-gray-100 text-xs font-medium hover:bg-gray-200">Hat</button>
                        <button className="h-10 rounded-lg bg-gray-100 text-xs font-medium hover:bg-gray-200">Mask</button>
                    </div>
                </div>

            </div>

            <button
                onClick={handleAddToMug}
                className="mt-auto w-full py-4 bg-black text-white rounded-2xl font-bold shadow-lg shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all w-full"
            >
                Add to Mug
            </button>
        </div>
    );
}
