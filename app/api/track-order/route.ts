import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const { orderNumber, email } = await req.json();

        if (!orderNumber || !email) {
            return NextResponse.json(
                { error: 'Order Number and Email are required' },
                { status: 400 }
            );
        }

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
