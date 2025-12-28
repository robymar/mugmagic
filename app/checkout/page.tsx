"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, MapPin, Check,
    ChevronRight, Lock, ArrowLeft, Package
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/client';
import { ReservationTimer } from '@/components/checkout/ReservationTimer';
import { initializeCheckout, generateIdempotencyKey } from '@/lib/checkout-utils';
import toast from 'react-hot-toast';

//Types
type CheckoutStep = 'shipping' | 'payment';

interface ShippingInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

// Shipping Constants
const SHIPPING_METHODS = [
    { id: 'standard', name: 'Standard Shipping', time: '5-7 business days', price: 0 },
    { id: 'express', name: 'Express Shipping', time: '2-3 business days', price: 10 },
    { id: 'overnight', name: 'Overnight', time: 'Next business day', price: 25 }
];

// --- Checkout Form Component (Inside Elements) ---
const CheckoutForm = ({
    amount,
    onBack,
    onSuccess
}: {
    amount: number;
    onBack: () => void;
    onSuccess: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        // Save pending order details to sessionStorage for Success page
        // We do this because Stripe redirects and we lose state
        // In a real app, you'd save this to a DB associated with the PaymentIntent
        if (typeof window !== 'undefined') {
            // We need access to the parent's state (shippingInfo, items) here
            // Since this component is inside Elements, we can pass a callback or access a store
            // But simpler: The parent component calls this. Oh wait, this is a child component.
            // We will pass a `onBeforePayment` prop to this component to handle saving.
        }

        // Actually, we can't easily pass the specific data into this child unless we prop drill it.
        // Better: Save it in the PARENT component when mounting this child or before steps.
        // OR: Just save it to sessionStorage in the parent when moving to 'payment' step.

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {message}
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-50 transition-all"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !stripe || !elements}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock size={20} />
                            Pay €{amount.toFixed(2)}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

// --- Main Page Component ---
export default function CheckoutPage() {
    const router = useRouter();
    const {
        items, subtotal, shipping, discount, total, clearCart,
        checkoutId, setCheckoutReservation, isReservationActive, clearCheckoutReservation
    } = useCartStore();

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
    const [shippingMethod, setShippingMethod] = useState('standard');

    // Stripe State
    const [clientSecret, setClientSecret] = useState("");

    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Spain'
    });

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setShippingInfo(prev => ({ ...prev, email: user.email || '' }));
            }
        };
        checkUser();
    }, []);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            router.push('/products');
        }
    }, [items, router]);

    // Calculate totals
    const extraShipping = SHIPPING_METHODS.find(m => m.id === shippingMethod)?.price || 0;
    const finalTotal = total() + extraShipping;

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save pending order details
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('pendingOrder', JSON.stringify({
                items,
                shippingInfo,
                total: finalTotal
            }));
        }

        // STEP 1: Create stock reservations
        const loadingToast = toast.loading('Reserving your items...');

        try {
            // Prepare items for reservation (variant_id, quantity)
            const reservationItems = items.map(item => ({
                variant_id: item.selectedVariant?.id || item.productId,
                quantity: item.quantity
            }));

            const reservationResult = await initializeCheckout(reservationItems);

            if (!reservationResult.success) {
                toast.dismiss(loadingToast);
                toast.error(reservationResult.error || 'Failed to reserve items. Please try again.');
                return;
            }

            // Save reservation to cart store
            setCheckoutReservation(
                reservationResult.data!.checkout_id,
                new Date(reservationResult.data!.expires_at)
            );

            toast.dismiss(loadingToast);
            toast.success('Items reserved for 15 minutes! ⏱️');

            // STEP 2: Create Payment Intent with checkout_id and idempotency key
            const idempotencyKey = generateIdempotencyKey(user?.id);

            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Idempotency-Key": idempotencyKey
                },
                body: JSON.stringify({
                    items,
                    shippingInfo,
                    shippingMethod,
                    checkout_id: reservationResult.data!.checkout_id,
                    userId: user?.id
                }),
            });

            const data = await res.json();

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setCurrentStep('payment');
            } else {
                console.error("Failed to create payment intent:", data.error);
                toast.error(data.error || 'Payment system error. Please try again.');
                // Release reservation if payment intent fails
                clearCheckoutReservation();
            }
        } catch (error) {
            console.error("Error in checkout flow:", error);
            toast.dismiss(loadingToast);
            toast.error('An unexpected error occurred. Please try again.');
            clearCheckoutReservation();
        }
    };

    if (items.length === 0) {
        return null;
    }

    const steps = [
        { id: 'shipping', title: 'Shipping', icon: MapPin },
        { id: 'payment', title: 'Payment', icon: Lock },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    // Appearance options for Stripe Elements
    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#2563eb',
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4">
                        <ArrowLeft size={20} />
                        Back to Shopping
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">Complete your order secured by Stripe</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center justify-center gap-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = currentStepIndex > index;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                                            ? 'bg-green-600 text-white'
                                            : isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                                        </div>
                                        <span className={`text-sm font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-24 h-1 rounded transition-colors ${isCompleted ? 'bg-green-600' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: Shipping Information */}
                            {currentStep === 'shipping' && (
                                <motion.div
                                    key="shipping"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-xl shadow-md p-8"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.firstName}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.lastName}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={shippingInfo.email}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={shippingInfo.phone}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Street Address *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={shippingInfo.address}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Postal Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.postalCode}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Country *
                                            </label>
                                            <select
                                                required
                                                value={shippingInfo.country}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="Spain">Spain</option>
                                                <option value="France">France</option>
                                                <option value="Germany">Germany</option>
                                                <option value="Italy">Italy</option>
                                                <option value="Portugal">Portugal</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="USA">United States</option>
                                            </select>
                                        </div>

                                        {/* Shipping Method */}
                                        <div className="pt-6 border-t border-gray-200">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Method</h3>
                                            <div className="space-y-3">
                                                {SHIPPING_METHODS.map((method) => (
                                                    <label
                                                        key={method.id}
                                                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${shippingMethod === method.id
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="shipping"
                                                                value={method.id}
                                                                checked={shippingMethod === method.id}
                                                                onChange={(e) => setShippingMethod(e.target.value)}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{method.name}</div>
                                                                <div className="text-sm text-gray-600">{method.time}</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-gray-900">
                                                            {method.price === 0 ? 'FREE' : `+€${method.price}`}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            Continue to Payment
                                            <ChevronRight size={20} />
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* STEP 2: Stripe Payment */}
                            {currentStep === 'payment' && clientSecret && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-xl shadow-md p-8"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                                        <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="text-sm text-blue-900">
                                            <strong>Secure Payment:</strong> Transactions are encrypted and secured by Stripe.
                                        </div>
                                    </div>

                                    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                        <CheckoutForm
                                            amount={finalTotal}
                                            onBack={() => setCurrentStep('shipping')}
                                            onSuccess={clearCart}
                                        />
                                    </Elements>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                            {/* Reservation Timer */}
                            {isReservationActive && (
                                <div className="mb-6">
                                    <ReservationTimer />
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingBag size={20} />
                                Order Summary
                            </h3>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product?.images?.thumbnail ? (
                                                <Image
                                                    src={item.previewUrl || item.product.images.thumbnail}
                                                    alt={item.product?.name || 'Product'}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 truncate">
                                                {item.product?.name || 'Product'}
                                            </p>
                                            {item.selectedVariant && (
                                                <p className="text-xs text-gray-600">{item.selectedVariant.name}</p>
                                            )}
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            €{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 pt-4 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-900">€{subtotal().toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Base Shipping</span>
                                    <span className="font-semibold text-gray-900">
                                        {shipping() === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `€${shipping().toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                {extraShipping > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {SHIPPING_METHODS.find(m => m.id === shippingMethod)?.name}
                                        </span>
                                        <span className="font-semibold text-gray-900">€{extraShipping.toFixed(2)}</span>
                                    </div>
                                )}

                                {discount() > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-semibold text-green-600">-€{discount().toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4 border-t border-gray-300">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-black text-gray-900">
                                        €{finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
