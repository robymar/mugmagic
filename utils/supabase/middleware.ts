import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // 1. Create an initial response
    // We need this to be able to set cookies on it later
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // 2. The client needs to read cookies from the incoming request
                getAll() {
                    return request.cookies.getAll()
                },
                // 3. When the client sets/updates cookies, we must update 
                // BOTH the request (for the current server run) 
                // AND the response (so the browser saves it)
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)

                        // Robust Cookie Logic (Matched with Server Client)
                        const newOptions = {
                            ...options,
                            sameSite: 'lax',
                            path: '/',
                            secure: process.env.NODE_ENV === 'production',
                        };
                        delete newOptions.domain;

                        response.cookies.set(name, value, newOptions)
                    })
                },
            },
        }
    )

    try {
        // 4. This specific call refreshes the Auth Token if it is about to expire.
        await supabase.auth.getUser()
    } catch (err) {
        console.error('⚠️ Middleware Supabase Error:', err);
    }

    return response
}
