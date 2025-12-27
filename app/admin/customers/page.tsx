import { supabaseAdmin } from '@/lib/supabase-admin';
import { Mail, Calendar, ShoppingBag, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

async function getCustomers() {
    try {
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select(`
                *,
                orders:orders(count, total_amount)
            `)
            .order('created_at', { ascending: false });

        return profiles || [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Customers</h1>
                <p className="text-gray-500 mt-1">Manage your customer base</p>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer: any) => {
                    const orderCount = customer.orders?.length || 0;
                    const totalSpent = customer.orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;

                    return (
                        <div key={customer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        {customer.full_name || 'Unknown'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                        <Mail size={14} />
                                        {customer.email}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {customer.role || 'user'}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <ShoppingBag size={16} />
                                        Orders
                                    </div>
                                    <span className="font-semibold text-gray-900">{orderCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <DollarSign size={16} />
                                        Total Spent
                                    </div>
                                    <span className="font-semibold text-gray-900">€{totalSpent.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar size={16} />
                                        Joined
                                    </div>
                                    <span className="text-gray-900">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {orderCount > 0 && (
                                <Link
                                    href={`/admin/customers/${customer.id}`}
                                    className="mt-4 block text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                >
                                    View Details →
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {customers.length === 0 && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No customers yet</h3>
                    <p className="text-gray-500">
                        Customers will appear here once they create an account or place an order.
                    </p>
                </div>
            )}
        </div>
    );
}
