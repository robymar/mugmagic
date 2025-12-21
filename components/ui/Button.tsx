"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'kids' | 'danger';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, children, onClick, ...props }, ref) => {

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isLoading || props.disabled) return;
            onClick?.(e);
        };

        const variantStyles = {
            primary: 'clay-button',
            secondary: 'clay-button-secondary',
            kids: 'clay-button-kids',
            danger: 'clay-button from-red-400 to-red-600',
        };

        return (
            <motion.button
                ref={ref as any}
                whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                    variantStyles[variant],
                    isLoading && 'opacity-70 cursor-not-allowed',
                    'flex items-center justify-center gap-2',
                    className
                )}
                onClick={handleClick}
                disabled={isLoading || props.disabled}
                {...props as any}
            >
                {isLoading ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : children}
            </motion.button>
        );
    }
);
Button.displayName = 'Button';
