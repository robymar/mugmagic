import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase();

        // 1. Fetch aggregation from orders
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('id, user_id, customer_email, total_amount, created_at, customer_name, payment_status');

        if (error) throw error;

        // 2. Aggregate by unique identifier (user_id preferred, else email)
        const customerMap = new Map<string, any>();

        orders.forEach(order => {
            const key = order.user_id || order.customer_email;
            if (!key) return;

            if (!customerMap.has(key)) {
                customerMap.set(key, {
                    id: order.user_id || `guest-${order.customer_email}`,
                    email: order.customer_email,
                    name: order.customer_name, // Might be null in some rows
                    orders_count: 0,
                    total_spent: 0,
                    last_order_date: null,
                    is_guest: !order.user_id,
                    created_at: order.created_at // First seen
                });
            }

            const customer = customerMap.get(key);
            customer.orders_count++;
            if (order.payment_status === 'paid') {
                customer.total_spent += order.total_amount;
            }

            // Update last order date
            if (!customer.last_order_date || new Date(order.created_at) > new Date(customer.last_order_date)) {
                customer.last_order_date = order.created_at;
                // Update name from most recent order if available
                if (order.customer_name) customer.name = order.customer_name;
            }

            // Update created_at (earliest order)
            if (new Date(order.created_at) < new Date(customer.created_at)) {
                customer.created_at = order.created_at;
            }
        });

        const customers = Array.from(customerMap.values())
            .map(c => ({
                ...c,
                aov: c.orders_count > 0 ? c.total_spent / c.orders_count : 0
            }))
            .sort((a, b) => new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime());

        // 3. Filter
        const filtered = search
            ? customers.filter(c =>
                c.email?.toLowerCase().includes(search) ||
                c.name?.toLowerCase().includes(search)
            )
            : customers;

        return NextResponse.json(filtered);

    } catch (error: any) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
