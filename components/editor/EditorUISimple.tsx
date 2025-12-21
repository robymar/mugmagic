"use client";

import React, { useState } from 'react';
import EditorCanvas from '@/components/editor/EditorCanvas';
import { Button } from '@/components/ui/Button';
import { useDesignStore } from '@/stores/designStore';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft, Save, ShoppingCart, Type, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface EditorUIProps {
    productId: string;
}

export default function EditorUISimple({ productId }: EditorUIProps) {
    const { canvas, addText, addImage } = useDesignStore();
    const { addItem, toggleCart } = useCartStore();
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
            const previewUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 2
            });

            addItem({
                id: uuidv4(),
                productId,
                quantity: 1,
                price: 1499,
                previewUrl
            });

            toggleCart();
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

                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => alert('Save coming soon!')}>
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
                </div>

                {/* Canvas Area */}
                <div className="flex-1 p-8 flex items-center justify-center bg-gray-100 relative">
                    <div className="w-[500px] h-[500px] shadow-2xl relative bg-white">
                        <EditorCanvas />
                    </div>
                </div>

                {/* Right Properties Panel Placeholder */}
                <div className="w-80 bg-white border-l z-10 p-4">
                    <div className="text-gray-400 text-center mt-10">Properties Panel</div>
                    <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
                        <p className="font-semibold text-blue-900">Testing Mode</p>
                        <p className="text-blue-700 text-xs mt-2">3D viewer temporarily disabled for testing</p>
                    </div>
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
