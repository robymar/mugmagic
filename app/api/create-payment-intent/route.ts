import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRODUCTS } from '@/data/products';
import { CartItem } from '@/stores/cartStore';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { createPaymentIntentSchema } from '@/lib/validation-schemas';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use a pinned version or latest
});

// Rate limiting for checkout (prevent card testing/inventory attacks)
const checkoutAttempts = new Map<string, { count: number; resetTime: number }>();

function checkCheckoutRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000 * 5; // 5 minutes window
    const maxAttempts = 10; // 10 attempts per 5 mins

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

const calculateOrderAmount = (items: CartItem[], shippingMethodId: string) => {
    // 1. Calculate Subtotal from trusted product data
    const subtotal = items.reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
        }

        // Base price
        let price = product.basePrice;

        // Variant modifier
        if (item.selectedVariant) {
            const variant = product.variants?.find((v) => v.id === item.selectedVariant?.id);
            if (variant) {
                // Mitigate "Nullifier Discount" - Ensure price doesn't go below 0 (though Schema helps too)
                price += variant.priceModifier;
                if (price < 0) price = 0;
            }
        }

        return sum + (price * item.quantity);
    }, 0);

    // 2. Calculate Shipping
    let shippingCost = 5; // Standard default

    // Free shipping threshold
    if (subtotal >= 50) {
        shippingCost = 0;
    }

    // Shipping Method overrides
    switch (shippingMethodId) {
        case 'standard': // "Standard"
            break;
        case 'express': // "Express"
            shippingCost = 10;
            break;
        case 'overnight': // "Overnight"
            shippingCost = 25;
            break;
    }

    // 3. Total
    return (subtotal + shippingCost);
};

export async function POST(req: Request) {
    // Rate Limit Check
    const ip = getIP(req);
    const rateLimitCheck = checkCheckoutRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many checkout attempts. Please wait.', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    try {
        // Validate request body
        const { data, error: validationError } = await validateRequest(req, createPaymentIntentSchema);
        if (validationError) return validationError;

        const { items, shippingInfo, shippingMethod, userId } = data;

        if (!items || items.length === 0) {
            return errorResponse('No items in cart', 400);
        }

        // ---------------------------------------------------------
        // CRITICAL: Pre-Payment Stock Check
        // ---------------------------------------------------------
        // Prevent overselling by verifying stock before creating PaymentIntent.
        for (const item of items) {
            const { data: product, error } = await supabaseAdmin
                .from('products')
                .select('stock_count, in_stock, name')
                .eq('id', item.productId)
                .single();

            if (error || !product) {
                // Fallback or error - safest is to fail checkout if product unknown in DB
                return errorResponse(`Product unavailable: ${item.productId} (Ref: DB)`, 400);
            }

            // check 'in_stock' boolean flag
            if (!product.in_stock) {
                return errorResponse(`Product "${product.name}" is currently out of stock.`, 400);
            }

            // Check numeric stock if available
            // Note: If 'stock_count' is null, we assume unlimited or not tracked
            if (typeof product.stock_count === 'number') {
                if (product.stock_count < item.quantity) {
                    return errorResponse(
                        `Insufficient stock for "${product.name}". Only ${product.stock_count} remaining.`,
                        400
                    );
                }
            }
        }

        // Calculate amount in cents
        // Note: verify currency. We assume EUR based on current app.
        const amount = calculateOrderAmount(items, shippingMethod);
        const amountInCents = Math.round(amount * 100);

        // Security: Ensure at least minimum charge (e.g. 0.50 EUR for Stripe) unless pure free
        if (amountInCents < 50) {
            return errorResponse('Order total is too low to process.', 400);
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                shipping_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                shipping_city: shippingInfo.city,
                user_id: userId || 'guest'
            }
        });

        // --- DATABASE INTEGRATION ---
        // Save pending order to Supabase
        const orderNumber = `ORD-${paymentIntent.id.slice(-8).toUpperCase()}`;

        const { error: orderError } = await supabaseAdmin.from('orders').insert({
            id: paymentIntent.id, // Link Order ID to PaymentIntent ID for easy lookup
            order_number: orderNumber,
            customer_email: shippingInfo.email,
            shipping_info: shippingInfo,
            total_amount: amount,
            payment_status: 'pending',
            payment_intent_id: paymentIntent.id,
            user_id: userId || null // Link to User if authenticated
        });

        if (orderError) {
            console.error('Error saving order:', orderError);
            // If we can't save the order, we probably shouldn't return the clientSecret
            // because the client will pay but no order will exist.
            // However, Stripe PI is created. Ideally verify DB insert first or use proper transaction.
            // For now, logging error. A robust system would cancel the PI.
        } else {
            // Save Order Items
            const orderItemsData = items.map((item: any) => ({
                order_id: paymentIntent.id,
                product_id: item.productId, // Use productId from CartItem
                product_name: PRODUCTS.find(p => p.id === item.productId)?.name || 'Unknown Product', // Get name from trusted source
                quantity: item.quantity,
                price_at_purchase: PRODUCTS.find(p => p.id === item.productId)?.basePrice || 0, // Get base price from trusted source
                variant_id: item.selectedVariant?.id || null,
                variant_name: item.selectedVariant?.name || null,
                customization_data: item.customizationData || null
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(orderItemsData);

            if (itemsError) {
                console.error('Error saving order items:', itemsError);
            }
        }

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_currency=eur&payment_intent=${paymentIntent.id}`,
        });

    } catch (error: any) {
        console.error('Stripe error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
