import { createClient } from '@/utils/supabase/server';
import { Product } from '@/types/product';

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
        featured: row.featured,
        bestseller: row.bestseller,
        new: row.new,
        rating: row.rating,
        reviewCount: row.review_count
    };
}

export async function getProductsFromDB() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data.map(mapRowToProduct);
}

export async function getProductBySlugFromDB(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching product by slug:', error);
        return null;
    }

    return mapRowToProduct(data);
}

export async function createProductInDB(product: Product) {
    const supabase = await createClient();

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
        featured: product.featured,
        bestseller: product.bestseller,
        new: product.new,
        rating: product.rating,
        review_count: product.reviewCount
    };

    const { error } = await supabase
        .from('products')
        .upsert(dbRow)
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        throw error;
    }

}

export async function updateProductInDB(id: string, product: Partial<Product>) {
    const supabase = await createClient();

    // Convert Partial<Product> to DB columns
    const dbRow: any = {};
    if (product.name) dbRow.name = product.name;
    if (product.slug) dbRow.slug = product.slug;
    if (product.description) dbRow.description = product.description;
    if (product.longDescription) dbRow.long_description = product.longDescription;
    if (product.category) dbRow.category = product.category;
    if (product.basePrice) dbRow.base_price = product.basePrice;
    if (product.compareAtPrice) dbRow.compare_at_price = product.compareAtPrice;
    if (product.images) dbRow.images = product.images;
    if (product.specifications) dbRow.specifications = product.specifications;
    if (product.variants) dbRow.variants = product.variants;
    if (product.tags) dbRow.tags = product.tags;
    if (product.inStock !== undefined) dbRow.in_stock = product.inStock;
    if (product.featured !== undefined) dbRow.featured = product.featured;
    if (product.bestseller !== undefined) dbRow.bestseller = product.bestseller;
    if (product.new !== undefined) dbRow.new = product.new;
    // Rating/reviews usually handled separately, but allow update if needed
    if (product.rating) dbRow.rating = product.rating;
    if (product.reviewCount) dbRow.review_count = product.reviewCount;

    const { error } = await supabase
        .from('products')
        .update(dbRow)
        .eq('id', id);

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }
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
}
