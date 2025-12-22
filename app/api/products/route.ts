import { NextResponse } from 'next/server';
import { getProductsFromDB, createProductInDB } from '@/lib/db/products';
import { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { productSchema } from '@/lib/validation-schemas';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const products = await getProductsFromDB();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// Rate limiting for product creation
const createProductAttempts = new Map<string, { count: number; resetTime: number }>();

function checkProductCreationRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000;
    const maxAttempts = 10;

    if (createProductAttempts.size > 1000) {
        for (const [key, value] of createProductAttempts.entries()) {
            if (value.resetTime < now) createProductAttempts.delete(key);
        }
    }

    const attempt = createProductAttempts.get(ip);
    if (!attempt || attempt.resetTime < now) {
        createProductAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    if (attempt.count >= maxAttempts) {
        return { allowed: false, resetTime: attempt.resetTime };
    }

    attempt.count++;
    return { allowed: true };
}

export async function POST(request: Request) {
    // Check authentication (admin only)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    // Rate limiting
    const ip = getIP(request);
    const rateLimitCheck = checkProductCreationRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many requests', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    try {
        // Validate request with Zod
        const { data, error: validationError } = await validateRequest(request, productSchema);
        if (validationError) return validationError;

        const newProduct: Product = {
            id: data.id || uuidv4(),
            slug: data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            name: data.name,
            description: data.description || '',
            longDescription: data.longDescription || '',
            category: data.category,
            basePrice: Number(data.basePrice),
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
            images: data.images || { thumbnail: '', gallery: [] },
            specifications: data.specifications || {},
            variants: data.variants || [],
            tags: data.tags || [],
            inStock: data.inStock ?? true,
            featured: data.featured ?? false,
            bestseller: data.bestseller ?? false,
            new: data.new ?? true,
            rating: 0,
            reviewCount: 0
        };

        await createProductInDB(newProduct);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
