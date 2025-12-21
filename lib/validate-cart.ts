import { z } from 'zod';
import { getProductById } from '@/data/products';
import { Product, ProductVariant } from '@/types/product';

/**
 * Schema for validating cart items from client
 * NEVER trust prices from client - only IDs and quantities
 */
export const CartItemInputSchema = z.object({
    id: z.string().min(1), // Cart item ID
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).max(99),
    designId: z.string().optional(),
    previewUrl: z.string().optional(),
    customizationData: z.object({
        designSnapshot: z.string(),
        canvasJson: z.string()
    }).optional()
});

export type CartItemInput = z.infer<typeof CartItemInputSchema>;

/**
 * Validated cart item with server-calculated price
 */
export interface ValidatedCartItem {
    id: string;
    productId: string;
    product: Product;
    variantId?: string;
    variant?: ProductVariant;
    quantity: number;
    unitPrice: number; // In cents
    totalPrice: number; // In cents (unitPrice × quantity)
    designId?: string;
    customizationData?: {
        designSnapshot: string;
        canvasJson: string;
    };
}

/**
 * Validation result
 */
export interface CartValidationResult {
    success: boolean;
    items?: ValidatedCartItem[];
    subtotal?: number; // In cents
    errors?: string[];
}

/**
 * Validate and recalculate cart items on server
 * This prevents price manipulation attacks
 * 
 * @param items - Cart items from client (UNTRUSTED)
 * @returns Validated items with server-calculated prices
 */
export function validateCart(items: unknown[]): CartValidationResult {
    const errors: string[] = [];
    const validatedItems: ValidatedCartItem[] = [];

    // Validate each item
    for (let i = 0; i < items.length; i++) {
        const itemIndex = i + 1;

        // Parse with Zod schema
        const parsed = CartItemInputSchema.safeParse(items[i]);

        if (!parsed.success) {
            errors.push(`Item ${itemIndex}: Invalid format - ${parsed.error.message}`);
            continue;
        }

        const item = parsed.data;

        // Get product from database (SERVER SOURCE OF TRUTH)
        const product = getProductById(item.productId);

        if (!product) {
            errors.push(`Item ${itemIndex}: Product '${item.productId}' not found`);
            continue;
        }

        // Check stock
        if (!product.inStock) {
            errors.push(`Item ${itemIndex}: Product '${product.name}' is out of stock`);
            continue;
        }

        // Validate variant if specified
        let variant: ProductVariant | undefined;

        if (item.variantId) {
            variant = product.variants?.find(v => v.id === item.variantId);

            if (!variant) {
                errors.push(`Item ${itemIndex}: Variant '${item.variantId}' not found for product '${product.name}'`);
                continue;
            }
        }

        // ✅ CALCULATE PRICE ON SERVER (SOURCE OF TRUTH)
        const basePrice = product.basePrice;
        const variantModifier = variant?.priceModifier || 0;
        const unitPriceEuros = basePrice + variantModifier;
        const unitPriceCents = Math.round(unitPriceEuros * 100); // Convert to cents
        const totalPriceCents = unitPriceCents * item.quantity;

        // Validate quantity
        if (item.quantity < 1 || item.quantity > 99) {
            errors.push(`Item ${itemIndex}: Invalid quantity ${item.quantity} (must be 1-99)`);
            continue;
        }

        // Create validated item
        validatedItems.push({
            id: item.id,
            productId: item.productId,
            product: product,
            variantId: item.variantId,
            variant: variant,
            quantity: item.quantity,
            unitPrice: unitPriceCents,
            totalPrice: totalPriceCents,
            designId: item.designId,
            customizationData: item.customizationData
        });
    }

    // Return errors if any
    if (errors.length > 0) {
        return {
            success: false,
            errors
        };
    }

    // Calculate subtotal
    const subtotal = validatedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    return {
        success: true,
        items: validatedItems,
        subtotal
    };
}

/**
 * Calculate shipping cost based on subtotal
 * @param subtotalCents - Subtotal in cents
 * @returns Shipping cost in cents
 */
export function calculateShipping(subtotalCents: number): number {
    const subtotalEuros = subtotalCents / 100;

    // Free shipping over €50
    if (subtotalEuros >= 50) {
        return 0;
    }

    // Standard shipping €5
    return 500; // 5 euros in cents
}

/**
 * Apply discount code
 * @param code - Discount code
 * @param subtotalCents - Subtotal before discount
 * @returns Discount amount in cents
 */
export function applyDiscountCode(code: string, subtotalCents: number): number {
    const upperCode = code.toUpperCase();

    const discountCodes: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
        'FREESHIP': { type: 'fixed', value: 500 }, // €5 off
        'WELCOME10': { type: 'percentage', value: 10 }, // 10% off
        'SAVE20': { type: 'percentage', value: 20 } // 20% off
    };

    const discount = discountCodes[upperCode];

    if (!discount) {
        return 0;
    }

    if (discount.type === 'percentage') {
        return Math.round((subtotalCents * discount.value) / 100);
    }

    return discount.value;
}

/**
 * Calculate final order total
 * @param items - Validated cart items
 * @param discountCode - Optional discount code
 * @returns Order totals
 */
export function calculateOrderTotal(
    items: ValidatedCartItem[],
    discountCode?: string
) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = calculateShipping(subtotal);
    const discount = discountCode ? applyDiscountCode(discountCode, subtotal) : 0;
    const total = Math.max(0, subtotal + shipping - discount);

    return {
        subtotal, // cents
        shipping, // cents
        discount, // cents
        total // cents
    };
}
