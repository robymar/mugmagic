import { NextResponse } from 'next/server';
import { createProductInDB } from '@/lib/db/products';
import { PRODUCTS } from '@/data/products';
import { requireAuth } from '@/lib/api-utils';

export async function POST(request: Request) {
    try {
        // CRITICAL: Only authenticated admin users should seed the database
        const user = await requireAuth(request, 'admin');

        if (!user) {
            return NextResponse.json(
                { error: 'Forbidden - Admin role required' },
                { status: 403 }
            );
        }

        // SECURITY: In production, check if user has admin role
        // For now, any authenticated user can seed (development only)
        if (process.env.NODE_ENV === 'production') {
            // TODO: Check user.role === 'admin' or similar
            return NextResponse.json(
                { error: 'Seed endpoint disabled in production' },
                { status: 403 }
            );
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Starting DB seed...');
        }

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
