import Link from 'next/link';
import { AlertTriangle, Info } from 'lucide-react';
import { Suspense } from 'react';

export default async function AuthCodeError({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const errorMessage = error || "The link may have expired or is invalid.";

    const isPKCEError = errorMessage === 'missing_verifier' || errorMessage.includes('PKCE code verifier not found');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 space-y-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 text-center">Authentication Error</h1>

                {isPKCEError ? (
                    <>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex items-start">
                                <Info className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-bold mb-2">Why did this happen?</p>
                                    <p>The verification link couldn't find your session data. This typically occurs when you cleared your browser data (cookies/storage) after requesting the verification email.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <p className="font-bold text-blue-900 mb-2">✅ How to fix this:</p>
                            <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-800">
                                <li>If you already have an account, use <strong>Sign In</strong> with your email and password</li>
                                <li>If this was a new sign up, click "Sign Up" again with the same email and a NEW verification link will be sent</li>
                                <li><strong>Important:</strong> Don't clear your browser data until you complete the verification</li>
                            </ol>
                        </div>
                    </>
                ) : (
                    <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm font-mono break-all">
                        {errorMessage}
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href="/login" className="flex-1">
                        <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            Go to Login
                        </button>
                    </Link>
                    <Link href="/auth-debug" className="flex-1">
                        <button className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                            Debug Tools
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
