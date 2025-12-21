"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, Home, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    const { clearCart } = useCartStore();

    // Generate fallback order ID if not from Stripe
    const [orderNumber, setOrderNumber] = useState("");

    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const emailSent = React.useRef(false);

    useEffect(() => {
        // Clear cart on successful load if it wasn't cleared already
        clearCart();

        if (paymentIntentId) {
            setOrderNumber(`ORD-${paymentIntentId.slice(-8).toUpperCase()}`);
        } else {
            setOrderNumber(`ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
        }

        // Send confirmation email
        // We check !emailSent.current to prevent double sending in StrictMode
        if (!emailSent.current && typeof window !== 'undefined') {
            const pendingOrderStr = sessionStorage.getItem('pendingOrder');

            if (pendingOrderStr) {
                try {
                    const pendingOrder = JSON.parse(pendingOrderStr);

                    // Add generated order number
                    const orderId = paymentIntentId
                        ? `ORD-${paymentIntentId.slice(-8).toUpperCase()}`
                        : `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

                    // Send email
                    fetch('/api/send-order-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderNumber: orderId,
                            items: pendingOrder.items,
                            total: pendingOrder.total,
                            shippingInfo: pendingOrder.shippingInfo,
                            email: pendingOrder.shippingInfo.email
                        })
                    }).then(res => {
                        if (res.ok) {
                            console.log('Order confirmation email sent');
                            sessionStorage.removeItem('pendingOrder');
                        }
                    }).catch(err => console.error('Failed to send email:', err));

                    emailSent.current = true;
                } catch (e) {
                    console.error('Error parsing pending order:', e);
                }
            }
        }
    }, [paymentIntentId, clearCart]);

    // Handle failed payments or processing states
    if (redirectStatus === 'failed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-6">
                        Something went wrong with your payment. Please try again.
                    </p>
                    <Link href="/checkout">
                        <button className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all">
                            Try Again
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (redirectStatus === 'processing') {
        // Show specific processing message
    }

    // Default Success View
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-xl text-gray-600">
                        {redirectStatus === 'processing'
                            ? "Your payment is processing. We'll update you when it completes."
                            : "Thank you for your purchase. Your order has been received."}
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Order Number</p>
                            <p className="text-2xl font-black text-gray-900">{orderNumber}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package size={32} className="text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                <Mail size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">
                                    Confirmation Email Sent
                                </h3>
                                <p className="text-sm text-gray-600">
                                    We've sent a confirmation email with your order details to your inbox.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                <Package size={24} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">
                                    Estimated Delivery
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Your order will arrive by <span className="font-semibold">{estimatedDelivery}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
                    <h2 className="text-2xl font-black mb-4">What happens next?</h2>
                    <ol className="space-y-3">
                        <li className="flex gap-3">
                            <span className="font-bold text-blue-200">1.</span>
                            <span>We'll review your custom design and start production</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-blue-200">2.</span>
                            <span>Your item will be carefully packed and shipped</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-blue-200">3.</span>
                            <span>You'll receive tracking information via email</span>
                        </li>
                    </ol>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/products">
                        <button className="w-full px-6 py-4 bg-white text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all border-2 border-gray-200 flex items-center justify-center gap-2">
                            <Home size={20} />
                            Continue Shopping
                        </button>
                    </Link>
                    <Link href={`/track-order?orderId=${orderNumber}`}>
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            <Package size={20} />
                            Track Order
                        </button>
                    </Link>
                </div>

                {/* Support */}
                <div className="text-center mt-8 text-gray-600">
                    <p className="text-sm">
                        Need help?{' '}
                        <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Contact our support team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
