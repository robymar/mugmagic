'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onRemove?: () => void;
    value?: string;
    label?: string;
    className?: string;
}

export default function ImageUpload({ onUpload, onRemove, value, label, className = '' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            onUpload(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    if (value) {
        return (
            <div className={`relative group ${className}`}>
                <img
                    src={value}
                    alt="Upload"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                        <Loader2 className="animate-spin text-gray-400" size={24} />
                    ) : (
                        <>
                            <Upload className="mb-2 text-gray-400" size={24} />
                            <p className="text-xs text-gray-500">Click to upload</p>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
