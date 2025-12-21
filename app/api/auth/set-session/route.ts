import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { access_token, refresh_token } = await request.json();

        if (!access_token || !refresh_token) {
            return NextResponse.json(
                { error: 'Missing tokens' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: any[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
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
            console.error('❌ Error setting session:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        console.log('✅ Server session set successfully');
        return NextResponse.json({ success: true, user: data.user });
    } catch (error: any) {
        console.error('❌ API Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
