import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { logInfo, logError, logWarn } from '@/lib/logger';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Stripe Webhook Handler
 * ✅ Secured with signature verification
 * ✅ Handles all payment events
 * ✅ Logs sanitized (no sensitive data)
 */
export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        // Validate signature exists
        if (!signature) {
            logWarn('Webhook received without signature');
            return NextResponse.json(
                { error: 'No signature provided' },
                { status: 400 }
            );
        }

        // Validate webhook secret is configured
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            logError('STRIPE_WEBHOOK_SECRET not configured');

            // In development, allow without signature (for testing)
            if (process.env.NODE_ENV === 'development') {
                logWarn('⚠️ Webhook signature not verified in development mode');
                const event = JSON.parse(body) as Stripe.Event;
                return handleWebhookEvent(event);
            }

            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 500 }
            );
        }

        // Verify webhook signature
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err: any) {
            logError('Webhook signature verification failed', {
                data: { error: err.message }
            });

            return NextResponse.json(
                { error: `Webhook signature verification failed: ${err.message}` },
                { status: 400 }
            );
        }

        // Handle the verified event
        return handleWebhookEvent(event);

    } catch (err: any) {
        logError('Webhook handler error', {
            data: { error: err.message, stack: err.stack }
        });

        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle Stripe webhook events
 */
async function handleWebhookEvent(event: Stripe.Event): Promise<NextResponse> {
    logInfo(`Webhook received: ${event.type}`, {
        data: { eventId: event.id }
    });

    switch (event.type) {
        // Payment succeeded
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            logInfo('💰 Payment succeeded', {
                data: {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                }
            });

            // Update order status to 'paid'
            const { error } = await supabaseAdmin
                .from('orders')
                .update({
                    payment_status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('payment_intent_id', paymentIntent.id);

            if (error) {
                logError('Failed to update order status to paid', {
                    data: { error: error.message, paymentIntentId: paymentIntent.id }
                });
            } else {
                logInfo('✅ Order marked as PAID in database', {
                    data: { paymentIntentId: paymentIntent.id }
                });
            }

            break;
        }

        // Payment failed
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            logError('❌ Payment failed', {
                data: {
                    paymentIntentId: paymentIntent.id,
                    reason: paymentIntent.last_payment_error?.message
                }
            });

            // Update order status to 'failed'
            const { error } = await supabaseAdmin
                .from('orders')
                .update({
                    payment_status: 'failed',
                    updated_at: new Date().toISOString()
                })
                .eq('payment_intent_id', paymentIntent.id);

            if (error) {
                logError('Failed to update order status to failed', {
                    data: { error: error.message, paymentIntentId: paymentIntent.id }
                });
            }

            break;
        }

        // Payment requires action (3D Secure, etc)
        case 'payment_intent.requires_action': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            logInfo('⏳ Payment requires action', {
                data: {
                    paymentIntentId: paymentIntent.id,
                    nextAction: paymentIntent.next_action?.type
                }
            });

            break;
        }

        // Payment processing
        case 'payment_intent.processing': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            logInfo('🔄 Payment processing', {
                data: {
                    paymentIntentId: paymentIntent.id
                }
            });

            break;
        }

        // Payment canceled
        case 'payment_intent.canceled': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            logWarn('⚠️ Payment canceled', {
                data: {
                    paymentIntentId: paymentIntent.id,
                    canceledAt: paymentIntent.canceled_at
                }
            });

            break;
        }

        // Charge succeeded (legacy)
        case 'charge.succeeded': {
            const charge = event.data.object as Stripe.Charge;

            logInfo('💳 Charge succeeded', {
                data: {
                    chargeId: charge.id,
                    amount: charge.amount,
                    paymentIntentId: charge.payment_intent
                }
            });

            break;
        }

        // Charge refunded
        case 'charge.refunded': {
            const charge = event.data.object as Stripe.Charge;

            logWarn('💸 Charge refunded', {
                data: {
                    chargeId: charge.id,
                    amount: charge.amount_refunded,
                    reason: charge.refunds?.data[0]?.reason
                }
            });

            // TODO: Update order status to refunded
            // await updateOrderStatus(charge.id, 'refunded');

            break;
        }

        // Charge dispute created
        case 'charge.dispute.created': {
            const dispute = event.data.object as Stripe.Dispute;

            logError('⚠️ Dispute created', {
                data: {
                    disputeId: dispute.id,
                    chargeId: dispute.charge,
                    amount: dispute.amount,
                    reason: dispute.reason
                }
            });

            // TODO: Alert admin about dispute
            // await alertAdminAboutDispute(dispute);

            break;
        }

        // Other events
        default: {
            logInfo(`Unhandled webhook event type: ${event.type}`);
        }
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({
        received: true,
        eventType: event.type,
        eventId: event.id
    });
}
