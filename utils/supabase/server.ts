import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const newOptions = {
                                ...options,
                                sameSite: 'lax',
                                path: '/',
                                // Consistent secure logic: production only
                                secure: process.env.NODE_ENV === 'production',
                            };
                            // IMPORTANT: Delete 'domain' to ensure it's a Host-Only cookie
                            // This fixes issues where Supabase might send a domain that conflicts with localhost
                            delete newOptions.domain;

                            // console.log(`🍪 Server Client setting cookie: ${name}`, newOptions);
                            cookieStore.set(name, value, newOptions);
                        });
                    } catch (err) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                        // console.warn('⚠️ Server Client setAll failed (expected in Server Components):', err);
                    }
                },
            },
        }
    )
}
