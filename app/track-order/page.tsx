"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const initialOrderId = searchParams.get('orderId') || '';

    const [orderNumber, setOrderNumber] = useState(initialOrderId);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<any | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setOrder(null);

        try {
            const res = await fetch('/api/track-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to track order');
            } else {
                setOrder(data.order);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Track Your Order</h1>
                    <p className="text-gray-600">Enter your order details below to check the current status.</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <form onSubmit={handleTrack} className="space-y-6">
                        <div>
                            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Order Number
                            </label>
                            <div className="relative">
                                <Package className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="orderNumber"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                    placeholder="ORD-XXXXXX"
                                    className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter the email used for checkout"
                                    className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Tracking...
                                </>
                            ) : (
                                <>
                                    Track Order <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {order && (
                    <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                        <div className="bg-green-50 p-6 border-b border-green-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-green-900">Order Found</h3>
                                <p className="text-sm text-green-700">Last updated recently</p>
                            </div>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                {order.status}
                            </span>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ordered Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Destination</p>
                                    <p className="font-semibold text-gray-900">
                                        {order.shipping_info.city}, {order.shipping_info.country}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="font-bold text-gray-900 mb-4">Package Contents</h4>
                                <ul className="space-y-3">
                                    {order.items.map((item: any, i: number) => (
                                        <li key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.quantity}x {item.name} {item.variant && `(${item.variant})`}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>}>
            <TrackOrderContent />
        </Suspense>
    );
}
