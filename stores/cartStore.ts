import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types/product';

// Helper to debounce cart tracking
let timeoutId: NodeJS.Timeout;

const trackAbandonedCart = async (state: CartState) => {
    if (typeof window === 'undefined') return;

    // Don't track if empty (unless we want to clear it on backend, but let's just ignore for now)
    // If we clear cart, maybe we should tell backend? 
    // For now we just stop tracking empty carts.
    if (state.items.length === 0) return;

    // Clear previous timeout
    clearTimeout(timeoutId);

    // Debounce 2 seconds
    timeoutId = setTimeout(async () => {
        try {
            let sessionId = localStorage.getItem('mugmagic_session_id');
            if (!sessionId) {
                sessionId = crypto.randomUUID();
                localStorage.setItem('mugmagic_session_id', sessionId);
            }

            const payload = {
                items: state.items,
                total_amount: state.total(),
                session_id: sessionId,
            };

            await fetch('/api/cart/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            // console.log('Cart tracked');
        } catch (e) {
            console.error('Failed to track cart', e);
        }
    }, 2000);
};

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

    // Checkout reservation state
    checkoutId: string | null;
    reservationExpiresAt: Date | null;
    isReservationActive: boolean;

    // Actions
    addItem: (item: CartItem) => void;
    updateItem: (id: string, updates: Partial<CartItem>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    applyDiscount: (code: string) => Promise<{ success: boolean; message?: string }>;
    removeDiscount: () => void;

    // Checkout reservation actions
    setCheckoutReservation: (checkoutId: string, expiresAt: Date) => void;
    clearCheckoutReservation: () => void;
    isReservationExpired: () => boolean;

    // Computed
    subtotal: () => number;
    shipping: () => number;
    discount: () => number;
    total: () => number;
    itemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            discountCode: null,
            discountAmount: 0,
            checkoutId: null,
            reservationExpiresAt: null,
            isReservationActive: false,

            addItem: (item) => {
                const items = get().items;
                const matchKey = `${item.productId}-${item.selectedVariant?.id || 'default'}`;
                const existing = items.find(
                    (i) => `${i.productId}-${i.selectedVariant?.id || 'default'}` === matchKey
                );

                if (existing && !item.designId) {
                    set({
                        items: items.map((i) =>
                            `${i.productId}-${i.selectedVariant?.id || 'default'}` === matchKey
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                        isOpen: true,
                    });
                } else {
                    set({ items: [...items, item], isOpen: true });
                }
                trackAbandonedCart(get());
            },

            updateItem: (id, updates) => {
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, ...updates } : i
                    ),
                });
                trackAbandonedCart(get());
            },

            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
                trackAbandonedCart(get());
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
                trackAbandonedCart(get());
            },

            clearCart: () => {
                set({
                    items: [],
                    discountCode: null,
                    discountAmount: 0,
                    checkoutId: null,
                    reservationExpiresAt: null,
                    isReservationActive: false
                });
                // We could track empty cart here if we wanted to clear it on backend
            },

            toggleCart: () => set({ isOpen: !get().isOpen }),

            openCart: () => set({ isOpen: true }),

            closeCart: () => set({ isOpen: false }),

            applyDiscount: async (code) => {
                set({ discountCode: null, discountAmount: 0 });

                try {
                    const cartTotal = get().subtotal();
                    const res = await fetch('/api/coupons/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, cartTotal })
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        return { success: false, message: data.error };
                    }

                    if (data.success) {
                        set({ discountCode: data.code, discountAmount: data.discountAmount });
                        trackAbandonedCart(get()); // Track changes in total logic if we were sending discount info
                        return { success: true };
                    }

                    return { success: false, message: 'Invalid coupon' };

                } catch (error) {
                    console.error('Coupon validation error', error);
                    return { success: false, message: 'Network error' };
                }
            },

            removeDiscount: () => {
                set({ discountCode: null, discountAmount: 0 });
                trackAbandonedCart(get());
            },

            subtotal: () => {
                return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            shipping: () => {
                const subtotal = get().subtotal();
                const discountCode = get().discountCode;

                if (subtotal >= 50 || discountCode === 'FREESHIP') {
                    return 0;
                }

                return 5;
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

            setCheckoutReservation: (checkoutId, expiresAt) => {
                set({
                    checkoutId,
                    reservationExpiresAt: expiresAt,
                    isReservationActive: true
                });
            },

            clearCheckoutReservation: () => {
                set({
                    checkoutId: null,
                    reservationExpiresAt: null,
                    isReservationActive: false
                });
            },

            isReservationExpired: () => {
                const expiresAt = get().reservationExpiresAt;
                if (!expiresAt) return true;
                return new Date() > new Date(expiresAt);
            },
        }),
        {
            name: 'mugmagic-cart',
        }
    )
);
