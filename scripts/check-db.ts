/**
 * Database Schema Verification Script
 * Checks if all required tables and data exist in Supabase
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Checking database schema...\n');

    // Check if products table exists
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .limit(1);

    if (productsError) {
        console.error('❌ Products table error:', productsError.message);
        console.error('   This means the migrations have NOT been applied.');
        console.error('\n💡 To fix this, go to your Supabase dashboard:');
        console.error('   1. Go to https://supabase.com/dashboard');
        console.error('   2. Select your project');
        console.error('   3. Go to SQL Editor');
        console.error('   4. Run the migrations from supabase/migrations/ folder');
        return false;
    }

    console.log('✅ Products table exists');

    // Check product count
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    console.log(`📦 Products in database: ${productCount}`);

    if (productCount === 0) {
        console.log('⚠️  No products found - you need to add some products!');
        console.log('   Go to http://localhost:3000/admin to add products');
    }

    // Check product_variants table
    const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id')
        .limit(1);

    if (variantsError) {
        console.log('⚠️  Product variants table not found (optional)');
    } else {
        console.log('✅ Product variants table exists');
    }

    // Check orders table
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

    if (ordersError) {
        console.log('⚠️  Orders table not found (optional)');
    } else {
        console.log('✅ Orders table exists');
    }

    // Check saved_designs table
    const { data: designs, error: designsError } = await supabase
        .from('saved_designs')
        .select('id')
        .limit(1);

    if (designsError) {
        console.log('⚠️  Saved designs table not found (optional)');
    } else {
        console.log('✅ Saved designs table exists');
    }

    // Check stickers table
    const { data: stickers, error: stickersError } = await supabase
        .from('stickers')
        .select('id')
        .limit(1);

    if (stickersError) {
        console.log('⚠️  Stickers table not found (optional)');
    } else {
        const { count: stickerCount } = await supabase
            .from('stickers')
            .select('*', { count: 'exact', head: true });
        console.log(`✅ Stickers table exists (${stickerCount} stickers)`);
    }

    console.log('\n✅ Database check complete!');
    return true;
}

checkDatabase()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
