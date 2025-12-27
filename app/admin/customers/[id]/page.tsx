import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { ArrowLeft, Mail, Calendar, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getCustomerDetails(id: string) {
    try {
        const { data: customer } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (!customer) return null;

        const { data: orders } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                order_items:order_items(
                    id,
                    quantity,
                    price,
                    products:product_id(name, slug)
                )
            `)
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        const { data: designs } = await supabaseAdmin
            .from('saved_designs')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        return {
            customer,
            orders: orders || [],
            designs: designs || []
        };
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return null;
    }
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getCustomerDetails(id);

    if (!data) {
        notFound();
    }

    const { customer, orders, designs } = data;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/customers"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">
                        {customer.full_name || 'Customer Details'}
                    </h1>
                    <p className="text-gray-500 mt-1">{customer.email}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingBag size={20} className="text-blue-600" />
                        </div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{totalOrders}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign size={20} className="text-green-600" />
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">€{totalSpent.toFixed(2)}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Package size={20} className="text-purple-600" />
                        </div>
                        <div className="text-sm text-gray-600">Saved Designs</div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{designs.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar size={20} className="text-orange-600" />
                        </div>
                        <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Order History</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    No orders yet
                                </div>
                            ) : (
                                orders.map((order: any) => (
                                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-mono text-sm font-semibold text-gray-900">
                                                    #{order.order_number}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">
                                                    €{order.total_amount?.toFixed(2)}
                                                </div>
                                                <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        {order.order_items && order.order_items.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {order.order_items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            {item.products?.name || 'Product'} × {item.quantity}
                                                        </span>
                                                        <span className="text-gray-900 font-medium">
                                                            €{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Email</div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                                        {customer.email}
                                    </a>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Role</div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${customer.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {customer.role || 'user'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Saved Designs */}
                    {designs.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Saved Designs</h3>
                            <div className="space-y-3">
                                {designs.slice(0, 5).map((design: any) => (
                                    <div key={design.id} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-900 truncate">{design.name}</span>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(design.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                                {designs.length > 5 && (
                                    <div className="text-sm text-blue-600 font-medium">
                                        +{designs.length - 5} more designs
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
