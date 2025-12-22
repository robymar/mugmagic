import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRODUCTS } from '@/data/products';
import { CartItem } from '@/stores/cartStore';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequest, errorResponse } from '@/lib/api-utils';
import { createPaymentIntentSchema } from '@/lib/validation-schemas';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use a pinned version or latest
});

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
                price += variant.priceModifier;
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
    try {
        // Validate request body
        const { data, error: validationError } = await validateRequest(req, createPaymentIntentSchema);
        if (validationError) return validationError;

        const { items, shippingInfo, shippingMethod, userId } = data;

        if (!items || items.length === 0) {
            return errorResponse('No items in cart', 400);
        }

        // Calculate amount in cents
        // Note: verify currency. We assume EUR based on current app.
        const amount = calculateOrderAmount(items, shippingMethod);
        const amountInCents = Math.round(amount * 100);

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
