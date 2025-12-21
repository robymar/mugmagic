"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden group">
                    <Image
                        src={images[selectedImage]}
                        alt={`${productName} - Image ${selectedImage + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            >
                                <ChevronLeft size={24} className="text-gray-900" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            >
                                <ChevronRight size={24} className="text-gray-900" />
                            </button>
                        </>
                    )}

                    {/* Zoom Button */}
                    <button
                        onClick={() => setIsZoomed(true)}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                        <Maximize2 size={20} className="text-gray-900" />
                    </button>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                            {selectedImage + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${selectedImage === index
                                        ? 'ring-2 ring-blue-600 ring-offset-2'
                                        : 'ring-1 ring-gray-200 hover:ring-gray-300'
                                    }`}
                            >
                                <Image
                                    src={image}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox/Zoom Modal */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsZoomed(false)}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <div className="relative w-full max-w-5xl aspect-square">
                            <Image
                                src={images[selectedImage]}
                                alt={`${productName} - Zoom`}
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />

                            {/* Close hint */}
                            <div className="absolute top-4 right-4 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
                                Click anywhere to close
                            </div>

                            {/* Navigation in zoom */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-2 h-2 rounded-full transition-colors ${selectedImage === index ? 'bg-white' : 'bg-white/40'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
