'use client';

import React from 'react';

import {
    ShoppingCart, User, AlertTriangle,
    CheckCircle, XCircle
} from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'order' | 'customer' | 'alert' | 'payment';
    message: string;
    timestamp: string;
    status?: 'success' | 'warning' | 'error' | 'info';
}

const DEMO_ACTIVITIES: ActivityItem[] = [
    { id: '1', type: 'order', message: 'Juan Pérez placed order #12345', timestamp: '2 min ago', status: 'success' },
    { id: '2', type: 'payment', message: 'Payment failed for Order #12344', timestamp: '5 min ago', status: 'error' },
    { id: '3', type: 'alert', message: 'Stock warning: Red Mug (Low Stock)', timestamp: '1 hour ago', status: 'warning' },
    { id: '4', type: 'customer', message: 'New customer registered: Maria G.', timestamp: '2 hours ago', status: 'info' },
];

export function RecentActivity() {
    const [activities, setActivities] = React.useState<ActivityItem[]>(DEMO_ACTIVITIES);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/admin/activity');
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const mapped = data.map((log: any) => {
                        let message = log.action_type;
                        let type: ActivityItem['type'] = 'order';
                        let status: ActivityItem['status'] = 'info';

                        if (log.action_type === 'order') {
                            message = `Order #${log.details.order_number} placed by ${log.details.customer}`;
                            type = 'order';
                            status = 'success';
                        } else if (log.action_type === 'alert') {
                            message = `Low Stock: ${log.details.name} (${log.details.sku})`;
                            type = 'alert';
                            status = 'warning';
                        }

                        return {
                            id: log.id,
                            type,
                            message,
                            timestamp: new Date(log.created_at).toLocaleTimeString(), // Simple formatting
                            status
                        };
                    });
                    setActivities(mapped);
                }
            } catch (error) {
                console.error('Failed to fetch activity', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
        // Poll every 30s
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    Recent Activity
                    {loading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="p-0">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${index !== activities.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                    >
                        <div className={`mt-1 p-1.5 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-600' :
                            activity.status === 'error' ? 'bg-red-100 text-red-600' :
                                activity.status === 'warning' ? 'bg-orange-100 text-orange-600' :
                                    'bg-blue-100 text-blue-600'
                            }`}>
                            {activity.type === 'order' && <ShoppingCart size={14} />}
                            {activity.type === 'customer' && <User size={14} />}
                            {activity.type === 'alert' && <AlertTriangle size={14} />}
                            {activity.type === 'payment' && <XCircle size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
