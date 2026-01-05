"use client";

import React, { useState } from 'react';
import EditorCanvas from '@/components/editor/EditorCanvas';
import ProductViewer3DWrapper from '@/components/viewer/ProductViewer3DWrapper';
import { QualitySettings } from '@/components/editor/QualitySettings';
import { Box, Monitor, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDesignStore } from '@/stores/designStore';

export const Stage = () => {
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d'); // Default to 2D for editing ease, user can toggle

    return (
        <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-[#f0f2f5] to-[#e6e9f0]">

            {/* VIEW TOGGLE PILL */}
            <div className="absolute top-6 flex bg-white/80 backdrop-blur-md p-1.5 rounded-full shadow-lg z-30 border border-white/50">
                <button
                    onClick={() => setViewMode('2d')}
                    className={`
                        px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all
                        ${viewMode === '2d'
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-800'}
                    `}
                >
                    <Monitor size={16} /> Design
                </button>
                <button
                    onClick={() => {
                        setViewMode('3d');
                        // FORCE TEXTURE UPDATE ON SWITCH
                        const canvas = useDesignStore.getState().canvas;
                        if (canvas) {
                            canvas.fire('object:modified'); // Trigger texture update listener
                        }
                    }}
                    className={`
                        px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all
                        ${viewMode === '3d'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-800'}
                    `}
                >
                    <Box size={16} /> Preview
                </button>
            </div>

            {/* QUALITY SETTINGS */}
            <div className="absolute top-6 right-6 z-30">
                <QualitySettings />
            </div>

            {/* 3D VIEWER CONTAINER */}
            <div className={`w-full h-full transition-opacity duration-500 ${viewMode === '3d' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
                {viewMode === '3d' && <ProductViewer3DWrapper />}
            </div>

            {/* 2D CANVAS CONTAINER */}
            {/* We keep it mounted always so state is preserved, just toggle visibility/opacity */}
            <div className={`
                transition-all duration-500 ease-in-out
                ${viewMode === '2d'
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-4 absolute pointer-events-none'}
            `}>
                <div className="relative w-[800px] h-[360px] bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-white ring-1 ring-gray-100/50">
                    <EditorCanvas />

                    {/* Safe Zone Indicators (Mock) */}
                    <div className="absolute inset-8 border-2 border-dashed border-gray-200 rounded-2xl pointer-events-none opacity-50 flex items-end justify-center pb-2">
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Print Area</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM HINT */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 text-center pointer-events-none"
            >
                <p className="text-gray-400 text-sm font-medium">
                    {viewMode === '2d' ? 'Drag & Drop elements to design' : 'Rotate to view all angles'}
                </p>
            </motion.div>

        </div>
    );
}
