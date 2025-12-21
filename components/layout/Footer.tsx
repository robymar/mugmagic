"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Send, Heart, Sparkles } from 'lucide-react';

export const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Integrate with newsletter service
        setSubscribed(true);
        setTimeout(() => {
            setEmail('');
            setSubscribed(false);
        }, 3000);
    };

    const footerLinks = {
        shop: [
            { name: 'All Products', href: '/products' },
            { name: 'Mugs', href: '/products?category=mug' },
            { name: 'Bottles', href: '/products?category=bottle' },
            { name: 'New Arrivals', href: '/products?filter=new' }
        ],
        help: [
            { name: 'How It Works', href: '/how-it-works' },
            { name: 'Shipping Info', href: '/shipping' },
            { name: 'Returns', href: '/returns' },
            { name: 'FAQ', href: '/faq' }
        ],
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Contact', href: '/contact' },
            { name: 'Careers', href: '/careers' },
            { name: 'Press Kit', href: '/press' }
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'GDPR', href: '/gdpr' }
        ]
    };

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-600' },
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:text-sky-500' },
        { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-600' },
        { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-600' }
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur opacity-50" />
                                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">
                                MugMagic
                            </span>
                        </Link>

                        <p className="text-gray-400 leading-relaxed">
                            Create personalized mugs and gifts with our easy-to-use 2D editor and stunning 3D preview.
                            Turn your ideas into reality.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-3 bg-gray-800 rounded-lg ${social.color} transition-all hover:scale-110 hover:shadow-lg`}
                                        aria-label={social.name}
                                    >
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Shop</h3>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Help</h3>
                        <ul className="space-y-3">
                            {footerLinks.help.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-16 pt-12 border-t border-gray-700">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-semibold mb-2">
                            <Mail size={16} />
                            <span>Stay Updated</span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black">
                            Get Exclusive Offers & Design Tips
                        </h3>

                        <p className="text-gray-400">
                            Join 10,000+ creative minds getting weekly inspiration and special discounts.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto mt-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={subscribed}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {subscribed ? (
                                    <>✓ Subscribed!</>
                                ) : (
                                    <>
                                        Subscribe
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-xs text-gray-500 mt-4">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                        <p className="flex items-center gap-2">
                            © {new Date().getFullYear()} MugMagic. Made with
                            <Heart size={14} className="text-red-500 fill-red-500" />
                            for creative souls.
                        </p>

                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2">
                                🌍 Shipping worldwide
                            </span>
                            <span className="flex items-center gap-2">
                                💳 Secure payments
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
