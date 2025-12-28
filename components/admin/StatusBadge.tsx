import React from 'react';
import { CheckCircle, Clock, Truck, XCircle, AlertCircle, Package } from 'lucide-react';

export type StatusType = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

interface StatusBadgeProps {
    status: string;
    showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
    const s = status.toLowerCase() as StatusType;

    const config = {
        pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
        paid: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Paid' },
        processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package, label: 'Processing' },
        shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck, label: 'Shipped' },
        delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Delivered' },
        cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, label: 'Cancelled' },
        failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, label: 'Failed' },
    };

    const current = config[s] || { color: 'bg-gray-100 text-gray-800', icon: Package, label: status };
    const Icon = current.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${current.color}`}>
            {showIcon && <Icon size={12} />}
            {current.label.toUpperCase()}
        </span>
    );
}
