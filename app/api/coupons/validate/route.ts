import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { code, cartTotal } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Code required' }, { status: 400 });
        }

        const { data: coupon, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !coupon) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
        }

        if (!coupon.is_active) {
            return NextResponse.json({ error: 'Coupon inactive' }, { status: 400 });
        }

        if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
            return NextResponse.json({ error: 'Usage limit reached' }, { status: 400 });
        }

        if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
            return NextResponse.json({ error: `Minimum order of €${coupon.min_order_amount} required` }, { status: 400 });
        }

        if (coupon.start_date && new Date() < new Date(coupon.start_date)) {
            return NextResponse.json({ error: 'Coupon not active yet' }, { status: 400 });
        }

        if (coupon.end_date && new Date() > new Date(coupon.end_date)) {
            return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (cartTotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal);

        return NextResponse.json({
            success: true,
            discountAmount,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
