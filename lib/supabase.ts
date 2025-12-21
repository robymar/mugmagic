
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Use default Supabase client configuration
    // This will use localStorage for PKCE code-verifier and cookies for session
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    if (typeof document === 'undefined') return ''
                    const cookie = document.cookie
                        .split('; ')
                        .find((row) => row.startsWith(name + '='))
                    return cookie ? cookie.split('=')[1] : ''
                },
                set(name: string, value: string, options: any) {
                    if (typeof document === 'undefined') return

                    let updatedCookie = `${name}=${value}`

                    // Add default options for better security/compatibility
                    const defaults = {
                        path: '/',
                        maxAge: 60 * 60 * 24 * 365, // 1 year
                        sameSite: 'Lax',
                        secure: window.location.protocol === 'https:',
                    }

                    const opts = { ...defaults, ...options }

                    for (const optionKey in opts) {
                        updatedCookie += `; ${optionKey}`
                        const optionValue = opts[optionKey]
                        if (optionValue !== true) {
                            updatedCookie += `=${optionValue}`
                        }
                    }

                    document.cookie = updatedCookie
                },
                remove(name: string, options: any) {
                    if (typeof document === 'undefined') return

                    let updatedCookie = `${name}=; max-age=-1`
                    document.cookie = updatedCookie
                }
            }
        }
    )
}
