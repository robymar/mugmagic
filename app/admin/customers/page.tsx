'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, Mail, DollarSign, Calendar, Eye } from 'lucide-react';

interface Customer {
    id: string;
    email: string;
    name: string;
    orders_count: number;
    total_spent: number;
    last_order_date: string;
    created_at: string;
    is_guest: boolean;
    aov: number;
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/admin/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Customers</h1>
                    <p className="text-gray-500 mt-1">Manage your customer base</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                    Total Customers: <span className="text-blue-600 font-bold ml-1">{customers.length}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Orders</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Total Spent</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Last Order</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {(customer.name?.[0] || customer.email[0]).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{customer.name || 'Unknown'}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail size={12} /> {customer.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.is_guest ? (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Guest</span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">Registered</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            {customer.orders_count}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                            €{customer.total_spent.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                                            {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link href={`/admin/customers/${customer.id}${customer.is_guest ? '?guest=true&email=' + customer.email : ''}`}>
                                                <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </Link>
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
