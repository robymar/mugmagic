import { NextResponse } from 'next/server';
import { updateProductInDB, deleteProductInDB } from '@/lib/db/products';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { productSchema } from '@/lib/validation-schemas';
import { createClient } from '@/utils/supabase/server';
import { sanitizeProductData } from '@/lib/sanitization';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Rate limiting for product mutations/deletes
const productMutationAttempts = new Map<string, { count: number; resetTime: number }>();

function checkProductMutationRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000;
    const maxAttempts = 20; // Allow more for updates

    if (productMutationAttempts.size > 1000) {
        for (const [key, value] of productMutationAttempts.entries()) {
            if (value.resetTime < now) productMutationAttempts.delete(key);
        }
    }

    const attempt = productMutationAttempts.get(ip);
    if (!attempt || attempt.resetTime < now) {
        productMutationAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    if (attempt.count >= maxAttempts) {
        return { allowed: false, resetTime: attempt.resetTime };
    }

    attempt.count++;
    return { allowed: true };
}

/**
 * GET /api/products/[id] - Get product with variants
 * Public endpoint
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch product with variants from database
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (productError) {
            console.error('Error fetching product:', productError);
            return errorResponse('Product not found', 404);
        }

        // Fetch variants for this product
        const { data: variants, error: variantsError } = await supabaseAdmin
            .from('product_variants')
            .select('*')
            .eq('product_id', id)
            .eq('is_available', true)
            .order('sort_order');

        if (variantsError) {
            console.error('Error fetching variants:', variantsError);
            // Continue without variants rather than failing
        }

        return NextResponse.json({
            ...product,
            variants: variants || []
        });

    } catch (error: any) {
        console.error('Get Product Error:', error);
        return errorResponse('Failed to fetch product', 500);
    }
}

/**
 * PUT /api/products/[id] - Update product
 * Requires authentication
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    // Rate limiting
    const ip = getIP(request);
    const rateLimitCheck = checkProductMutationRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many requests', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    try {
        const { id } = await params;

        // Validate request
        const { data, error: validationError } = await validateRequest(request, productSchema);
        if (validationError) return validationError;
        if (!data) return errorResponse('Invalid request data', 400);

        // Sanitize product data
        const sanitizedData = sanitizeProductData(data);

        await updateProductInDB(id, sanitizedData);

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error: any) {
        console.error('Product Update Error:', error);
        return errorResponse('Failed to update product', 500);
    }
}

/**
 * DELETE /api/products/[id] - Delete product
 * Requires authentication
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    // Rate limiting
    const ip = getIP(request);
    const rateLimitCheck = checkProductMutationRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many requests', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    try {
        const { id } = await params;

        // Delete product
        await deleteProductInDB(id);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Product Delete Error:', error);
        return errorResponse('Failed to delete product', 500);
    }
}
