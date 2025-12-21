import { supabaseAdmin } from '@/lib/supabase-admin';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Ensure real-time data

export default async function AdminPage() {
    // 1. Fetch Key Metrics

    // Total Revenue (Calculate from all non-cancelled orders)
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    // Total Revenue
    const totalRevenue = orders
        ?.filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Total Orders
    const totalOrders = orders?.length || 0;

    // Total Users (Estimate from distinct emails in orders for MVP, or better count users if possible)
    // Supabase counting users is restricted. We can use a rough proxy or just skip.
    // Let's count unique emails in orders as "Customers"
    const uniqueCustomers = new Set(orders?.map(o => o.customer_email || '')).size;


    // 2. Recent Orders
    const recentOrders = orders?.slice(0, 5) || [];

    const stats = [
        {
            label: 'Total Revenue',
            value: `€${totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'Total Orders',
            value: totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Active Customers',
            value: uniqueCustomers,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        #{order.order_number || order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                        €{(order.total_amount || 0).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
