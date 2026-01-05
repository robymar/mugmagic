import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateRequest, errorResponse, getIP } from '@/lib/api-utils';
import { loginSchema } from '@/lib/validation-schemas';

// In-memory rate limiting (simple implementation for localhost)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkLoginRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 5;

    // Cleanup old entries
    if (loginAttempts.size > 1000) {
        for (const [key, value] of loginAttempts.entries()) {
            if (value.resetTime < now) {
                loginAttempts.delete(key);
            }
        }
    }

    const attempt = loginAttempts.get(ip);

    if (!attempt || attempt.resetTime < now) {
        loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
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
    const rateLimitCheck = checkLoginRateLimit(ip);

    if (!rateLimitCheck.allowed) {
        const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
        return NextResponse.json(
            {
                error: 'Too many login attempts. Please try again later.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                },
            }
        );
    }

    try {
        // Validate request body
        const { data, error: validationError } = await validateRequest(request, loginSchema);
        if (validationError) return validationError;
        if (!data) return errorResponse('Invalid request data', 400);

        const { email, password } = data;

        const cookieStore = await cookies();

        // Track cookies to set explicitly on the response
        const cookiesToSetOnResponse: { name: string; value: string; options: any }[] = [];

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        // Capture the cookies Supabase wants to set
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookiesToSetOnResponse.push({ name, value, options });
                        });
                    },
                },
            }
        );

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return errorResponse(authError.message, 401);
        }

        // Apply captured cookies directly to the cookieStore (Next.js 15 native way)
        cookiesToSetOnResponse.forEach(({ name, value, options }) => {
            const newOptions = {
                ...options,
                sameSite: 'lax' as const,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            };
            delete newOptions.domain;

            cookieStore.set(name, value, newOptions);
        });

        // Create the response (no need to attach cookies manually if cookieStore is used)
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('💥 Server Error:', e);
        return errorResponse('Internal Server Error', 500);
    }
}
