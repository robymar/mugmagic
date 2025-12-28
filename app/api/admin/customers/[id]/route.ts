import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { searchParams } = new URL(request.url);
        const emailParam = searchParams.get('email');
        const isGuest = id.startsWith('guest-') || (emailParam && emailParam.length > 0);

        // Fetch all orders for this customer
        let query = supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (isGuest) {
            // If it's a guest, we rely on the email passed in "id" (guest-email) or query param
            // The ID might be "guest-foo@bar.com" so we strip prefix
            const email = emailParam || id.replace('guest-', '');
            query = query.eq('customer_email', email);
        } else {
            query = query.eq('user_id', id);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        if (!orders || orders.length === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Aggregate details
        // We pick the most recent order for customer details
        const latestOrder = orders[0];
        const firstOrder = orders[orders.length - 1];

        const totalSpent = orders.reduce((sum, order) => {
            return order.payment_status === 'paid' ? sum + order.total_amount : sum;
        }, 0);

        const customer = {
            id: id,
            name: latestOrder.customer_name,
            email: latestOrder.customer_email,
            phone: latestOrder.shipping_address?.phone, // Assuming structure
            created_at: firstOrder.created_at,
            orders_count: orders.length,
            total_spent: totalSpent,
            last_order_date: latestOrder.created_at,
            aov: orders.length > 0 ? totalSpent / orders.length : 0,
            avatar_url: null // Can't fetch from auth easily here without separate call, skipping for now
        };

        return NextResponse.json({ customer, orders });

    } catch (error: any) {
        console.error('Error fetching customer details:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
