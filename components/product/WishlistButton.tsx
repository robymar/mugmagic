"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

interface WishlistButtonProps {
    productId: string;
    className?: string;
}

export default function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Initial check
    useEffect(() => {
        const checkStatus = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                // Check if already in wishlist
                const { data } = await supabase
                    .from('wishlist')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('product_id', productId)
                    .single();

                if (data) setIsWishlisted(true);
            }
        };
        checkStatus();
    }, [productId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking to product page if button is inside a Link
        e.stopPropagation();

        if (!userId) {
            toast.error('Log in to save items!', { icon: '🔒' });
            return;
        }

        setIsLoading(true);
        const supabase = createClient();

        if (isWishlisted) {
            // Remove
            const { error } = await supabase
                .from('wishlist')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (!error) {
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                toast.error('Could not remove item');
            }
        } else {
            // Add
            const { error } = await supabase
                .from('wishlist')
                .insert({ user_id: userId, product_id: productId });

            if (!error) {
                setIsWishlisted(true);
                toast.success('Added to wishlist!', { icon: '❤️' });
            } else {
                toast.error('Could not add item');
            }
        }
        setIsLoading(false);
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={isLoading}
            className={`
                p-2 rounded-full transition-all duration-200 z-10
                ${isWishlisted
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-white hover:text-red-500 hover:scale-110 shadow-sm'
                }
                ${className}
            `}
        >
            <Heart
                size={20}
                fill={isWishlisted ? "currentColor" : "none"}
                className={isLoading ? "animate-pulse" : ""}
            />
        </button>
    );
}
