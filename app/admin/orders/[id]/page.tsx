import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, User, Truck, Check, AlertCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

async function updateOrderStatus(formData: FormData) {
    "use server";

    const orderId = formData.get('orderId') as string;
    const newStatus = formData.get('status') as string;

    const { error } = await supabaseAdmin
        .from('orders')
        .update({ payment_status: newStatus }) // Using payment_status field for now as status
        .eq('id', orderId);

    if (error) {
        console.error('Error updating status:', error);
        throw new Error('Failed to update status');
    }

    revalidatePath(`/admin/orders/${orderId}`);
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!order) {
        notFound();
    }

    const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Link href="/admin/orders" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors gap-2 mb-4">
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">
                        Order #{order.order_number}
                    </h1>
                    <p className="text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <form action={updateOrderStatus} className="flex gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <select
                            name="status"
                            defaultValue={order.payment_status}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                            Update
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package size={20} /> Order Items
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {items?.map((item) => (
                                <div key={item.id} className="p-6 flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden relative">
                                        {item.customization_data?.designSnapshot ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.customization_data.designSnapshot}
                                                alt="Design Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package size={32} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{item.product_name}</h3>
                                        {item.variant_name && (
                                            <p className="text-sm text-gray-500">Variant: {item.variant_name}</p>
                                        )}
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                Qty: {item.quantity}
                                            </span>
                                            <span className="font-mono font-medium">
                                                €{item.price_at_purchase.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Total Amount</span>
                            <span className="text-2xl font-black text-gray-900">
                                €{order.total_amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer Info */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <User size={20} /> Customer
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">
                                    {order.shipping_info?.firstName} {order.shipping_info?.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900 break-all">
                                    {order.customer_email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin size={20} /> Shipping Address
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed">
                                {order.shipping_info?.address}<br />
                                {order.shipping_info?.city}, {order.shipping_info?.postalCode}<br />
                                {order.shipping_info?.country}
                            </p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard size={20} /> Payment Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Payment ID</span>
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                    {order.payment_intent_id?.slice(0, 12)}...
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="text-sm font-bold uppercase text-blue-600">
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
