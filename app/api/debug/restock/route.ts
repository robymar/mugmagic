import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        // Update variants
        const { error: variantError } = await supabaseAdmin
            .from('product_variants')
            .update({ stock_quantity: 10000, is_available: true })
            .neq('stock_quantity', 10000); // Simple filter to affect rows

        // Update products
        const { error: productError } = await supabaseAdmin
            .from('products')
            .update({ stock_quantity: 10000, in_stock: true })
            .neq('stock_quantity', 10000);

        // Clear reservations (optional, to free up "pending" stock logic)
        // const { error: reservationError } = await supabaseAdmin.from('stock_reservations').delete().neq('id', 0);

        return NextResponse.json({
            success: true,
            message: 'Stock reset to 10000 for all items',
            errors: { variantError, productError }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
