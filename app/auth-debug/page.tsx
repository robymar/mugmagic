'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthDebugPage() {
    const [status, setStatus] = useState<string>('Checking...');
    const [user, setUser] = useState<any>(null);
    const [storage, setStorage] = useState<any>({});
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        // Check localStorage
        const localStorageKeys = Object.keys(localStorage);
        const supabaseKeys = localStorageKeys.filter(k => k.includes('supabase'));

        const storageData: any = {};
        supabaseKeys.forEach(key => {
            try {
                storageData[key] = JSON.parse(localStorage.getItem(key) || '');
            } catch {
                storageData[key] = localStorage.getItem(key);
            }
        });

        setStorage(storageData);

        // Check session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            setStatus('Error: ' + error.message);
        } else if (session) {
            setStatus('✅ Authenticated');
            setUser(session.user);
        } else {
            setStatus('❌ Not authenticated');
        }
    }

    async function testSignIn() {
        const email = 'test@example.com'; // Change this
        const password = 'test123456'; // Change this

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Success! Refreshing...');
            router.refresh();
            window.location.reload();
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔍 Auth Debug Page</h1>

            <div className="space-y-6">
                {/* Status */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-2">Authentication Status</h2>
                    <p className="text-lg">{status}</p>
                    {user && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">Email: {user.email}</p>
                            <p className="text-sm text-gray-600">ID: {user.id}</p>
                        </div>
                    )}
                </div>

                {/* LocalStorage */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-2">LocalStorage (Supabase keys)</h2>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(storage, null, 2)}
                    </pre>
                </div>

                {/* Cookies */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-2">Cookies</h2>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                        {document.cookie || 'No cookies'}
                    </pre>
                </div>

                {/* Actions */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <button
                            onClick={checkAuth}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Refresh Status
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Go to Login
                        </button>
                        <button
                            onClick={() => router.push('/profile')}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Go to Profile
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">📝 Important Notes</h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>PKCE code-verifier</strong> is stored in <code className="bg-yellow-100 px-1">localStorage</code>, not cookies</li>
                        <li>When you clear cookies in your browser, it usually also clears <code className="bg-yellow-100 px-1">localStorage</code></li>
                        <li>This means email verification links won't work if you clear storage after signing up</li>
                        <li><strong>Solution</strong>: Use Sign In with password instead of Sign Up for testing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
