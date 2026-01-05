import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getIP } from '@/lib/api-utils';

// Validation schema for session tokens
const setSessionSchema = z.object({
    access_token: z.string().min(1, 'Access token required'),
    refresh_token: z.string().min(1, 'Refresh token required'),
});

// Rate limiting for session setting (prevent session hijacking attempts)
const setSessionAttempts = new Map<string, { count: number; resetTime: number }>();

function checkSetSessionRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 10; // Allow 10 session sets per minute

    if (setSessionAttempts.size > 1000) {
        for (const [key, value] of setSessionAttempts.entries()) {
            if (value.resetTime < now) setSessionAttempts.delete(key);
        }
    }

    const attempt = setSessionAttempts.get(ip);
    if (!attempt || attempt.resetTime < now) {
        setSessionAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    if (attempt.count >= maxAttempts) {
        return { allowed: false, resetTime: attempt.resetTime };
    }

    attempt.count++;
    return { allowed: true };
}

export async function POST(request: Request) {
    // Rate limiting
    const ip = getIP(request);
    const rateLimitCheck = checkSetSessionRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            { error: 'Too many session attempts', retryAfter },
            { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
    }

    try {
        // Parse and validate request body
        const body = await request.json();
        const validation = setSessionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request',
                    details: validation.error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        const { access_token, refresh_token } = validation.data;

        // Verify environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase credentials');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: any[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, {
                                    ...options,
                                    httpOnly: true, // Ensure HttpOnly
                                    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                                    sameSite: 'lax', // CSRF protection
                                })
                            );
                        } catch (error) {
                            console.error('Error setting cookies:', error);
                        }
                    },
                },
            }
        );

        // Set the session on the server
        const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });

        if (error) {
            console.error('Error setting session:', error.message);
            return NextResponse.json(
                { error: 'Failed to set session' },
                { status: 401 }
            );
        }

        // Don't log full user data in production
        if (process.env.NODE_ENV === 'development') {
            console.log('Session set successfully for user:', data.user?.email);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                // Don't expose sensitive data
            }
        });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
