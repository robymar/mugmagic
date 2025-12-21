import { Product, ProductVariant } from '@/types/product';

// Common variants for mugs
const COMMON_VARIANTS: ProductVariant[] = [
    {
        id: 'white',
        name: 'White',
        color: 'White',
        hexCode: '#FFFFFF',
        priceModifier: 0
    },
    {
        id: 'black',
        name: 'Black',
        color: 'Black',
        hexCode: '#1a1a1a',
        priceModifier: 2
    },
    {
        id: 'blue',
        name: 'Ocean Blue',
        color: 'Blue',
        hexCode: '#3b82f6',
        priceModifier: 1.5
    },
    {
        id: 'red',
        name: 'Cherry Red',
        color: 'Red',
        hexCode: '#ef4444',
        priceModifier: 1.5
    }
];

export const PRODUCTS: Product[] = [
    {
        id: 'mug-11oz',
        name: 'Classic Mug 11oz',
        slug: 'classic-mug-11oz',
        description: 'Perfect for your daily coffee ritual. Comfortable handle, dishwasher safe.',
        longDescription: 'Start your day right with our Classic 11oz Mug. Crafted from premium ceramic, this mug is perfect for coffee, tea, or hot chocolate. The generous 11oz capacity means fewer refills, while the comfortable C-handle ensures a secure grip. Personalize it with your own designs, photos, or text to make it uniquely yours.',
        category: 'mug',
        basePrice: 12.99,
        compareAtPrice: 15.99,
        images: {
            thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop'
            ]
        },
        specifications: {
            capacity: '11oz (325ml)',
            dimensions: {
                width: 82,
                height: 95,
                diameter: 80
            },
            weight: '350g',
            material: 'Premium Ceramic',
            printableArea: {
                width: 200,
                height: 90
            },
            dishwasherSafe: true,
            microwaveSafe: true
        },
        variants: COMMON_VARIANTS,
        tags: ['bestseller', 'classic', 'everyday'],
        inStock: true,
        featured: true,
        bestseller: true,
        rating: 4.8,
        reviewCount: 127
    },
    {
        id: 'mug-15oz',
        name: 'Large Mug 15oz',
        slug: 'large-mug-15oz',
        description: 'Extra capacity for coffee lovers. Bold size, bold personality.',
        longDescription: 'For those who need their caffeine fix in larger doses, our 15oz Large Mug is the perfect companion. With 40% more capacity than standard mugs, you can enjoy extended sipping sessions without constant refills. The ergonomic handle is designed for comfort, even when filled to the brim. Microwave and dishwasher safe for your convenience.',
        category: 'mug',
        basePrice: 14.99,
        images: {
            thumbnail: 'https://images.unsplash.com/photo-1571781418606-70265b9cce90?w=400&h=400&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1571781418606-70265b9cce90?w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&h=800&fit=crop'
            ]
        },
        specifications: {
            capacity: '15oz (445ml)',
            dimensions: {
                width: 90,
                height: 115,
                diameter: 85
            },
            weight: '420g',
            material: 'Premium Ceramic',
            printableArea: {
                width: 220,
                height: 105
            },
            dishwasherSafe: true,
            microwaveSafe: true
        },
        variants: COMMON_VARIANTS,
        tags: ['large', 'coffee-lover', 'trending'],
        inStock: true,
        featured: true,
        new: true,
        rating: 4.7,
        reviewCount: 89
    },
    {
        id: 'travel-mug',
        name: 'Travel Mug 12oz',
        slug: 'travel-mug-12oz',
        description: 'Insulated stainless steel. Keeps drinks hot for 6h, cold for 12h.',
        longDescription: 'Take your favorite beverages on the go with our premium Travel Mug. Double-wall vacuum insulation keeps your coffee piping hot for up to 6 hours or your iced drinks refreshingly cold for 12 hours. The leak-proof lid with sliding closure prevents spills in your bag. Perfect for commutes, road trips, or outdoor adventures.',
        category: 'mug',
        basePrice: 18.99,
        compareAtPrice: 24.99,
        images: {
            thumbnail: 'https://images.unsplash.com/photo-1534056916343-e6ef3c0e93cc?w=400&h=400&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1534056916343-e6ef3c0e93cc?w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop'
            ]
        },
        specifications: {
            capacity: '12oz (355ml)',
            dimensions: {
                width: 75,
                height: 180,
                diameter: 75
            },
            weight: '280g',
            material: 'Stainless Steel (18/8)',
            printableArea: {
                width: 180,
                height: 85
            },
            dishwasherSafe: false, // Hand wash recommended
            microwaveSafe: false
        },
        variants: [
            {
                id: 'silver',
                name: 'Brushed Silver',
                color: 'Silver',
                hexCode: '#C0C0C0',
                priceModifier: 0
            },
            {
                id: 'matte-black',
                name: 'Matte Black',
                color: 'Black',
                hexCode: '#2d2d2d',
                priceModifier: 2
            },
            {
                id: 'rose-gold',
                name: 'Rose Gold',
                color: 'Rose Gold',
                hexCode: '#e0a899',
                priceModifier: 3
            }
        ],
        tags: ['travel', 'insulated', 'portable'],
        inStock: true,
        featured: true,
        bestseller: true,
        rating: 4.9,
        reviewCount: 203
    },
    {
        id: 'camping-mug',
        name: 'Enamel Camping Mug',
        slug: 'camping-mug',
        description: 'Vintage enamel design. Perfect for outdoor adventures and campfires.',
        longDescription: 'Channel your inner adventurer with our classic Enamel Camping Mug. Inspired by traditional camping gear, this mug combines nostalgic aesthetics with modern durability. The enamel coating is resistant to chips and scratches, while the rolled rim ensures comfortable sipping. Lightweight yet sturdy, it\'s perfect for camping, hiking, or just adding a rustic touch to your kitchen.',
        category: 'mug',
        basePrice: 11.99,
        images: {
            thumbnail: 'https://images.unsplash.com/photo-1622543186523-aa785a966caa?w=400&h=400&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1622543186523-aa785a966caa?w=800&h=800&fit=crop',
                'https://images.unsplash.com/photo-1606854428728-5fe3eea23475?w=800&h=800&fit=crop'
            ]
        },
        specifications: {
            capacity: '12oz (350ml)',
            dimensions: {
                width: 85,
                height: 82,
                diameter: 90
            },
            weight: '180g',
            material: 'Enamel-Coated Steel',
            printableArea: {
                width: 185,
                height: 75
            },
            dishwasherSafe: false,
            microwaveSafe: false
        },
        variants: [
            {
                id: 'cream',
                name: 'Vintage Cream',
                color: 'Cream',
                hexCode: '#f5f5dc',
                priceModifier: 0
            },
            {
                id: 'forest-green',
                name: 'Forest Green',
                color: 'Green',
                hexCode: '#228b22',
                priceModifier: 1
            },
            {
                id: 'navy-blue',
                name: 'Navy Blue',
                color: 'Navy',
                hexCode: '#000080',
                priceModifier: 1
            }
        ],
        tags: ['camping', 'outdoor', 'vintage', 'lightweight'],
        inStock: true,
        featured: false,
        new: true,
        rating: 4.6,
        reviewCount: 54
    }
];

// Helper functions
export function getProductById(id: string): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
    return PRODUCTS.find(p => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
    return PRODUCTS.filter(p => p.featured);
}

export function getBestsellers(): Product[] {
    return PRODUCTS.filter(p => p.bestseller);
}

export function getProductsByCategory(category: string): Product[] {
    return PRODUCTS.filter(p => p.category === category);
}
