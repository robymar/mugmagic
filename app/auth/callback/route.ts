import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    console.log('🔗 Auth Callback HIT: ' + request.url);
    const { searchParams, origin } = new URL(request.url)
    // Log ALL params for debugging
    searchParams.forEach((value, key) => {
        console.log(`🔍 Param: ${key} = ${value}`);
    });

    const code = searchParams.get('code')

    if (errorParam) {
        console.log('❌ Upstream Error:', errorParam, errorDesc);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(errorDesc || errorParam)}`)
    }

    // return the user to an error page with instructions
    console.log('⚠️ No code param found in callback URL');
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No+code+provided`)
}
