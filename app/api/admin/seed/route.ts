import { NextResponse } from 'next/server';
import { createProductInDB } from '@/lib/db/products';
import { PRODUCTS } from '@/data/products';

export async function POST() {
    try {
        console.log('Starting DB seed...');

        const results = [];

        for (const product of PRODUCTS) {
            try {
                await createProductInDB(product);
                results.push({ id: product.id, status: 'success' });
            } catch (error) {
                console.error(`Failed to seed product ${product.id}:`, error);
                results.push({ id: product.id, status: 'error', error });
            }
        }

        return NextResponse.json({
            message: 'Seed completed',
            results
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
