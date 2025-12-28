'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Mail, Clock, RefreshCcw, CheckCircle } from 'lucide-react';

interface AbandonedCart {
    id: string;
    customer_email: string;
    items: any[];
    total_amount: number;
    updated_at: string;
    recovery_status: 'pending' | 'recovered' | 'lost';
    is_abandoned: boolean;
}

export default function AbandonedCartsPage() {
    const [carts, setCarts] = useState<AbandonedCart[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        try {
            const res = await fetch('/api/admin/carts/abandoned');
            const data = await res.json();
            setCarts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRecovery = async (id: string, email: string) => {
        if (!confirm(`Send recovery email to ${email}? (Simulation)`)) return;
        // In a real app, you'd call an API to send SendGrid/Resend email
        alert(`Recovery email sent to ${email}!`);
        // Maybe update status to "reminder_sent" or something
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Abandoned Carts</h1>
                <p className="text-gray-500 mt-1">Recover lost sales by contacting customers who left items behind.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Items</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Value</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Last Active</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading carts...
                                    </td>
                                </tr>
                            ) : carts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No abandoned carts found.
                                    </td>
                                </tr>
                            ) : (
                                carts.map((cart) => (
                                    <tr key={cart.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                    <ShoppingCart size={14} />
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {cart.customer_email || 'Guest Visitor'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                                {cart.items.length} Items
                                            </span>
                                            <div className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">
                                                {cart.items.map((i: any) => i.name || 'Product').join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium">
                                            €{cart.total_amount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {new Date(cart.updated_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {cart.recovery_status === 'recovered' ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                                                    <CheckCircle size={12} /> Recovered
                                                </span>
                                            ) : cart.is_abandoned ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                                                    <Clock size={12} /> Abandoned
                                                </span>
                                            ) : (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                                                    <RefreshCcw size={12} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {cart.is_abandoned && cart.customer_email && cart.recovery_status !== 'recovered' && (
                                                <button
                                                    onClick={() => handleSendRecovery(cart.id, cart.customer_email)}
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Mail size={16} />
                                                    Send Email
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
