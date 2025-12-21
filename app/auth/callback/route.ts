import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Capturamos posibles errores que vengan de Supabase
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    if (error) {
        console.error('❌ Auth Error en Callback:', error, error_description)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error_description || error)}`)
    }

    if (code) {
        const supabase = await createClient()

        // ESTA es la línea mágica que faltaba: intercambiar código por sesión
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (!sessionError) {
            // Si todo sale bien, redirigimos al usuario a donde quería ir o al perfil
            const next = searchParams.get('next') || '/profile'
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('❌ Error intercambiando código por sesión:', sessionError)
    }

    // Si no hay código o falló el intercambio
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No+code+provided`)
}
