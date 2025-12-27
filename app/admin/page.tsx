import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

async function getStats() {
    try {
        // Get product count
        const { count: productCount } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Get order count and total revenue
        const { data: orders } = await supabaseAdmin
            .from('orders')
            .select('total_amount, status, created_at');

        const orderCount = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

        // Get customer count
        const { count: customerCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Calculate stats from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentOrders = orders?.filter(o => new Date(o.created_at) > thirtyDaysAgo) || [];
        const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        return {
            productCount: productCount || 0,
            orderCount,
            customerCount: customerCount || 0,
            totalRevenue,
            pendingOrders,
            recentRevenue
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            productCount: 0,
            orderCount: 0,
            customerCount: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            recentRevenue: 0
        };
    }
}

async function getRecentOrders() {
    try {
        const { data: orders } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                profiles:user_id (email)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        return orders || [];
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        return [];
    }
}

export default async function AdminPage() {
    const stats = await getStats();
    const recentOrders = await getRecentOrders();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome to your admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={32} className="opacity-80" />
                        <TrendingUp size={20} className="opacity-60" />
                    </div>
                    <div className="text-3xl font-black mb-1">
                        €{stats.totalRevenue.toFixed(2)}
                    </div>
                    <div className="text-blue-100 text-sm">Total Revenue</div>
                    <div className="mt-3 pt-3 border-t border-blue-400/30 text-xs text-blue-100">
                        €{stats.recentRevenue.toFixed(2)} last 30 days
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <ShoppingCart size={32} className="opacity-80" />
                        {stats.pendingOrders > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                {stats.pendingOrders}
                            </span>
                        )}
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.orderCount}</div>
                    <div className="text-purple-100 text-sm">Total Orders</div>
                    <div className="mt-3 pt-3 border-t border-purple-400/30 text-xs text-purple-100">
                        {stats.pendingOrders} pending orders
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Package size={32} className="opacity-80" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.productCount}</div>
                    <div className="text-green-100 text-sm">Products</div>
                    <div className="mt-3 pt-3 border-t border-green-400/30">
                        <Link
                            href="/admin/products/new"
                            className="text-xs text-green-100 hover:text-white transition-colors"
                        >
                            + Add New Product
                        </Link>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Users size={32} className="opacity-80" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.customerCount}</div>
                    <div className="text-orange-100 text-sm">Customers</div>
                    <div className="mt-3 pt-3 border-t border-orange-400/30">
                        <Link
                            href="/admin/customers"
                            className="text-xs text-orange-100 hover:text-white transition-colors"
                        >
                            View All Customers →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <Link
                        href="/admin/orders"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No orders yet
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-900">
                                            #{order.order_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.profiles?.email || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            €{order.total_amount?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alerts */}
            {stats.pendingOrders > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-start">
                        <AlertCircle className="text-yellow-400 mt-0.5" size={20} />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Pending Orders
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''} that need attention.
                            </p>
                            <Link
                                href="/admin/orders"
                                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 mt-2 inline-block"
                            >
                                View Orders →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
