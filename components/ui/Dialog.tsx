'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-full text-left shadow-xl sm:rounded-lg md:w-full">
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`mx-auto w-full transform rounded-xl bg-white text-left align-middle shadow-xl transition-all ${className}`}>
            {children}
        </div>
    );
}
