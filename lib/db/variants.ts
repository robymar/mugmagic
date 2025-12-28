/**
 * Database layer for Product Variants
 * Handles all variant-related database operations
 */

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { ProductVariant } from '@/types/product';
import { cache } from '@/lib/cache';

/**
 * Get all variants for a product
 * @param productId - Product ID
 * @param includeUnavailable - Include unavailable variants
 * @returns Array of variants
 */
export async function getVariantsByProduct(
    productId: string,
    includeUnavailable: boolean = false
): Promise<ProductVariant[]> {
    const cacheKey = `variants:product:${productId}:available:${!includeUnavailable}`;

    // Try cache first
    const cached = cache.get<ProductVariant[]>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        let query = supabaseAdmin
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (!includeUnavailable) {
            query = query.eq('is_available', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching variants:', error);
            return [];
        }

        const variants = data || [];

        // Cache for 5 minutes
        cache.set(cacheKey, variants, 300);

        return variants;
    } catch (error) {
        console.error('Exception in getVariantsByProduct:', error);
        return [];
    }
}

/**
 * Get variant by SKU code
 * @param skuCode - SKU code
 * @returns Variant or null
 */
export async function getVariantBySKU(skuCode: string): Promise<ProductVariant | null> {
    const cacheKey = `variant:sku:${skuCode}`;

    const cached = cache.get<ProductVariant>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('product_variants')
            .select('*')
            .eq('sku_code', skuCode)
            .single();

        if (error || !data) {
            return null;
        }

        cache.set(cacheKey, data, 300);
        return data;
    } catch (error) {
        console.error('Exception in getVariantBySKU:', error);
        return null;
    }
}

/**
 * Get variant by ID
 * @param variantId - Variant ID
 * @returns Variant or null
 */
export async function getVariantById(variantId: string): Promise<ProductVariant | null> {
    const cacheKey = `variant:id:${variantId}`;

    const cached = cache.get<ProductVariant>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('product_variants')
            .select('*')
            .eq('id', variantId)
            .single();

        if (error || !data) {
            return null;
        }

        cache.set(cacheKey, data, 300);
        return data;
    } catch (error) {
        console.error('Exception in getVariantById:', error);
        return null;
    }
}

/**
 * Create new product variant
 * @param variant - Variant data
 * @returns Created variant or null
 */
export async function createVariant(
    variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductVariant | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('product_variants')
            .insert(variant)
            .select()
            .single();

        if (error) {
            console.error('Error creating variant:', error);
            return null;
        }

        // Invalidate cache
        cache.deletePattern(`variants:product:${variant.product_id}:*`);

        return data;
    } catch (error) {
        console.error('Exception in createVariant:', error);
        return null;
    }
}

/**
 * Update variant
 * @param variantId - Variant ID
 * @param updates - Fields to update
 * @returns Success boolean
 */
export async function updateVariant(
    variantId: string,
    updates: Partial<Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('product_variants')
            .update(updates)
            .eq('id', variantId);

        if (error) {
            console.error('Error updating variant:', error);
            return false;
        }

        // Invalidate cache
        cache.deletePattern('variants:*');
        cache.deletePattern(`variant:id:${variantId}`);

        return true;
    } catch (error) {
        console.error('Exception in updateVariant:', error);
        return false;
    }
}

/**
 * Update variant stock
 * @param variantId - Variant ID
 * @param quantity - New stock quantity
 * @returns Success boolean
 */
export async function updateVariantStock(
    variantId: string,
    quantity: number
): Promise<boolean> {
    return updateVariant(variantId, { stock_quantity: quantity });
}

/**
 * Delete variant
 * @param variantId - Variant ID
 * @returns Success boolean
 */
export async function deleteVariant(variantId: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('product_variants')
            .delete()
            .eq('id', variantId);

        if (error) {
            console.error('Error deleting variant:', error);
            return false;
        }

        // Invalidate cache
        cache.deletePattern('variants:*');
        cache.deletePattern(`variant:id:${variantId}`);

        return true;
    } catch (error) {
        console.error('Exception in deleteVariant:', error);
        return false;
    }
}

/**
 * Check if variant has sufficient stock
 * @param variantId - Variant ID
 * @param quantity - Requested quantity
 * @returns True if stock is sufficient
 */
export async function checkVariantStock(
    variantId: string,
    quantity: number
): Promise<boolean> {
    try {
        const variant = await getVariantById(variantId);

        if (!variant || !variant.is_available) {
            return false;
        }

        return variant.stock_quantity >= quantity;
    } catch (error) {
        console.error('Exception in checkVariantStock:', error);
        return false;
    }
}

/**
 * Get multiple variants by IDs
 * @param variantIds - Array of variant IDs
 * @returns Array of variants
 */
export async function getVariantsByIds(variantIds: string[]): Promise<ProductVariant[]> {
    if (variantIds.length === 0) {
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('product_variants')
            .select('*')
            .in('id', variantIds);

        if (error) {
            console.error('Error fetching variants by IDs:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception in getVariantsByIds:', error);
        return [];
    }
}
