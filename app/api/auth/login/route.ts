import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.error('🚀 [API Route] Login Request received. Env:', process.env.NODE_ENV);

    try {
        const formData = await request.json();
        const email = formData.email;
        const password = formData.password;

        if (!email || !password) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
        }

        const cookieStore = await cookies();

        // Track cookies to set explicitly on the response
        const cookiesToSetOnResponse: { name: string, value: string, options: any }[] = [];

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

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('❌ Supabase Login Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        console.error('✅ Login successful for:', email);
        console.error('📦 Session Data:', {
            user: data.session?.user.id,
            expires_at: data.session?.expires_at,
            cookie_count: cookiesToSetOnResponse.length
        });

        if (cookiesToSetOnResponse.length === 0) {
            console.error('⚠️ WARNING: No cookies captured from Supabase sign-in!');
        }

        // Apply captured cookies directly to the cookieStore (Next.js 15 native way)
        cookiesToSetOnResponse.forEach(({ name, value, options }) => {
            const newOptions = {
                ...options,
                sameSite: 'lax',
                path: '/',
                // FORCE secure: false for localhost debugging. 
                secure: false,
            };
            delete newOptions.domain;

            console.error(`🍪 [API] Setting cookie via cookieStore: ${name}`, newOptions);
            cookieStore.set(name, value, newOptions);
        });

        // Create the response (no need to attach cookies manually if cookieStore is used)
        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error('💥 Server Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
