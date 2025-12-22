import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { trackOrderSchema } from '@/lib/validation-schemas';

// Rate limiting for track order (prevent enumeration attacks)
const trackAttempts = new Map<string, { count: number; resetTime: number }>();

function checkTrackRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 10;

    if (trackAttempts.size > 1000) {
        for (const [key, value] of trackAttempts.entries()) {
            if (value.resetTime < now) trackAttempts.delete(key);
        }
    }

    const attempt = trackAttempts.get(ip);
    if (!attempt || attempt.resetTime < now) {
        trackAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    if (attempt.count >= maxAttempts) {
        return { allowed: false, resetTime: attempt.resetTime };
    }

    attempt.count++;
    return { allowed: true };
}

export async function POST(req: Request) {
    // Rate limiting
    const ip = getIP(req);
    const rateLimitCheck = checkTrackRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many tracking attempts', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    try {
        // Validate request
        const { data, error: validationError } = await validateRequest(req, trackOrderSchema);
        if (validationError) return validationError;

        const { orderNumber, email } = data;

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedOrderNumber = orderNumber.trim().toUpperCase();

        // Query Supabase for matching order
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .eq('order_number', normalizedOrderNumber)
            .single();

        if (error || !order) {
            // Return generic error to prevent enumeration/leakage
            return NextResponse.json(
                { error: 'Order not found or email does not match.' },
                { status: 404 }
            );
        }

        // Validate email match
        if (order.customer_email.toLowerCase() !== normalizedEmail) {
            return NextResponse.json(
                { error: 'Order not found or email does not match.' },
                { status: 404 }
            );
        }

        // Return public-safe details
        return NextResponse.json({
            success: true,
            order: {
                order_number: order.order_number,
                status: order.payment_status, // Using payment_status as proxy for fulfillment status for now
                created_at: order.created_at,
                shipping_info: {
                    city: order.shipping_info.city,
                    country: order.shipping_info.country
                },
                items: order.order_items.map((item: any) => ({
                    name: item.product_name,
                    quantity: item.quantity,
                    variant: item.variant_name
                }))
            }
        });

    } catch (error: any) {
        console.error('Tracking API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
