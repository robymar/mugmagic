"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveTab } from './MugMasterEditor';
import { AvatarBuilder } from './AvatarBuilder';
import { FontSelector } from './FontSelector';
import { useDesignStore } from '@/stores/designStore';
import { Type, Image as ImageIcon, Plus } from 'lucide-react';

// Stickers Panel Component
interface StickersPanelProps {
    addImage: (url: string) => void;
}

const StickersPanel: React.FC<StickersPanelProps> = ({ addImage }) => {
    const [stickers, setStickers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStickers = async () => {
            try {
                const res = await fetch('/api/stickers');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setStickers(data);
                }
            } catch (error) {
                console.error('Error fetching stickers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStickers();
    }, []);

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading stickers...</div>;
    }

    if (stickers.length === 0) {
        return <div className="text-center py-8 text-gray-500">No stickers available</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            {stickers.map(sticker => (
                <button
                    key={sticker.id}
                    onClick={() => addImage(sticker.image_url)}
                    className="aspect-square bg-gray-50 rounded-2xl p-2 hover:bg-white hover:shadow-lg transition-all border border-gray-100 flex items-center justify-center"
                >
                    <img
                        src={sticker.image_url}
                        alt={sticker.name}
                        className="w-full h-full object-contain pointer-events-none"
                        onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1665/1665731.png')}
                    />
                </button>
            ))}
        </div>
    );
};

interface ToolPanelProps {
    activeTab: ActiveTab;
}

export const ToolPanel = ({ activeTab }: ToolPanelProps) => {
    const { addText, addImage, canvas, activeObject, setMugColor } = useDesignStore();

    if (!activeTab) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
            >
                {/* HEADLINE */}
                <div className="mb-6">
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight capitalize">{activeTab}</h2>
                    <div className="h-1 w-12 bg-blue-500 rounded-full mt-2" />
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto pb-20 md:pb-0">

                    {/* --- TEXT TOOL --- */}
                    {activeTab === 'text' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col gap-4">
                                <label className="text-sm font-bold text-blue-800">New Text Layer</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Hello World"
                                        className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addText((e.target as HTMLInputElement).value || 'Text');
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                        onClick={() => addText('Awesome!')}
                                    >
                                        <Plus />
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {['Happy Birthday', 'Best Dad', 'Love', '#Summer'].map(txt => (
                                        <button
                                            key={txt}
                                            onClick={() => addText(txt)}
                                            className="px-3 py-1 bg-white rounded-full text-xs font-bold text-blue-500 border border-blue-100 hover:bg-blue-500 hover:text-white transition-all"
                                        >
                                            {txt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700">Font Family</h3>
                                <FontSelector />

                                <h3 className="font-bold text-gray-700 mt-6">Text Size</h3>
                                <input
                                    type="range"
                                    min="12"
                                    max="120"
                                    defaultValue="40"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    onChange={(e) => {
                                        if (activeObject && 'fontSize' in activeObject) {
                                            activeObject.set('fontSize', parseInt(e.target.value));
                                            canvas?.requestRenderAll();
                                        }
                                    }}
                                />

                                <h3 className="font-bold text-gray-700">Text Color</h3>

                                {/* Color Picker personalizado */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <label className="text-sm font-medium text-gray-600">Choose Color:</label>
                                    <input
                                        type="color"
                                        className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                                        defaultValue="#000000"
                                        onChange={(e) => {
                                            if (activeObject && 'fill' in activeObject) {
                                                activeObject.set('fill', e.target.value);
                                                canvas?.requestRenderAll();
                                            }
                                        }}
                                    />
                                </div>

                                {/* Colores rápidos predefinidos */}
                                <h4 className="text-sm font-medium text-gray-600 mt-3">Quick Colors:</h4>
                                <div className="grid grid-cols-6 gap-2">
                                    {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#00ff88', '#888888'].map(color => (
                                        <button
                                            key={color}
                                            className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                                if (activeObject && 'fill' in activeObject) {
                                                    activeObject.set('fill', color);
                                                    canvas?.requestRenderAll();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- AVATAR BUILDER --- */}
                    {activeTab === 'avatar' && <AvatarBuilder />}

                    {/* --- STICKERS --- */}
                    {activeTab === 'stickers' && (
                        <StickersPanel addImage={addImage} />
                    )}

                    {/* --- UPLOAD --- */}
                    {activeTab === 'upload' && (
                        <div className="h-64 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        addImage(url);
                                    }
                                }}
                            />
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <ImageIcon size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-700">Click to Upload</p>
                                <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                            </div>
                        </div>
                    )}

                    {/* --- COLOR --- */}
                    {activeTab === 'color' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-3xl border border-purple-100">
                                <h3 className="font-bold text-gray-800 mb-4">Mug Base Color</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { name: 'White', color: '#ffffff' },
                                        { name: 'Black', color: '#000000' },
                                        { name: 'Red', color: '#dc2626' },
                                        { name: 'Blue', color: '#2563eb' },
                                        { name: 'Green', color: '#16a34a' },
                                        { name: 'Yellow', color: '#eab308' },
                                        { name: 'Pink', color: '#ec4899' },
                                        { name: 'Purple', color: '#9333ea' },
                                        { name: 'Orange', color: '#ea580c' },
                                    ].map(({ name, color }) => (
                                        <button
                                            key={color}
                                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 border-2 border-transparent hover:border-purple-300 transition-all shadow-sm"
                                            onClick={() => setMugColor(color)}
                                        >
                                            <div
                                                className="w-16 h-16 rounded-full shadow-md border-2 border-gray-200"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-xs font-medium text-gray-700">{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
