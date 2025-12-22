"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { X, ShoppingBag, ArrowRight, Tag, Trash2, Package } from 'lucide-react';

export const CartDrawer = () => {
    const { items, isOpen, closeCart, clearCart, subtotal, shipping, discount, total, discountCode, applyDiscount, removeDiscount } = useCartStore();
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);

        // Handle escape key to close drawer
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeCart();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeCart]);

    if (!mounted) return null;

    const handleApplyPromo = () => {
        const success = applyDiscount(promoCode);
        if (success) {
            setPromoCode('');
            setPromoError('');
        } else {
            setPromoError('Invalid code');
        }
    };

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Drawer Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Shopping cart"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <ShoppingBag className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">
                                        Shopping Cart
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {items.length} {items.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeCart}
                                aria-label="Close shopping cart"
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-600" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag size={40} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Your cart is empty
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Start adding some products!
                                    </p>
                                    <Link href="/products" onClick={closeCart}>
                                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                                            Browse Products
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Clear Cart Button */}
                                    <button
                                        onClick={handleClearCart}
                                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium mb-2"
                                    >
                                        <Trash2 size={14} />
                                        Clear Cart
                                    </button>

                                    {/* Items List */}
                                    {items.map((item) => (
                                        <CartItem key={item.id} item={item} />
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Footer (only show if cart has items) */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
                                {/* Promo Code */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount Code
                                    </label>
                                    {discountCode ? (
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Tag size={16} className="text-green-600" />
                                                <span className="font-semibold text-green-700">
                                                    {discountCode}
                                                </span>
                                            </div>
                                            <button
                                                onClick={removeDiscount}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => {
                                                    setPromoCode(e.target.value.toUpperCase());
                                                    setPromoError('');
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                                placeholder="Enter code"
                                                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${promoError
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : 'border-gray-300 focus:ring-blue-500'
                                                    }`}
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={!promoCode}
                                                className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                    {promoError && (
                                        <p className="text-xs text-red-600 mt-1">{promoError}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Try: WELCOME10, SAVE20, or FREESHIP
                                    </p>
                                </div>

                                {/* Price Summary */}
                                <div className="space-y-2 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold text-gray-900">€{subtotal().toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-semibold text-gray-900">
                                            {shipping() === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                `€${shipping().toFixed(2)}`
                                            )}
                                        </span>
                                    </div>

                                    {discount() > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Discount</span>
                                            <span className="font-semibold text-green-600">
                                                -€{discount().toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-2 border-t border-gray-300">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-black text-gray-900">
                                            €{total().toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Free Shipping Progress */}
                                {subtotal() < 50 && shipping() > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package size={16} className="text-blue-600" />
                                            <span className="text-sm font-semibold text-blue-900">
                                                Add €{(50 - subtotal()).toFixed(2)} more for FREE shipping!
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-500"
                                                style={{ width: `${(subtotal() / 50) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Checkout Button */}
                                <Link href="/checkout" onClick={closeCart}>
                                    <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2">
                                        Proceed to Checkout
                                        <ArrowRight size={20} />
                                    </button>
                                </Link>

                                <Link href="/products" onClick={closeCart}>
                                    <button className="w-full px-4 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors">
                                        Continue Shopping
                                    </button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
