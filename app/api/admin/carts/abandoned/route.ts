import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Fetch carts that are 'pending' and updated more than 1 hour ago (for example)
        // Or just list all pending/recovered for the admin to see stats.

        // Let's just fetch all for the UI to filter
        const { data, error } = await supabaseAdmin
            .from('abandoned_carts')
            .select(`
                *,
                user:user_id (email)
            `)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Process data
        const enriched = data.map(cart => {
            // Check if "abandoned" (inactive for > 1h and pending)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const updatedAt = new Date(cart.updated_at);
            const isAbandoned = cart.recovery_status === 'pending' && updatedAt < oneHourAgo;

            return {
                ...cart,
                is_abandoned: isAbandoned,
                customer_email: cart.email || cart.user?.email || 'Guest'
            };
        });

        return NextResponse.json(enriched);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
