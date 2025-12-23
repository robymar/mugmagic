"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, User, Sparkles } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export const Header = () => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { itemCount, toggleCart } = useCartStore();
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();

    const cartItemCount = itemCount();

    const navigation = [
        { name: 'Products', href: '/products' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Gallery', href: '/gallery' },
        { name: 'Contact', href: '/contact' }
    ];

    React.useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isActive = (href: string) => pathname === href;

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-black text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                            MugMagic
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative text-sm font-semibold transition-colors ${isActive(item.href)
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                                {isActive(item.href) && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute -bottom-7 left-0 right-0 h-0.5 bg-blue-600"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search - Desktop */}
                        <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-600">
                            <Search size={18} />
                            <span>Search...</span>
                        </button>

                        {/* Cart */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                            <ShoppingCart size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                            {mounted && cartItemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                                >
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </button>

                        {/* User Menu */}
                        {user ? (
                            <Link href="/profile">
                                <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all border border-gray-200">
                                    <User size={18} />
                                    <span>Profile</span>
                                </button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105">
                                    <User size={18} />
                                    <span>Login</span>
                                </button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} className="text-gray-600" />
                            ) : (
                                <Menu size={24} className="text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-gray-100 bg-white"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {/* Search - Mobile */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Navigation Links */}
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg font-semibold transition-colors ${isActive(item.href)
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Login Button - Mobile */}
                            {user ? (
                                <Link
                                    href="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-4 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg text-center"
                                >
                                    My Profile
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg text-center"
                                >
                                    Login / Sign Up
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Promotional Banner (Optional) */}
            {pathname === '/' && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-4 text-sm font-medium">
                    🎉 Free shipping on orders over €50! Use code: <span className="font-bold">FREESHIP</span>
                </div>
            )}
        </header>
    );
};
