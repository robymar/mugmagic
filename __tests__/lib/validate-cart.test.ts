/**
 * Tests for Cart Validation
 * Validates price recalculation and security
 */

import {
    validateCart,
    calculateShipping,
    applyDiscountCode,
    calculateOrderTotal,
    CartItemInput
} from '@/lib/validate-cart';

describe('Cart Validation - Security Tests', () => {
    describe('validateCart', () => {
        it('should reject items with manipulated prices', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    variantId: 'white',
                    quantity: 1,
                    // @ts-ignore - Testing price manipulation
                    price: 0.01 // Attempt to pay €0.01
                }
            ];

            const result = validateCart(items);

            expect(result.success).toBe(true);
            // Price should be recalculated from DB, not from client
            expect(result.items![0].unitPrice).toBe(1299); // €12.99 in cents
            expect(result.items![0].totalPrice).toBe(1299);
        });

        it('should validate product exists', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'non-existent-product',
                    quantity: 1
                }
            ];

            const result = validateCart(items);

            expect(result.success).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('Product \'non-existent-product\' not found')
            );
        });

        it('should validate variant exists', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    variantId: 'purple', // Non-existent variant
                    quantity: 1
                }
            ];

            const result = validateCart(items);

            expect(result.success).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('Variant \'purple\' not found')
            );
        });

        it('should validate quantity limits', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    quantity: 9999 // Excessive quantity
                }
            ];

            const result = validateCart(items);

            expect(result.success).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('Invalid quantity')
            );
        });

        it('should check product stock', () => {
            // This would require a product that's out of stock
            // For now, all products in data/products.ts are inStock: true
            // If you add an out-of-stock product, test it here
        });

        it('should calculate correct prices with variant modifier', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    variantId: 'black', // +€2 modifier
                    quantity: 2
                }
            ];

            const result = validateCart(items);

            expect(result.success).toBe(true);
            // Base price €12.99 + variant €2.00 = €14.99 * 2 * 100 cents
            expect(result.items![0].unitPrice).toBe(1499); // €14.99
            expect(result.items![0].totalPrice).toBe(2998); // €29.98
        });

        it('should calculate subtotal correctly', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    quantity: 1
                },
                {
                    id: 'test-2',
                    productId: 'mug-15oz',
                    quantity: 1
                }
            ];

            const result = validateCart(items);

            expect(result.success).toBe(true);
            // €12.99 + €14.99 = €27.98 = 2798 cents
            expect(result.subtotal).toBe(2798);
        });

        it('should handle invalid schema gracefully', () => {
            const items = [
                {
                    // Missing required fields
                    quantity: 'not-a-number'
                }
            ] as any;

            const result = validateCart(items);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });

    describe('calculateShipping', () => {
        it('should charge €5 for orders under €50', () => {
            const shipping = calculateShipping(4999); // €49.99
            expect(shipping).toBe(500); // €5.00
        });

        it('should be free for orders €50 or more', () => {
            const shipping = calculateShipping(5000); // €50.00
            expect(shipping).toBe(0);
        });

        it('should be free for large orders', () => {
            const shipping = calculateShipping(10000); // €100.00
            expect(shipping).toBe(0);
        });
    });

    describe('applyDiscountCode', () => {
        it('should apply WELCOME10 (10% off)', () => {
            const discount = applyDiscountCode('WELCOME10', 10000); // €100
            expect(discount).toBe(1000); // €10 off
        });

        it('should apply SAVE20 (20% off)', () => {
            const discount = applyDiscountCode('SAVE20', 10000); // €100
            expect(discount).toBe(2000); // €20 off
        });

        it('should apply FREESHIP (€5 fixed)', () => {
            const discount = applyDiscountCode('FREESHIP', 10000);
            expect(discount).toBe(500); // €5 off
        });

        it('should be case-insensitive', () => {
            const discount1 = applyDiscountCode('welcome10', 10000);
            const discount2 = applyDiscountCode('WELCOME10', 10000);
            expect(discount1).toBe(discount2);
        });

        it('should return 0 for invalid codes', () => {
            const discount = applyDiscountCode('INVALID', 10000);
            expect(discount).toBe(0);
        });

        it('should round percentage discounts correctly', () => {
            const discount = applyDiscountCode('WELCOME10', 1555); // €15.55
            expect(discount).toBe(156); // €1.56 (rounded)
        });
    });

    describe('calculateOrderTotal', () => {
        it('should calculate complete order total correctly', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    product: {} as any, // Mock product
                    quantity: 1,
                    unitPrice: 1299,
                    totalPrice: 1299
                }
            ];

            const totals = calculateOrderTotal(items);

            expect(totals.subtotal).toBe(1299); // €12.99
            expect(totals.shipping).toBe(500);  // €5.00
            expect(totals.discount).toBe(0);
            expect(totals.total).toBe(1799);    // €17.99
        });

        it('should calculate with discount', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    product: {} as any,
                    quantity: 1,
                    unitPrice: 1299,
                    totalPrice: 1299
                }
            ];

            const totals = calculateOrderTotal(items, 'WELCOME10');

            expect(totals.subtotal).toBe(1299);
            expect(totals.shipping).toBe(500);
            expect(totals.discount).toBe(130); // 10% of €12.99
            expect(totals.total).toBe(1669);   // Subtotal + Shipping - Discount
        });

        it('should never go below zero', () => {
            const items = [
                {
                    id: 'test-1',
                    productId: 'mug-11oz',
                    product: {} as any,
                    quantity: 1,
                    unitPrice: 100, // €1.00
                    totalPrice: 100
                }
            ];

            const totals = calculateOrderTotal(items, 'SAVE20');

            expect(totals.total).toBeGreaterThanOrEqual(0);
        });
    });
});
