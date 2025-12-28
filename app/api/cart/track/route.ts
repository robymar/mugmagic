import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // We assume the frontend sends:
        // { 
        //   user_id: string | null, 
        //   email: string | null, 
        //   items: any[], 
        //   total_amount: number,
        //   session_id: string 
        // }

        // Check if a cart already exists for this session or user
        let query = supabaseAdmin.from('abandoned_carts').select('id, recovery_status');

        if (body.user_id) {
            query = query.eq('user_id', body.user_id);
        } else if (body.session_id) {
            query = query.eq('session_id', body.session_id);
        } else {
            return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });
        }

        // We only want to update "pending" carts. If it's already "recovered", we start a new one?
        // For simplicity, we'll try to update the latest pending one, or create new.
        query = query.eq('recovery_status', 'pending').order('created_at', { ascending: false }).limit(1);

        const { data: existingCarts } = await query;
        const existingCart = existingCarts?.[0];

        if (existingCart) {
            // Update
            const { error } = await supabaseAdmin
                .from('abandoned_carts')
                .update({
                    items: body.items,
                    total_amount: body.total_amount,
                    email: body.email, // In case they entered it later
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingCart.id);

            if (error) throw error;
            return NextResponse.json({ success: true, id: existingCart.id, action: 'updated' });
        } else {
            // Insert
            const { data, error } = await supabaseAdmin
                .from('abandoned_carts')
                .insert({
                    user_id: body.user_id || null,
                    session_id: body.session_id,
                    email: body.email || null,
                    items: body.items,
                    total_amount: body.total_amount,
                    recovery_status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, id: data.id, action: 'created' });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
