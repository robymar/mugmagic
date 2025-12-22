import { useCartStore } from '@/stores/cartStore';
import { PRODUCTS } from '@/data/products';

describe('CartStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useCartStore.setState({
            items: [],
            discountCode: null,
            discountAmount: 0,
            isOpen: false,
        });
    });

    describe('addItem', () => {
        it('should add item to empty cart', () => {
            const store = useCartStore.getState();
            const mockItem = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 12.99 * 100, // in cents
            };

            store.addItem(mockItem);

            expect(store.items.length).toBe(1);
            expect(store.items[0].id).toBe('test-1');
            expect(store.isOpen).toBe(true);
        });

        it('should increase quantity for same product without variant', () => {
            const store = useCartStore.getState();
            const mockItem = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            };

            store.addItem(mockItem);
            const secondItem = { ...mockItem, id: 'test-2' };
            store.addItem(secondItem);

            expect(store.items.length).toBe(1);
            expect(store.items[0].quantity).toBe(2);
        });

        it('should add separate items for same product with different variants', () => {
            const store = useCartStore.getState();
            const baseItem = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            };

            store.addItem(baseItem);

            const variantItem = {
                ...baseItem,
                id: 'test-2',
                selectedVariant: { id: 'black', name: 'Black' },
            };
            store.addItem(variantItem);

            expect(store.items.length).toBe(2);
        });

        it('should add separate items with custom designs', () => {
            const store = useCartStore.getState();
            const item1 = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
                designId: 'design-1',
            };

            const item2 = {
                ...item1,
                id: 'test-2',
                designId: 'design-2',
            };

            store.addItem(item1);
            store.addItem(item2);

            // Customized items should always be separate
            expect(store.items.length).toBe(2);
        });
    });

    describe('removeItem', () => {
        it('should remove item from cart', () => {
            const store = useCartStore.getState();
            const mockItem = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            };

            store.addItem(mockItem);
            expect(store.items.length).toBe(1);

            store.removeItem('test-1');
            expect(store.items.length).toBe(0);
        });
    });

    describe('updateQuantity', () => {
        it('should update item quantity', () => {
            const store = useCartStore.getState();
            const mockItem = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            };

            store.addItem(mockItem);
            store.updateQuantity('test-1', 3);

            expect(store.items[0].quantity).toBe(3);
        });

        it('should remove item if quantity is set to 0', () => {
            const store = useCartStore.getState();
            const mockItem = {
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            };

            store.addItem(mockItem);
            store.updateQuantity('test-1', 0);

            expect(store.items.length).toBe(0);
        });
    });

    describe('calculations', () => {
        it('should calculate subtotal correctly', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 2,
                price: 1299,
            });

            store.addItem({
                id: 'test-2',
                productId: 'mug-15oz',
                product: PRODUCTS[1],
                quantity: 1,
                price: 1499,
            });

            const expectedSubtotal = (2 * 1299) + (1 * 1499);
            expect(store.subtotal()).toBe(expectedSubtotal);
        });

        it('should calculate shipping correctly for orders under 50', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299, // 12.99
            });

            expect(store.shipping()).toBe(500); // 5.00 shipping
        });

        it('should provide free shipping for orders over 50', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 5,
                price: 1299,
            });

            expect(store.shipping()).toBe(0);
        });

        it('should calculate total with discount', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            });

            store.applyDiscount('SAVE20');

            const subtotal = 1299;
            const shipping = 500;
            const discount = Math.floor(subtotal * 0.2);
            const expectedTotal = subtotal + shipping - discount;

            expect(store.total()).toBe(expectedTotal);
        });
    });

    describe('discount codes', () => {
        it('should apply valid percentage discount code', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 2000, // 20.00
            });

            const result = store.applyDiscount('SAVE20');

            expect(result).toBe(true);
            expect(store.discountCode).toBe('SAVE20');
            expect(store.discountAmount).toBe(400); // 20% of 2000
        });

        it('should apply valid fixed discount code', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 2000,
            });

            const result = store.applyDiscount('FREESHIP');

            expect(result).toBe(true);
            expect(store.discountCode).toBe('FREESHIP');
            expect(store.discountAmount).toBe(500); // 5.00 fixed
        });

        it('should reject invalid discount code', () => {
            const store = useCartStore.getState();
            const result = store.applyDiscount('INVALID123');

            expect(result).toBe(false);
            expect(store.discountCode).toBeNull();
            expect(store.discountAmount).toBe(0);
        });

        it('should remove discount', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 2000,
            });

            store.applyDiscount('SAVE20');
            expect(store.discountCode).toBe('SAVE20');

            store.removeDiscount();
            expect(store.discountCode).toBeNull();
            expect(store.discountAmount).toBe(0);
        });

        it('should provide free shipping with FREESHIP code even for small orders', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1000, // 10.00
            });

            store.applyDiscount('FREESHIP');
            expect(store.shipping()).toBe(0);
        });
    });

    describe('clearCart', () => {
        it('should clear all items and discounts', () => {
            const store = useCartStore.getState();
            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 1,
                price: 1299,
            });

            store.applyDiscount('SAVE20');
            store.clearCart();

            expect(store.items.length).toBe(0);
            expect(store.discountCode).toBeNull();
            expect(store.discountAmount).toBe(0);
        });
    });

    describe('cart drawer', () => {
        it('should toggle cart open/close', () => {
            const store = useCartStore.getState();

            expect(store.isOpen).toBe(false);
            store.toggleCart();
            expect(store.isOpen).toBe(true);
            store.toggleCart();
            expect(store.isOpen).toBe(false);
        });

        it('should open cart', () => {
            const store = useCartStore.getState();
            store.openCart();
            expect(store.isOpen).toBe(true);
        });

        it('should close cart', () => {
            const store = useCartStore.getState();
            store.openCart();
            store.closeCart();
            expect(store.isOpen).toBe(false);
        });
    });

    describe('itemCount', () => {
        it('should return total quantity of all items', () => {
            const store = useCartStore.getState();

            store.addItem({
                id: 'test-1',
                productId: 'mug-11oz',
                product: PRODUCTS[0],
                quantity: 2,
                price: 1299,
            });

            store.addItem({
                id: 'test-2',
                productId: 'mug-15oz',
                product: PRODUCTS[1],
                quantity: 3,
                price: 1499,
            });

            expect(store.itemCount()).toBe(5);
        });
    });
});
