import { createClient } from '@/utils/supabase/server';
import { Product } from '@/types/product';
import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from '@/lib/cache';

// Convert DB row to Product type
function mapRowToProduct(row: any): Product {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        longDescription: row.long_description,
        category: row.category,
        basePrice: row.base_price,
        compareAtPrice: row.compare_at_price,
        images: row.images,
        specifications: row.specifications,
        variants: row.variants,
        tags: row.tags,
        inStock: row.in_stock,
        stockQuantity: row.stock_quantity,
        featured: row.featured,
        bestseller: row.bestseller,
        new: row.new,
        rating: row.rating,
        reviewCount: row.review_count,
        customizable: row.customizable
    };
}

export async function getProductsFromDB(page: number = 1, limit: number = 50, customClient?: SupabaseClient) {
    // Generate cache key
    const cacheKey = `products:page:${page}:limit:${limit}`;

    // Try cache first (skip cache if custom client provided)
    if (!customClient) {
        const cached = cache.get<any>(cacheKey);
        if (cached) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return cached;
        }
    }

    const supabase = customClient ?? await createClient();

    // Calculate range
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching products:', error);
        return { products: [], total: 0 };
    }

    const result = {
        products: data.map(mapRowToProduct),
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    };

    // Cache for 5 minutes
    if (!customClient) {
        cache.set(cacheKey, result, 300);
        console.log(`[Cache SET] ${cacheKey}`);
    }

    return result;
}

export async function getProductBySlugFromDB(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Product not found in DB, return null to handle fallback
            return null;
        }
        console.error('Error fetching product by slug:', JSON.stringify(error, null, 2));
        return null;
    }

    return mapRowToProduct(data);
}

export async function createProductInDB(product: Product) {
    const supabase = await createClient();

    try {
        const dbRow = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            long_description: product.longDescription,
            category: product.category,
            base_price: product.basePrice,
            compare_at_price: product.compareAtPrice,
            images: product.images,
            specifications: product.specifications,
            variants: product.variants,
            tags: product.tags,
            in_stock: product.inStock,
            stock_quantity: product.stockQuantity ?? 50,
            featured: product.featured,
            bestseller: product.bestseller,
            new: product.new,
            rating: product.rating,
            review_count: product.reviewCount,
            customizable: product.customizable ?? true
        };

        console.log('Attempting to insert product:', JSON.stringify(dbRow, null, 2));

        const { error, data } = await supabase
            .from('products')
            .upsert(dbRow)
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw error;
        }

        // Invalidate products cache
        cache.deletePattern('products:*');
        console.log('Cache invalidated after product creation');

        console.log('Product created successfully:', data);
    } catch (err: any) {
        console.error('Error in createProductInDB:', err);
        console.error('Error stack:', err.stack);
        throw new Error(`Database error: ${err.message || String(err)}`);
    }
}

export async function updateProductInDB(id: string, product: Partial<Product>) {
    const supabase = await createClient();

    // Convert Partial<Product> to DB columns
    const dbRow: any = {};
    if (product.name !== undefined) dbRow.name = product.name;
    if (product.slug !== undefined) dbRow.slug = product.slug;
    if (product.description !== undefined) dbRow.description = product.description;
    if (product.longDescription !== undefined) dbRow.long_description = product.longDescription;
    if (product.category !== undefined) dbRow.category = product.category;
    if (product.basePrice !== undefined) dbRow.base_price = product.basePrice;
    if (product.compareAtPrice !== undefined) dbRow.compare_at_price = product.compareAtPrice;
    if (product.images !== undefined) dbRow.images = product.images;
    if (product.specifications !== undefined) dbRow.specifications = product.specifications;
    if (product.variants !== undefined) dbRow.variants = product.variants;
    if (product.tags !== undefined) dbRow.tags = product.tags;
    if (product.inStock !== undefined) dbRow.in_stock = product.inStock;
    if (product.stockQuantity !== undefined) dbRow.stock_quantity = product.stockQuantity;
    if (product.featured !== undefined) dbRow.featured = product.featured;
    if (product.bestseller !== undefined) dbRow.bestseller = product.bestseller;
    if (product.new !== undefined) dbRow.new = product.new;
    if (product.customizable !== undefined) dbRow.customizable = product.customizable;
    if (product.rating !== undefined) dbRow.rating = product.rating;
    if (product.reviewCount !== undefined) dbRow.review_count = product.reviewCount;

    const { error } = await supabase
        .from('products')
        .update(dbRow)
        .eq('id', id);

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }

    // Invalidate cache
    cache.deletePattern('products:*');
    console.log('Cache invalidated after product update');
}

export async function deleteProductInDB(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }

    // Invalidate cache
    cache.deletePattern('products:*');
    console.log('Cache invalidated after product deletion');
}
