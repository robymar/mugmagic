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
                setAll(cookiesToSet: { name: string, value: string, options: any }[]) {
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


    // 4. This specific call refreshes the Auth Token if it is about to expire.
    const { data: { user }, error } = await supabase.auth.getUser()

    // PROTECTED ROUTES LOGIC
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (error || !user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        // Check Admin Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            console.warn(`Unauthorized access attempt to admin by ${user.email}`)
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}
