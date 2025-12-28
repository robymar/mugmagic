'use client';

import React from 'react';
import { User, ShoppingBag, CreditCard, Clock, Star, Mail, Phone, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Order {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
    payment_status: 'paid' | 'pending' | 'failed' | 'processing';
    status: string;
    items_count: number;
}

interface CustomerProfileProps {
    customer: {
        id: string;
        name: string | null;
        email: string;
        phone?: string;
        avatar_url?: string;
        created_at: string;

        // Calculated Metrics
        orders_count: number;
        total_spent: number;
        last_order_date?: string;
        aov: number; // Average Order Value
    };
    orders: Order[];
}

export function CustomerProfile({ customer, orders }: CustomerProfileProps) {
    return (
        <div className="space-y-6">
            {/* Header / Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
                        {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.name || 'Customer'} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            (customer.name?.[0] || customer.email[0] || 'C').toUpperCase()
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">{customer.name || 'Anonymous Customer'}</h2>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 mt-2 text-gray-500 text-sm">
                            <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                                <Mail size={14} />
                                {customer.email}
                            </span>
                            {customer.phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone size={14} />
                                    {customer.phone}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                Joined {new Date(customer.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Tags / Badges */}
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                            {customer.total_spent > 500 && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> VIP Customer
                                </span>
                            )}
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                                {customer.orders_count} Orders
                            </span>
                        </div>
                    </div>

                    {/* LTV & Metrics Box */}
                    <div className="grid grid-cols-3 gap-4 w-full md:w-auto mt-4 md:mt-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Total Spent</div>
                            <div className="text-xl font-black text-gray-900">€{customer.total_spent.toFixed(2)}</div>
                        </div>
                        <div className="text-center px-4 border-x border-gray-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Avg. Order</div>
                            <div className="text-xl font-bold text-gray-700">€{customer.aov.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Last Order</div>
                            <div className="text-lg font-medium text-gray-700">
                                {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'Never'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-gray-400" />
                        Order History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                        No orders found for this customer.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            #{order.order_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.payment_status} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium">
                                            €{order.total_amount.toFixed(2)}
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
