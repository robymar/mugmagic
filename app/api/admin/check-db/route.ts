import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/admin/check-db - Verify database schema and data
 * Run this to check if your Supabase database is properly set up
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const results: any = {
            status: 'checking',
            tables: {},
            summary: []
        };

        console.log('🔍 Checking database schema...\n');

        // Check products table
        try {
            const { data: products, error: productsError, count } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            if (productsError) {
                results.tables.products = {
                    exists: false,
                    error: productsError.message
                };
                results.summary.push('❌ Products table NOT found - migrations need to be applied');
            } else {
                results.tables.products = {
                    exists: true,
                    count: count || 0
                };
                results.summary.push(`✅ Products table exists (${count} products)`);

                if (count === 0) {
                    results.summary.push('⚠️  No products found - add products via /admin');
                }
            }
        } catch (e: any) {
            results.tables.products = { exists: false, error: e.message };
            results.summary.push('❌ Products table error: ' + e.message);
        }

        // Check product_variants table
        try {
            const { count } = await supabase
                .from('product_variants')
                .select('*', { count: 'exact', head: true });

            results.tables.product_variants = {
                exists: true,
                count: count || 0
            };
            results.summary.push(`✅ Product variants table exists (${count} variants)`);
        } catch (e: any) {
            results.tables.product_variants = { exists: false };
            results.summary.push('⚠️  Product variants table not found (optional)');
        }

        // Check orders table
        try {
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true });

            results.tables.orders = {
                exists: true,
                count: count || 0
            };
            results.summary.push(`✅ Orders table exists (${count} orders)`);
        } catch (e: any) {
            results.tables.orders = { exists: false };
            results.summary.push('⚠️  Orders table not found (optional)');
        }

        // Check saved_designs table
        try {
            const { count } = await supabase
                .from('saved_designs')
                .select('*', { count: 'exact', head: true });

            results.tables.saved_designs = {
                exists: true,
                count: count || 0
            };
            results.summary.push(`✅ Saved designs table exists (${count} designs)`);
        } catch (e: any) {
            results.tables.saved_designs = { exists: false };
            results.summary.push('⚠️  Saved designs table not found (optional)');
        }

        // Check stickers table
        try {
            const { count } = await supabase
                .from('stickers')
                .select('*', { count: 'exact', head: true });

            results.tables.stickers = {
                exists: true,
                count: count || 0
            };
            results.summary.push(`✅ Stickers table exists (${count} stickers)`);
        } catch (e: any) {
            results.tables.stickers = { exists: false };
            results.summary.push('⚠️  Stickers table not found (optional)');
        }

        // Check categories table
        try {
            const { count } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true });

            results.tables.categories = {
                exists: true,
                count: count || 0
            };
            results.summary.push(`✅ Categories table exists (${count} categories)`);
        } catch (e: any) {
            results.tables.categories = { exists: false };
            results.summary.push('⚠️  Categories table not found (optional)');
        }

        // Print summary to console
        console.log('\n📊 Database Check Results:');
        results.summary.forEach((msg: string) => console.log(msg));

        // Determine overall status
        if (!results.tables.products?.exists) {
            results.status = 'error';
            results.message = 'Products table not found. You need to apply migrations.';
            console.log('\n❌ DATABASE NOT READY');
            console.log('💡 To fix: Go to Supabase Dashboard → SQL Editor');
            console.log('   Run migrations from supabase/migrations/ folder');
        } else if (results.tables.products.count === 0) {
            results.status = 'warning';
            results.message = 'Database ready but no products. Add products via /admin';
            console.log('\n⚠️  DATABASE READY BUT EMPTY');
        } else {
            results.status = 'success';
            results.message = 'Database is properly configured!';
            console.log('\n✅ DATABASE READY');
        }

        return NextResponse.json(results);

    } catch (error: any) {
        console.error('❌ Database check failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            error: error
        }, { status: 500 });
    }
}
