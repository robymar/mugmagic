"use client";

import React, { useState, useEffect } from 'react';
import { GOOGLE_FONTS, getFontsByCategory, loadGoogleFonts } from '@/data/fonts';
import { useDesignStore } from '@/stores/designStore';
import { ChevronDown, Search } from 'lucide-react';

export const FontSelector = () => {
    const { canvas, activeObject } = useDesignStore();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedFont, setSelectedFont] = useState('Inter');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        // Load Google Fonts on component mount
        loadGoogleFonts();
    }, []);

    const filteredFonts = GOOGLE_FONTS.filter(font => {
        const matchesSearch = font.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleFontSelect = (fontFamily: string) => {
        setSelectedFont(fontFamily);
        if (activeObject && 'fontFamily' in activeObject) {
            activeObject.set('fontFamily', fontFamily);
            canvas?.requestRenderAll();
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Selected Font Display */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-all flex items-center justify-between group"
            >
                <span style={{ fontFamily: selectedFont }} className="font-semibold text-gray-700">
                    {selectedFont}
                </span>
                <ChevronDown
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search fonts..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="px-3 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto">
                        {['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat === 'all' ? 'All' : cat.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Font List */}
                    <div className="overflow-y-auto flex-1 p-2">
                        {filteredFonts.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No fonts found
                            </div>
                        ) : (
                            filteredFonts.map(font => (
                                <button
                                    key={font.family}
                                    onClick={() => handleFontSelect(font.family)}
                                    className={`w-full px-4 py-3 text-left rounded-lg hover:bg-blue-50 transition-colors ${selectedFont === font.family ? 'bg-blue-100' : ''
                                        }`}
                                >
                                    <div style={{ fontFamily: font.family }} className="text-lg text-gray-800">
                                        {font.name}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5 font-normal">
                                        {font.category}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
                        {filteredFonts.length} fonts available
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
