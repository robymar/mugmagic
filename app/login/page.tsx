'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
// import { signInAction, debugAction } from './actions';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [checkEmail, setCheckEmail] = useState(false);
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {

            // Determine the base URL: prefer env var, fallback to current origin, but ensure consistency
            const getURL = () => {
                let url =
                    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
                    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'); // Fallback logic

                // Make sure to include `https://` when not localhost.
                url = url.includes('http') ? url : `https://${url}`;
                // Make sure to include `http://` on localhost
                if (url.includes('localhost')) {
                    url = url.replace('https://', 'http://');
                }

                // Trim trailing slash
                url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
                return url;
            };

            const redirectUrl = `${getURL()}/auth/callback`;


            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                },
            });



            if (error) throw error;

            if (data.session) {
                // Auto-confirmed

                window.location.href = '/profile';
            } else {
                // Confirmation required

                setCheckEmail(true);
            }
        } catch (err: any) {
            console.error('❌ Auth Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (checkEmail) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Check your email</h1>
                    <p className="text-gray-500">
                        We've sent a verification link to <span className="font-bold text-gray-900">{email}</span>.
                        Please click the link to verify your account.
                    </p>
                    <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg">
                        <strong>Tip:</strong> Open the email on this same device to fully complete the sign-in process automatically.
                    </div>
                    <button
                        onClick={() => {
                            setCheckEmail(false);
                            setIsSignUp(false); // Switch to login
                        }}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500">
                        {isSignUp ? 'Join MugMagic to track orders & save designs' : 'Sign in to access your account'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {isSignUp ? (
                    // Sign Up Form
                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            Sign Up
                        </button>
                    </form>
                ) : (
                    // Sign In Form - using Fetch to API Route (Reliable Fallback)
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        setError(null);

                        const formData = new FormData(e.currentTarget);
                        const email = formData.get('email');
                        const password = formData.get('password');

                        try {
                            const res = await fetch('/api/auth/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password }),
                                credentials: 'include', // Explicitly allow cookies
                            });

                            const data = await res.json();

                            if (!res.ok) {
                                throw new Error(data.error || 'Login failed');
                            }

                            // Force a hard navigation to refresh all server components
                            window.location.href = '/profile';
                        } catch (err: any) {
                            console.error(err);
                            setError(err.message);
                            setLoading(false);
                        }
                    }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="you@example.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            Sign In
                        </button>
                    </form>
                )}

                <div className="text-center space-y-4">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
                            Return to Store
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
