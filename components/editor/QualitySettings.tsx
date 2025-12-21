"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { useQualityStore, type TextureQuality } from '@/stores/qualityStore';

const QUALITY_OPTIONS: { value: TextureQuality; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Fastest (1x)' },
    { value: 'medium', label: 'Medium', description: 'Balanced (1.5x)' },
    { value: 'high', label: 'High', description: 'Recommended (2x)' },
    { value: 'ultra', label: 'Ultra', description: 'Best Quality (3x)' }
];

export const QualitySettings = () => {
    const { textureQuality, setTextureQuality } = useQualityStore();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-all border border-gray-200"
                title="Quality Settings"
            >
                <Settings size={18} className="text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-40">
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <h3 className="font-bold text-sm text-gray-800">3D Preview Quality</h3>
                            <p className="text-xs text-gray-600 mt-0.5">Higher quality = sharper textures</p>
                        </div>

                        <div className="p-2">
                            {QUALITY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setTextureQuality(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all
                                        ${textureQuality === option.value
                                            ? 'bg-blue-100 border-2 border-blue-400'
                                            : 'hover:bg-gray-50 border-2 border-transparent'}
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">
                                                {option.label}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {option.description}
                                            </div>
                                        </div>
                                        {textureQuality === option.value && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                💡 <strong>Tip:</strong> Use "High" for most cases. "Ultra" for final export.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
