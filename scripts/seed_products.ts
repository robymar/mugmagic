import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 1. Load Environment Variables
function loadEnv(filename: string): Record<string, string> {
    const envPath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(envPath)) return {};

    console.log(`Loading env from ${filename} `);
    const content = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};

    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([^=]+?)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            // Remove quotes if present
            if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    return env;
}

const envVars = {
    ...loadEnv('.env'),
    ...loadEnv('.env.development'),
    ...loadEnv('.env.local')
};

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']
    || envVars['SUPABASE_SERVICE_KEY']
    || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Missing credentials.');
    console.error('Available keys:', Object.keys(envVars).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL} `);
console.log(`Using Key: ${SUPABASE_KEY.substring(0, 10)}... (is service role: ${envVars['SUPABASE_SERVICE_ROLE_KEY'] ? 'yes' : 'no'})`);

// 2. Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// 3. Define Data
const products = [
    {
        id: 'mug-ceramic-11oz',
        name: 'Ceramic Mug 11oz Standard',
        slug: 'mug-ceramic-11oz',
        description: 'The classic "Orca Standard" 11oz ceramic mug. Perfect for all-around printing with a high-definition glossy finish. Cylindrical shape.',
        category: 'ceramic',
        base_price: 12.99,
        images: { thumbnail: "/products/mug_11oz.png", gallery: ["/products/mug_11oz.png", "/products/mug_11oz_lifestyle.png"] },
        specifications: { class: "Class I", height: "96-98mm", diameter: "81-82mm", printable_area: "200mm x 96mm", material: "Ceramic" },
        in_stock: true,
        featured: true
    },
    {
        id: 'mug-ceramic-15oz',
        name: 'Ceramic Mug 15oz El Grande',
        slug: 'mug-ceramic-15oz',
        description: 'A larger 15oz version of the classic ceramic mug. Offers more surface area for your designs and holds more of your favorite beverage.',
        category: 'ceramic',
        base_price: 15.99,
        images: { thumbnail: "/products/mug_15oz.png", gallery: ["/products/mug_15oz.png", "/products/mug_15oz_lifestyle.png"] },
        specifications: { class: "Class I", height: "117-119mm", diameter: "85-87mm", printable_area: "213mm x 103mm", material: "Ceramic" },
        in_stock: true,
        featured: false
    },
    {
        id: 'mug-latte-12oz',
        name: 'Latte Mug 12oz',
        slug: 'mug-latte-12oz',
        description: 'Elegant conical shape designed for latte lovers. Requires conical warping for perfect design transfer.',
        category: 'latte',
        base_price: 14.99,
        images: { thumbnail: "/products/latte_12oz.png", gallery: ["/products/latte_12oz.png", "/products/latte_12oz_lifestyle.png"] },
        specifications: { class: "Class II", height: "102mm", top_diameter: "94mm", bottom_diameter: "63-65mm", material: "Ceramic" },
        in_stock: true,
        featured: true
    },
    {
        id: 'mug-latte-17oz',
        name: 'Latte Mug 17oz Grande',
        slug: 'mug-latte-17oz',
        description: 'The "Grande Latte" mug. Tall and elegant, perfect for large coffee creations. Conical shape.',
        category: 'latte',
        base_price: 17.99,
        images: { thumbnail: "/products/latte_17oz.png", gallery: ["/products/latte_17oz.png", "/products/latte_17oz_lifestyle.png"] },
        specifications: { class: "Class II", height: "150-152mm", top_diameter: "88-90mm", bottom_diameter: "60mm", "material": "Ceramic" },
        in_stock: true,
        featured: false
    },
    {
        id: 'mug-enamel-12oz',
        name: 'Enamel Camp Mug 12oz',
        slug: 'mug-enamel-12oz',
        description: 'Rustic style enamel mug with a rolled silver stainless steel rim. Lightweight and durable, perfect for outdoors.',
        category: 'metal',
        base_price: 13.99,
        images: { thumbnail: "/products/camp_mug_12oz.png", gallery: ["/products/camp_mug_12oz.png", "/products/camp_mug_12oz_lifestyle.png"] },
        specifications: { class: "Class III", height: "80-82mm", diameter: "86-90mm", rim: "Rolled Stainless Steel", material: "Enamel/Steel" },
        in_stock: true,
        featured: true
    },
    {
        id: 'mug-travel-14oz',
        name: 'Stainless Steel Travel Mug 14oz',
        slug: 'mug-travel-14oz',
        description: 'Double-walled vacuum insulated travel mug. Keeps drinks hot or cold. Tapered base fits most car cup holders.',
        category: 'travel',
        base_price: 19.99,
        images: { thumbnail: "/products/travel_mug_14oz.png", gallery: ["/products/travel_mug_14oz.png", "/products/travel_mug_14oz_lifestyle.png"] },
        specifications: { class: "Class III", type: "Travel", lid: "Plastic", material: "Stainless Steel" },
        in_stock: true,
        featured: false
    },
    {
        id: 'stein-glass-16oz',
        name: 'Frosted Glass Beer Stein 16oz',
        slug: 'stein-glass-16oz',
        description: 'Classic beer stein in frosted glass. Heavy base and sturdy handle. Premium look for beverages.',
        category: 'glass',
        base_price: 18.99,
        images: { thumbnail: "/products/beer_stein_16oz.png", gallery: ["/products/beer_stein_16oz.png", "/products/beer_stein_16oz_lifestyle.png"] },
        specifications: { class: "Class IV", finish: "Frosted", base: "Heavy", material: "Glass" },
        in_stock: true,
        featured: false
    }
];

const variants = [
    { product_id: 'mug-ceramic-11oz', sku_code: 'MUG-11-WHT', name: 'Standard 11oz - White', price: 12.99, stock_quantity: 100, attributes: { color: "White" }, is_available: true },
    { product_id: 'mug-ceramic-15oz', sku_code: 'MUG-15-WHT', name: 'El Grande 15oz - White', price: 15.99, stock_quantity: 100, attributes: { color: "White" }, is_available: true },
    { product_id: 'mug-latte-12oz', sku_code: 'LAT-12-WHT', name: 'Latte 12oz - White', price: 14.99, stock_quantity: 100, attributes: { color: "White" }, is_available: true },
    { product_id: 'mug-latte-17oz', sku_code: 'LAT-17-WHT', name: 'Latte 17oz - White', price: 17.99, stock_quantity: 100, attributes: { color: "White" }, is_available: true },
    { product_id: 'mug-enamel-12oz', sku_code: 'CAMP-12-WHT', name: 'Camp Mug 12oz - White/Silver', price: 13.99, stock_quantity: 100, attributes: { color: "White", rim: "Silver" }, is_available: true },
    { product_id: 'mug-travel-14oz', sku_code: 'TRV-14-WHT', name: 'Travel Mug 14oz - White', price: 19.99, stock_quantity: 100, attributes: { color: "White" }, is_available: true },
    { product_id: 'stein-glass-16oz', sku_code: 'STN-16-FST', name: 'Beer Stein 16oz - Frosted', price: 18.99, stock_quantity: 100, attributes: { finish: "Frosted" }, is_available: true }
];

async function seed() {
    console.log('Starting seed process...');

    // Upsert Products
    for (const product of products) {
        const { error } = await supabase
            .from('products')
            .upsert(product, { onConflict: 'id' });

        if (error) {
            console.error(`Error inserting product ${product.id}: `, error);
        } else {
            console.log(`Upserted product: ${product.id} `);
        }
    }

    // Upsert Variants
    for (const variant of variants) {
        const { error } = await supabase
            .from('product_variants')
            .upsert(variant, { onConflict: 'sku_code' });

        if (error) {
            console.error(`Error inserting variant ${variant.sku_code}: `, error);
        } else {
            console.log(`Upserted variant: ${variant.sku_code} `);
        }
    }

    console.log('Seed process completed.');
}

seed().catch(console.error);
