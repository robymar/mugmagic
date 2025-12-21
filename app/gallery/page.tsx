"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filter, ArrowRight, Paintbrush } from 'lucide-react';
import { TEMPLATES } from '@/data/templates';

const CATEGORIES = [
    { id: 'all', name: 'All Designs' },
    { id: 'holidays', name: 'Holidays' },
    { id: 'quotes', name: 'Quotes' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'minimal', name: 'Minimal' }
];

export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredTemplates = activeCategory === 'all'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Inspiration</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore our collection of pre-made designs. Pick a template and customize it to make it uniquely yours.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-2.5 rounded-full font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-slate-900 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={template.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <Image
                                    src={template.thumbnail}
                                    alt={template.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Link
                                        href={`/editor/${template.baseProductId}?templateId=${template.id}`}
                                        className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
                                    >
                                        <Paintbrush size={18} />
                                        Customize
                                    </Link>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                                        {template.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-1">{template.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <Filter className="mx-auto mb-4 opacity-50" size={48} />
                        <p className="text-lg">No designs found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
