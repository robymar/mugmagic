import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types/product';

export interface CartItem {
    id: string;
    productId: string;
    product: Product; // Full product data
    selectedVariant?: ProductVariant;
    quantity: number;
    price: number; // Base price + variant modifier
    designId?: string;
    previewUrl?: string;
    customizationData?: {
        designSnapshot: string;
        canvasJson: string;
    };
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    discountCode: string | null;
    discountAmount: number;

    // Actions
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    applyDiscount: (code: string) => boolean;
    removeDiscount: () => void;

    // Computed
    subtotal: () => number;
    shipping: () => number;
    discount: () => number;
    total: () => number;
    itemCount: () => number;
}

// Mock discount codes (in production, validate on backend)
const DISCOUNT_CODES: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
    'FREESHIP': { type: 'fixed', value: 5 },
    'WELCOME10': { type: 'percentage', value: 10 },
    'SAVE20': { type: 'percentage', value: 20 },
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            discountCode: null,
            discountAmount: 0,

            addItem: (item) => {
                const items = get().items;
                // Match by productId + variantId for uniqueness
                const matchKey = `${item.productId}-${item.selectedVariant?.id || 'default'}`;
                const existing = items.find(
                    (i) => `${i.productId}-${i.selectedVariant?.id || 'default'}` === matchKey
                );

                if (existing && !item.designId) {
                    // If same product+variant without customization, increase quantity
                    set({
                        items: items.map((i) =>
                            `${i.productId}-${i.selectedVariant?.id || 'default'}` === matchKey
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                        isOpen: true,
                    });
                } else {
                    // New item or customized item (each design is unique)
                    set({ items: [...items, item], isOpen: true });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) {
                    get().removeItem(id);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [], discountCode: null, discountAmount: 0 }),

            toggleCart: () => set({ isOpen: !get().isOpen }),

            openCart: () => set({ isOpen: true }),

            closeCart: () => set({ isOpen: false }),

            applyDiscount: (code) => {
                const upperCode = code.toUpperCase();
                const discount = DISCOUNT_CODES[upperCode];

                if (!discount) return false;

                const subtotal = get().subtotal();
                let amount = 0;

                if (discount.type === 'percentage') {
                    amount = (subtotal * discount.value) / 100;
                } else {
                    amount = discount.value;
                }

                set({ discountCode: upperCode, discountAmount: amount });
                return true;
            },

            removeDiscount: () => {
                set({ discountCode: null, discountAmount: 0 });
            },

            subtotal: () => {
                return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            shipping: () => {
                const subtotal = get().subtotal();
                const discountCode = get().discountCode;

                // Free shipping over €50 or with FREESHIP code
                if (subtotal >= 50 || discountCode === 'FREESHIP') {
                    return 0;
                }

                return 5; // Standard shipping €5
            },

            discount: () => {
                return get().discountAmount;
            },

            total: () => {
                const subtotal = get().subtotal();
                const shipping = get().shipping();
                const discount = get().discount();

                return Math.max(0, subtotal + shipping - discount);
            },

            itemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'mugmagic-cart',
        }
    )
);
