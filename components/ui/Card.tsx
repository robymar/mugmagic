"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("clay-card p-6", className)}
            {...props as any}
        >
            {children}
        </motion.div>
    );
};
