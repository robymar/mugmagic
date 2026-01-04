import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const { error } = await supabaseAdmin.rpc('get_available_stock', { p_variant_id: '00000000-0000-0000-0000-000000000000' });

        // We can't easily alter functions via RPC unless we have a specific 'exec_sql' function.
        // Assuming we don't.

        // Instead, let's verify if we can just create a reservation forced via API ? No.

        // Let's try to debug WHY stock is 0.
        // Get all variants
        const { data: variants } = await supabaseAdmin.from('product_variants').select('*').limit(5);

        return NextResponse.json({
            success: true,
            variants
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
