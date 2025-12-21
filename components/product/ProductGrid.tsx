"use client";

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Grid3x3, LayoutGrid } from 'lucide-react';

interface ProductGridProps {
    products: Product[];
    showFilters?: boolean;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'popular';

export const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    showFilters = true
}) => {
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [gridCols, setGridCols] = useState<3 | 4>(3);

    // Sort products
    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.basePrice - b.basePrice;
            case 'price-high':
                return b.basePrice - a.basePrice;
            case 'newest':
                return (b.new ? 1 : 0) - (a.new ? 1 : 0);
            case 'popular':
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            case 'featured':
            default:
                return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
    });

    const gridClass = gridCols === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    return (
        <div className="w-full space-y-6">
            {/* Filters & Controls */}
            {showFilters && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    {/* Left: Results Count */}
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={20} className="text-gray-400" />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {products.length} Product{products.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                                Ready to customize
                            </p>
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">
                                Sort:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>

                        {/* Grid Size Toggle */}
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setGridCols(3)}
                                className={`p-2 rounded transition-colors ${gridCols === 3
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title="3 columns"
                            >
                                <Grid3x3 size={18} />
                            </button>
                            <button
                                onClick={() => setGridCols(4)}
                                className={`p-2 rounded transition-colors ${gridCols === 4
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title="4 columns"
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            {sortedProducts.length > 0 ? (
                <div className={`grid ${gridClass} gap-6`}>
                    {sortedProducts.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No products found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your filters or search criteria
                    </p>
                </div>
            )}
        </div>
    );
};
