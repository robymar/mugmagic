'use client';

import { useEffect, useState } from 'react';

export default function TestCookiesPage() {
    const [cookies, setCookies] = useState<string>('');

    useEffect(() => {
        setCookies(document.cookie);
    }, []);

    return (
        <div className="p-8 font-mono break-all">
            <h1 className="text-xl font-bold mb-4">Current Browser Cookies</h1>
            <div className="bg-gray-100 p-4 rounded border">
                {cookies || 'No cookies found'}
            </div>
            <div className="mt-4">
                <p><strong>Instructions:</strong></p>
                <ul className="list-disc pl-5">
                    <li>Look for a cookie starting with <code>sb-</code> and ending in <code>-code-verifier</code>.</li>
                    <li>If it is missing here, the login page failed to save it.</li>
                </ul>
            </div>
        </div>
    );
}
