'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface QuickEditInputProps {
    value: string | number;
    onSave: (newValue: string | number) => Promise<void>;
    type?: 'text' | 'number';
    prefix?: string;
    suffix?: string;
    className?: string;
    label?: string;
}

export function QuickEditInput({
    value,
    onSave,
    type = 'text',
    prefix,
    suffix,
    className = '',
    label
}: QuickEditInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (currentValue === value) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await onSave(type === 'number' ? Number(currentValue) : currentValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
            // Optionally, we could show a toast here or revert value
            setCurrentValue(value);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    if (isEditing) {
        return (
            <div className={`flex items-center gap-1 min-w-[120px] ${className}`}>
                <div className="relative flex-1">
                    {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
                    <input
                        ref={inputRef}
                        type={type}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className={`w-full py-1 px-2 rounded border border-blue-500 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${prefix ? 'pl-6' : ''
                            } ${suffix ? 'pr-8' : ''}`}
                    />
                    {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`group flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 -mx-2 rounded transition-colors ${className}`}
            title="Click to edit"
        >
            <span className="text-gray-900 font-medium">
                {prefix}{value}{suffix}
            </span>
            <Pencil size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
