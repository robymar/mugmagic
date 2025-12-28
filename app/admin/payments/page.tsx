'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface PaymentLog {
    id: string;
    created_at: string;
    details: {
        event: string;
        amount?: number;
        status?: string;
        stripe_id?: string;
        order_number?: string;
        reason?: string;
    };
}

export default function PaymentLogsPage() {
    const [logs, setLogs] = useState<PaymentLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/activity?type=payment');
            const data = await res.json();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch payment logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Payment Logs</h1>
                    <p className="text-gray-500 mt-1">Real-time payment gateway events</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Event</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Order</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Amount</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Stripe ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No payment logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900 capitalize">
                                                {log.details.event.replace(/_/g, ' ')}
                                            </span>
                                            {log.details.reason && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    {log.details.reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.details.order_number ? (
                                                <span className="text-blue-600 font-medium">#{log.details.order_number}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            {log.details.amount ? (
                                                <span>€{(log.details.amount / 100).toFixed(2)}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.details.event.includes('failed') ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
                                                    <AlertCircle size={12} /> Failed
                                                </span>
                                            ) : log.details.event.includes('success') ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                                                    <CheckCircle size={12} /> Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold">
                                                    Info
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            {log.details.stripe_id && (
                                                <div className="flex items-center gap-1">
                                                    <span className="truncate max-w-[100px]" title={log.details.stripe_id}>
                                                        {log.details.stripe_id}
                                                    </span>
                                                    <ExternalLink size={10} className="text-gray-400" />
                                                </div>
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
