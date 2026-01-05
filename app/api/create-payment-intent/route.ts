/**
 * Create Payment Intent Endpoint (Enhanced)
 * 
 * Improvements:
 * - Idempotency support to prevent double charges
 * - Stock reservation validation
 * - Variant-based pricing
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { createPaymentIntentSchema, CartItemInput } from '@/lib/validation-schemas';
import { withIdempotency, getIdempotencyKey } from '@/lib/idempotency-middleware';
import { areReservationsValid } from '@/lib/stock-reservation';
import { getVariantById } from '@/lib/db/variants';
import { logInfo, logError, logWarn } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

// Rate limiting
const checkoutAttempts = new Map<string, { count: number; resetTime: number }>();

function checkCheckoutRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000 * 5; // 5 minutes
    const maxAttempts = 10;

    if (checkoutAttempts.size > 1000) {
        for (const [key, value] of checkoutAttempts.entries()) {
            if (value.resetTime < now) checkoutAttempts.delete(key);
        }
    }

    const attempt = checkoutAttempts.get(ip);
    if (!attempt || attempt.resetTime < now) {
        checkoutAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    if (attempt.count >= maxAttempts) {
        return { allowed: false, resetTime: attempt.resetTime };
    }

    attempt.count++;
    return { allowed: true };
}

/**
 * Calculate order amount from variants (not hardcoded products)
 */
async function calculateOrderAmountFromVariants(
    items: CartItemInput[],
    shippingMethodId: string
): Promise<number> {
    let subtotal = 0;

    for (const item of items) {
        // Get variant from database
        const variant = await getVariantById(item.selectedVariant?.id || item.productId);

        if (!variant) {
            throw new Error(`Variant not found: ${item.selectedVariant?.id || item.productId}`);
        }

        if (!variant.is_available) {
            throw new Error(`Variant ${variant.name} is no longer available`);
        }

        // SECURITY: Validate that variant belongs to the specified product
        // This prevents price manipulation by sending mismatched product/variant IDs
        if (item.productId && variant.product_id !== item.productId) {
            throw new Error(
                `Security violation: Variant ${variant.id} does not belong to product ${item.productId}`
            );
        }

        // SECURITY: Validate quantity is within reasonable limits
        if (item.quantity < 1 || item.quantity > 99) {
            throw new Error(`Invalid quantity: ${item.quantity}. Must be between 1 and 99`);
        }

        // SECURITY: Validate stock availability
        if (variant.stock_quantity < item.quantity) {
            throw new Error(
                `Insufficient stock for ${variant.name}. ` +
                `Available: ${variant.stock_quantity}, Requested: ${item.quantity}`
            );
        }

        // Use variant's price directly (no modifiers needed)
        subtotal += variant.price * item.quantity;
    }

    // Calculate shipping
    let shippingCost = 5;

    if (subtotal >= 50) {
        shippingCost = 0; // Free shipping over €50
    }

    switch (shippingMethodId) {
        case 'express':
            shippingCost = 10;
            break;
        case 'overnight':
            shippingCost = 25;
            break;
    }

    return subtotal + shippingCost;
}

async function handlePaymentIntentCreation(req: Request) {
    // Rate limit check
    const ip = getIP(req);
    const rateLimitCheck = checkCheckoutRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many checkout attempts. Please wait.', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    // Validate request
    const { data, error: validationError } = await validateRequest(req, createPaymentIntentSchema);
    if (validationError) return validationError;

    const { items, shippingInfo, shippingMethodId, checkout_id } = data!;

    logInfo('Payment intent creation started', {
        data: { itemCount: items.length, checkoutId: checkout_id, ip }
    });

    // CRITICAL: Verify reservations are still valid
    if (checkout_id) {
        const reservationsValid = await areReservationsValid(checkout_id);

        if (!reservationsValid) {
            logWarn('Reservations expired or invalid', { data: { checkout_id } });
            return errorResponse(
                'Your cart reservation has expired. Please start checkout again.',
                400,
                { code: 'RESERVATION_EXPIRED' }
            );
        }
    } else {
        logWarn('No checkout_id provided - proceeding without reservation check');
    }

    try {
        // Calculate amount from database variants (server-side pricing)
        const amount = await calculateOrderAmountFromVariants(items, shippingMethodId || 'standard');

        if (amount <= 0) {
            return errorResponse('Invalid amount calculated', 400);
        }

        logInfo('Order amount calculated', { data: { amount, currency: 'eur' } });

        // Create Stripe Payment Intent with idempotency
        const idempotencyKey = getIdempotencyKey(req);
        const stripeIdempotencyKey = idempotencyKey || `pi_${randomUUID()}`;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                checkout_id: checkout_id || 'no_checkout_id',
                customer_email: shippingInfo.email,
                item_count: items.length.toString()
            }
        }, {
            idempotencyKey: stripeIdempotencyKey
        });

        // Save pending order to database
        const orderNumber = `ORD-${Date.now()}`;

        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                id: paymentIntent.id,
                order_number: orderNumber,
                customer_email: shippingInfo.email,
                shipping_info: shippingInfo,
                total_amount: amount,
                payment_status: 'pending',
                payment_intent_id: paymentIntent.id
            })
            .select()
            .single();

        if (orderError) {
            logError('Failed to create order record', { data: orderError });
            // Continue anyway - webhook will handle this
        }

        // Save order items with snapshots
        if (orderData) {
            const orderItems = await Promise.all(items.map(async (item) => {
                const variant = await getVariantById(item.selectedVariant?.id || item.productId);

                return {
                    order_id: orderData.id,
                    product_id: item.productId,
                    product_name: variant?.name || 'Unknown Product',
                    quantity: item.quantity,
                    price_at_purchase: variant?.price || 0,
                    variant_id: variant?.id,
                    variant_name: variant?.name,
                    customization_data: item.customizationData || null
                };
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                logError('Failed to create order items', { data: itemsError });
            }
        }

        logInfo('Payment intent created successfully', {
            data: { paymentIntentId: paymentIntent.id, orderNumber }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            orderNumber,
            amount
        });

    } catch (error: any) {
        logError('Payment intent creation failed', { data: error });

        if (error.type === 'StripeCardError') {
            return errorResponse(error.message, 400);
        }

        return errorResponse('Unable to process payment. Please try again.', 500);
    }
}

// Wrap with idempotency middleware
export const POST = withIdempotency(handlePaymentIntentCreation, false);
