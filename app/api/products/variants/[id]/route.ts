import { NextResponse } from 'next/server';
import { updateVariant } from '@/lib/db/variants';
import { z } from 'zod';

const updateVariantSchema = z.object({
    price: z.number().optional(),
    stock_quantity: z.number().int().min(0).optional(),
    is_available: z.boolean().optional(),
    sku_code: z.string().optional()
});

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Validation
        const result = updateVariantSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        const success = await updateVariant(params.id, result.data);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update variant' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in variant update:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
