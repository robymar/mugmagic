import { NextResponse } from 'next/server';
import { getProductsFromDB, createProductInDB } from '@/lib/db/products';
import { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { productSchema } from '@/lib/validation-schemas';
import { createClient } from '@/utils/supabase/server';
import { sanitizeProductData } from '@/lib/sanitization';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Validation for reasonable limits
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        const safePage = Math.max(page, 1);

        const result = await getProductsFromDB(safePage, safeLimit);
        return NextResponse.json(result);
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

    // ---------------------------------------------------------
    // SECURITY PATCH: RBAC (Role-Based Access Control)
    // ---------------------------------------------------------
    // Query the profiles table to verify if the user has admin privileges.
    // This prevents privilege escalation attacks.
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Check if profile exists and has role 'admin'
    // If profiles table is missing or user has no role, default to deny.
    if (!profile || profile.role !== 'admin') {
        return errorResponse('Forbidden: Insufficient privileges', 403);
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

        // Sanitize product data to prevent XSS
        const sanitizedData = sanitizeProductData(data);

        const newProduct: Product = {
            id: sanitizedData.id || uuidv4(),
            slug: sanitizedData.slug || sanitizedData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            name: sanitizedData.name,
            description: sanitizedData.description || '',
            longDescription: sanitizedData.longDescription || '',
            category: sanitizedData.category,
            basePrice: Number(sanitizedData.basePrice),
            compareAtPrice: sanitizedData.compareAtPrice ? Number(sanitizedData.compareAtPrice) : undefined,
            images: sanitizedData.images || { thumbnail: '', gallery: [] },
            specifications: sanitizedData.specifications || {},
            variants: sanitizedData.variants || [],
            tags: sanitizedData.tags || [],
            inStock: sanitizedData.inStock ?? true,
            featured: sanitizedData.featured ?? false,
            bestseller: sanitizedData.bestseller ?? false,
            new: sanitizedData.new ?? true,
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
