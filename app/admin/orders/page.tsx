import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading orders: {error.message}
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'pending': return <Clock size={16} />;
            default: return <Package size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-900">Orders</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Order #</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Date</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Customer</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Total</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders?.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <Package size={48} className="text-gray-300" />
                                        <p>No orders found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders?.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-medium text-slate-900">
                                            {order.order_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {order.shipping_info?.firstName} {order.shipping_info?.lastName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {order.customer_email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.payment_status)}`}>
                                            {getStatusIcon(order.payment_status)}
                                            {order.payment_status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        €{order.total_amount?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
