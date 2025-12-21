"use client";
// MugMaster Editor Container

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Stage } from './Stage';
import { ToolPanel } from './ToolPanel';
import { useDesignStore } from '@/stores/designStore';
import { useCartStore } from '@/stores/cartStore';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { PRODUCTS } from '@/data/products';

export type ActiveTab = 'color' | 'text' | 'stickers' | 'avatar' | 'upload' | null;

interface MugMasterEditorProps {
    productId: string;
    initialDesign?: {
        text?: string;
        textColor?: string;
        fontFamily?: string;
        image?: string;
    };
    designId?: string;
}

export default function MugMasterEditor({ productId, initialDesign, designId }: MugMasterEditorProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('text');
    const { addItem, toggleCart } = useCartStore();
    const { canvas, saveDesign, addText, addImage, loadDesign } = useDesignStore();

    // Load initial design template OR saved design
    React.useEffect(() => {
        if (!canvas) return;

        // 1. Load Saved Design if ID exists
        if (designId) {
            const load = async () => {
                const toastId = toast.loading('Loading your design...');
                try {
                    await loadDesign(designId);
                    toast.success('Design loaded!', { id: toastId });
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to load design', { id: toastId });
                }
            };
            load();
            return; // Skip template loading if loading a saved design
        }

        // 2. Load Template if exists
        if (initialDesign) {
            // ... existing template logic
            if (initialDesign.text) {
                setTimeout(() => {
                    addText(initialDesign.text!, {
                        fill: initialDesign.textColor || '#000000',
                        fontFamily: initialDesign.fontFamily || 'Arial'
                    });
                }, 500);
            }

            if (initialDesign.image) {
                setTimeout(() => {
                    addImage(initialDesign.image!);
                }, 600);
            }
        }
    }, [canvas, initialDesign, designId, addText, addImage, loadDesign]);

    const handleAddToCart = () => {
        // Confetti Effect
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#667eea', '#764ba2', '#84fab0', '#ff6b9d'] // Brand colors
        });

        if (!canvas) {
            toast.error('Getting things ready...', { icon: '⏳' });
            return;
        }

        // Find the product by productId
        const product = PRODUCTS.find(p => p.slug === productId);

        if (!product) {
            toast.error('Product not found', { icon: '❌' });
            return;
        }

        // Simulate add to cart - in real app we'd export the image here
        const previewUrl = canvas?.toDataURL({ format: 'png', multiplier: 0.5 });

        addItem({
            id: uuidv4(),
            productId,
            product: product, // Include the full product object
            quantity: 1,
            price: product.basePrice, // Use actual product price
            previewUrl: previewUrl,
            designId: uuidv4(), // Mark as custom design
        });

        toggleCart();
        toast.success("It's in the bag!", {
            style: { borderRadius: '16px', background: '#333', color: '#fff' }
        });
    };

    const handleSaveDesign = async () => {
        if (!canvas) return;

        // 1. Check Auth (Client-side check)
        // Ideally we should check if user is logged in. 
        // For now, let's try to get the user from Supabase.
        const { createClient } = require('@/lib/supabase'); // Dynamic import to avoid top-level issues if any
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error('Please log in to save your design!', { icon: '🔒' });
            // Optionally redirect or show login modal
            return;
        }

        // 2. Prompt for Name
        // Using window.prompt is simple for MVP. 
        // We could use a beautiful modal, but we want to be fast.
        const name = window.prompt("Name your design:", "My Awesome Mug");
        if (!name) return; // User cancelled

        // Update name in store
        useDesignStore.getState().setDesignName(name);

        const toastId = toast.loading('Saving to your profile...');

        try {
            await saveDesign(productId, user.id);
            toast.success('Saved! Check your profile.', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save design', { id: toastId });
        }
    };

    return (
        <div className="h-screen w-full bg-[#FAFAFC] text-[#2D3748] flex flex-col md:flex-row overflow-hidden font-sans">
            <Toaster position="top-center" />

            {/* HEADER FOR MOBILE (Hidden on desktop if sidebar covers it, or kept minimal) */}
            <div className="md:hidden absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
                <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm pointer-events-auto">
                    MugMaster
                </span>
            </div>

            {/* LEFT PANEL: THE STUDIO (40%) */}
            <motion.div
                className="
                    fixed bottom-0 left-0 right-0 h-[50vh] z-40 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]
                    md:relative md:h-full md:w-[40%] md:rounded-none md:shadow-none md:border-r border-gray-100
                    flex flex-col md:flex-row
                "
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "circOut" }}
            >
                {/* NAVIGATION SIDEBAR (The Icons) */}
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onAddToCart={handleAddToCart}
                    onSave={handleSaveDesign}
                />

                {/* DYNAMIC TOOL PANEL (The content for each tab) */}
                <div className="flex-1 h-full overflow-y-auto bg-white p-6 relative">
                    <ToolPanel activeTab={activeTab} />
                </div>

            </motion.div>

            {/* RIGHT PANEL: THE STAGE (60%) */}
            <div className="w-full h-[50vh] md:h-full md:w-[60%] relative bg-[#F0F2F5]">
                <Stage />
            </div>
        </div>
    );
}
