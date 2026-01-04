
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restockVariants() {
    console.log('📦 Restableciendo stock de variantes...');

    // Update all variants to have 100 stock
    const { data, error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: 100, is_available: true })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all

    // Also update products main stock
    await supabase
        .from('products')
        .update({ stock_quantity: 100, in_stock: true })
        .neq('id', 'dummy');

    if (error) {
        console.error('❌ Error actualizando stock:', error);
    } else {
        console.log('✅ Stock actualizado a 100 en todos los productos y variantes');
    }
}

restockVariants();
