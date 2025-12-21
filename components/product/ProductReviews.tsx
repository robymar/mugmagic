"use client";

import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    title: string;
    comment: string;
    verified: boolean;
    helpful: number;
}

interface ProductReviewsProps {
    productId: string;
    averageRating: number;
    totalReviews: number;
}

// Mock data - En producción vendría de una API/DB
const MOCK_REVIEWS: Review[] = [
    {
        id: '1',
        author: 'Sarah M.',
        rating: 5,
        date: '2024-12-10',
        title: 'Absolutely love it!',
        comment: 'The quality is amazing and the design turned out exactly as I imagined. The 3D preview really helped me see what it would look like before ordering.',
        verified: true,
        helpful: 12
    },
    {
        id: '2',
        author: 'Mike Thompson',
        rating: 4,
        date: '2024-12-08',
        title: 'Great product, minor shipping delay',
        comment: 'Really happy with the final product. Colors are vibrant and the print quality is top-notch. Shipping took a bit longer than expected but customer service was responsive.',
        verified: true,
        helpful: 8
    },
    {
        id: '3',
        author: 'Emma L.',
        rating: 5,
        date: '2024-12-05',
        title: 'Perfect gift!',
        comment: 'Ordered this as a birthday gift for my sister and she absolutely loved it! The customization process was super easy.',
        verified: true,
        helpful: 15
    }
];

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );
};

export const ProductReviews: React.FC<ProductReviewsProps> = ({
    productId,
    averageRating,
    totalReviews
}) => {
    const ratingDistribution = [
        { stars: 5, count: 89, percentage: 70 },
        { stars: 4, count: 25, percentage: 20 },
        { stars: 3, count: 8, percentage: 6 },
        { stars: 2, count: 3, percentage: 2 },
        { stars: 1, count: 2, percentage: 2 }
    ];

    return (
        <div className="space-y-8">
            {/* Rating Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Overall Rating */}
                    <div className="text-center md:text-left">
                        <div className="text-5xl font-black text-gray-900 mb-2">
                            {averageRating.toFixed(1)}
                        </div>
                        <StarRating rating={Math.round(averageRating)} size={24} />
                        <p className="text-gray-600 mt-2">
                            Based on {totalReviews} reviews
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                        {ratingDistribution.map((dist) => (
                            <div key={dist.stars} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-16">
                                    <span className="text-sm font-medium text-gray-700">{dist.stars}</span>
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${dist.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-12 text-right">
                                    {dist.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <button className="mt-6 w-full md:w-auto px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all border border-gray-200">
                    Write a Review
                </button>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>

                {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        {/* Review Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-gray-900">{review.author}</span>
                                    {review.verified && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            ✓ Verified Purchase
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <StarRating rating={review.rating} />
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                            </div>
                        </div>

                        {/* Review Content */}
                        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        <p className="text-gray-600 leading-relaxed mb-4">{review.comment}</p>

                        {/* Helpful Button */}
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <ThumbsUp size={16} />
                            <span>Helpful ({review.helpful})</span>
                        </button>
                    </div>
                ))}

                {/* Load More */}
                <button className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all">
                    Load More Reviews
                </button>
            </div>
        </div>
    );
};
