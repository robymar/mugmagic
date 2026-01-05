import { NextResponse } from 'next/server';
import { createProductInDB } from '@/lib/db/products';
import { PRODUCTS } from '@/data/products';
import { requireAuth } from '@/lib/api-utils';

export async function POST(request: Request) {
    try {
        // CRITICAL SECURITY: Verify admin role from profiles table
        const user = await requireAuth(request, 'admin');

        if (!user) {
            return NextResponse.json(
                { error: 'Forbidden - Admin role required' },
                { status: 403 }
            );
        }

        // Double-check admin role in production
        if (process.env.NODE_ENV === 'production') {
            // Import Supabase client
            const { createServerClient } = await import('@supabase/ssr');
            const { cookies } = await import('next/headers');

            const cookieStore = await cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll(); },
                        setAll(cookiesToSet: any[]) {
                            try {
                                cookiesToSet.forEach(({ name, value, options }) =>
                                    cookieStore.set(name, value, options)
                                );
                            } catch { }
                        },
                    },
                }
            );

            // Verify role from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile || profile.role !== 'admin') {
                console.warn(`Unauthorized seed attempt by user ${user.id}`);
                return NextResponse.json(
                    { error: 'Forbidden - Admin role required' },
                    { status: 403 }
                );
            }
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
