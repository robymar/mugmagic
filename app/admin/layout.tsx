import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0">
                <div className="p-6">
                    <Link href="/admin" className="text-2xl font-black tracking-tight">
                        MugMagic <span className="text-blue-400">Admin</span>
                    </Link>
                </div>
                <nav className="px-4 py-4 space-y-2">
                    <Link
                        href="/admin"
                        className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/admin/products"
                        className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        📦 Products
                    </Link>
                    <Link
                        href="/admin/categories"
                        className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        🏷️ Categories
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        🛍️ Orders
                    </Link>
                    <Link
                        href="/admin/customers"
                        className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        👥 Customers
                    </Link>
                    <Link
                        href="/admin/content"
                        className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        🎨 Content
                    </Link>
                    <div className="pt-4 border-t border-white/10 mt-4">
                        <Link
                            href="/admin/settings"
                            className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            ⚙️ Settings
                        </Link>
                    </div>
                    <div className="pt-4 border-t border-white/10 mt-4">
                        <Link
                            href="/"
                            className="block px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Store
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
