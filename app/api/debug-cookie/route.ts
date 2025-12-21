import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    console.error('🍪 [Debug Route] Setting test cookie...');

    const cookieStore = await cookies();

    // Set a raw test cookie
    cookieStore.set('debug-persistence', 'works', {
        sameSite: 'lax',
        secure: false, // Force insecure for localhost
        path: '/',
    });

    // Also try setting the real Supabase cookie name format just to test characters
    cookieStore.set('sb-test-token', 'fake-jwt-token', {
        sameSite: 'lax',
        secure: false,
        path: '/',
    });

    console.error('🍪 [Debug Route] Cookies set. Redirecting...');

    // Redirect to profile to see if it catches them
    return NextResponse.redirect(new URL('/profile', request.url));
}
