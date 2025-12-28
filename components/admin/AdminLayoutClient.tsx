'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, ShoppingCart, Package, Users, Palette, Settings, LogOut, CreditCard, Megaphone, Tag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/admin/CommandPalette';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
        const active = isActive(href);
        return (
            <Link
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                <Icon size={20} className={active ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static
            `}>
                <div className="p-6 flex items-center justify-between">
                    <Link href="/admin" className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <span>MugMagic</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">Admin</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="px-4 py-4 space-y-1">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/admin/orders" icon={ShoppingCart} label="Orders" />
                    <NavItem href="/admin/products" icon={Package} label="Products" />
                    <NavItem href="/admin/customers" icon={Users} label="Customers" />
                    <NavItem href="/admin/payments" icon={CreditCard} label="Payments" />

                    <div className="pt-4 pb-2">
                        <NavItem href="/admin/marketing/banners" icon={Megaphone} label="Banners" />
                        <NavItem href="/admin/marketing/discounts" icon={Tag} label="Discounts" />
                        <NavItem href="/admin/carts/abandoned" icon={ShoppingCart} label="Abandoned Carts" />
                    </div>

                    <NavItem href="/admin/content" icon={Palette} label="Content" />

                    <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
                        <NavItem href="/admin/settings" icon={Settings} label="Settings" />
                    </div>
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        <LogOut size={18} />
                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen w-full">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="w-full max-w-xl hidden sm:block">
                            <CommandPalette />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                            <span className="sr-only">Notifications</span>
                            🔔
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm cursor-pointer">
                            AD
                        </div>
                    </div>
                </header>

                {/* Mobile Search Bar (visible only on mobile below header) */}
                <div className="sm:hidden p-4 bg-white border-b border-gray-200">
                    <CommandPalette />
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
