import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Package, User, LogOut, ChevronRight } from 'lucide-react';
import { cookies } from 'next/headers';

// Server Component
export default async function ProfilePage() {
    const cookieStore = await cookies();

    // Create Server Client manually
    const supabase = await createClient();
    const allCookies = cookieStore.getAll();


    // Validar sesión
    const { data: { user }, error } = await supabase.auth.getUser();

    // Debug user session
    if (!user) {
        // Log removed
    } else {
        // Log removed
    }

    if (!user) {


        // Instead of redirecting, show debug info
        return (
            <div className="p-8 text-center text-red-600 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Debug: No Session Found on Server</h1>
                <p className="mb-4">The content cannot be loaded because Supabase cannot find the user session.</p>

                <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto text-xs font-mono space-y-2">
                    <p><strong>Cookies received:</strong> {cookieStore.getAll().map(c => c.name).join(', ')}</p>
                    {error && <p className="text-red-600"><strong>Error:</strong> {error.message}</p>}

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <p className="font-bold mb-2">🔧 Next Steps:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Open browser DevTools (F12) → Application → Cookies</li>
                            <li>Check if you have cookies starting with "sb-"</li>
                            <li>If yes, try clearing ALL cookies and signing in again</li>
                            <li>If no, the server action didn't set cookies properly</li>
                        </ol>
                    </div>
                </div>

                <div className="mt-6 space-x-4">
                    <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
                        Go to Login
                    </Link>
                    <Link href="/auth-debug" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700">
                        Debug Tools
                    </Link>
                </div>
            </div>
        );
    }

    // User is authenticated - show profile
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

    const { data: savedDesigns } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">My Account</h1>
                        <p className="text-gray-500 mt-1">Manage your orders and saved designs</p>
                    </div>
                    <form action="/auth/signout" method="post">
                        <Link href="/">
                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </Link>
                    </form>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">User</div>
                                    <div className="text-sm text-gray-500 break-all">{user.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-3 space-y-12">
                        {/* Saved Designs Section */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <span className="text-2xl">🎨</span>
                                Saved Designs
                            </h2>

                            {(!savedDesigns || savedDesigns.length === 0) ? (
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-8">
                                    <p className="text-gray-500">No saved designs yet.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedDesigns.map((design) => (
                                        <div key={design.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                                            <div className="aspect-square relative bg-gray-50">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={design.preview_url || '/placeholder-mug.png'}
                                                    alt={design.name}
                                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-1">{design.name}</h3>
                                                <p className="text-xs text-gray-500 mb-4">
                                                    {new Date(design.created_at).toLocaleDateString()}
                                                </p>
                                                <Link href={`/editor/${design.product_id}?designId=${design.id}`}>
                                                    <button className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                        Resume Design
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Order History Section */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <Package className="text-blue-600" />
                                Order History
                            </h2>

                            {(!orders || orders.length === 0) ? (
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-12">
                                    <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                                    <p className="text-gray-500 mb-6">Start creating your own mug!</p>
                                    <Link href="/products">
                                        <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                                            Create Now
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-500">Order #{order.order_number}</div>
                                                    <div className="font-semibold text-gray-900">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'}`}>
                                                        {order.status || order.payment_status}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">€{order.total_amount.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
