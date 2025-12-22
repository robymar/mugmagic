"use client";

import React, { useState } from 'react';
import EditorCanvas from '@/components/editor/EditorCanvas';
import ProductViewer3DWrapper from '@/components/viewer/ProductViewer3DWrapper';
import { Button } from '@/components/ui/Button';
import { useDesignStore } from '@/stores/designStore';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft, Save, ShoppingCart, Type, Image as ImageIcon, Smile, Box, Monitor } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '@/data/products';

interface EditorUIProps {
    productId: string;
}

export default function EditorUI({ productId }: EditorUIProps) {
    const { canvas, addText, addImage } = useDesignStore();
    const { addItem, toggleCart } = useCartStore();
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [showStickers, setShowStickers] = useState(false);

    const handleAddText = () => {
        addText('Hello Mug!');
    };

    const handleAddToCart = () => {
        if (!canvas) {
            toast.error('Editor not ready. Please wait a moment.');
            return;
        }

        try {
            // Simulating high-res export (for now just standard canvas export)
            const previewUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 2 // Better quality
            });

            // Find product
            const product = PRODUCTS.find(p => p.slug === productId || p.id === productId);
            if (!product) {
                toast.error('Product not found');
                return;
            }

            addItem({
                id: uuidv4(),
                productId: product.id,
                product,
                quantity: 1,
                price: product.basePrice * 100, // cents (assuming basePrice is dollars/euros)
                previewUrl,
                designId: uuidv4(), // Fix: add ignored designId for custom item
            });

            // Open cart
            toggleCart();

            // Show success toast
            toast.success('Added to cart! 🎨', {
                duration: 2000,
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add design to cart. Please try again.');
        }
    };


    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <Button variant="secondary" className="p-2 aspect-square rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-xl text-gray-800">Customizing {productId}</h1>
                </div>

                {/* Central View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('2d')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === '2d' ? 'bg-white shadow text-[#667eea]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Monitor size={16} /> Edit 2D
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === '3d' ? 'bg-white shadow text-[#667eea]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Box size={16} /> Preview 3D
                    </button>
                </div>

                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => toast.success('Save coming soon!', { icon: '🚧' })}>
                        <Save size={18} /> Save Design
                    </Button>
                    <Button onClick={handleAddToCart}>
                        Add to Cart <ShoppingCart size={18} />
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Toolbar */}
                <div className="w-24 bg-white border-r flex flex-col items-center py-6 gap-6 z-10 clay-panel m-4 rounded-xl h-[calc(100%-2rem)]">
                    <ToolButton icon={<Type />} label="Text" onClick={handleAddText} />
                    <label className="flex flex-col items-center gap-2 group w-full p-2 transition-all hover:bg-gray-50 rounded-lg active:scale-95 cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const url = URL.createObjectURL(file);
                                    addImage(url);
                                }
                            }}
                        />
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-[#667eea] group-hover:text-white transition-colors">
                            <ImageIcon />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Images</span>
                    </label>
                    <ToolButton icon={<Smile />} label="Stickers" onClick={() => setShowStickers(!showStickers)} />
                </div>

                {/* Canvas Area */}
                <div className="flex-1 p-8 flex items-center justify-center bg-gray-100 relative">
                    {/* The Canvas Container */}
                    <div className={`${viewMode === '2d' ? 'block' : 'hidden'} w-[500px] h-[500px] shadow-2xl relative bg-white`}>
                        <EditorCanvas />

                        {/* Sticker Picker Modal (Simple) */}
                        {showStickers && (
                            <div className="absolute top-0 left-full ml-4 w-64 bg-white p-4 rounded-xl shadow-xl z-50 clay-card">
                                <h3 className="font-bold mb-4 text-gray-700">Choose a Sticker</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* We are using a single sprite sheet for now, real app would have individual images */}
                                    {/* For demo, we just add the whole image. In real implementation, we'd crop or use individual files. */}
                                    <button
                                        className="p-2 border rounded hover:bg-gray-50 bg-white"
                                        onClick={() => {
                                            addImage('/stickers/stickers.png');
                                            setShowStickers(false);
                                        }}
                                    >
                                        <img src="/stickers/stickers.png" className="w-full h-auto" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3D Viewer Container */}
                    <div className={`${viewMode === '3d' ? 'block' : 'hidden'} w-full h-full max-w-4xl shadow-xl rounded-2xl`}>
                        <ProductViewer3DWrapper />
                    </div>
                </div>

                {/* Right Properties Panel Placeholder */}
                <div className="w-80 bg-white border-l z-10 p-4">
                    <div className="text-gray-400 text-center mt-10">Properties Panel</div>
                </div>

            </div>
        </div>
    );
}

const ToolButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 group w-full p-2 transition-all hover:bg-gray-50 rounded-lg active:scale-95"
    >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-[#667eea] group-hover:text-white transition-colors">
            {icon}
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
    </button>
);
