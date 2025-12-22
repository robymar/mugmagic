import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates request body against a Zod schema.
 * 
 * @param request - The incoming Next.js request
 * @param schema - Zod schema to validate against
 * @returns Object with validated data or error response
 * 
 * @example
 * const { data, error } = await validateRequest(request, loginSchema);
 * if (error) return error;
 * // Use validated data safely
 * const { email, password } = data;
 */
export async function validateRequest<T>(
    request: Request,
    schema: ZodSchema<T>
): Promise<{ data: T | null; error: NextResponse | null }> {
    try {
        const body = await request.json();
        const data = schema.parse(body);
        return { data, error: null };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                data: null,
                error: NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: error.errors.map((e) => ({
                            field: e.path.join('.'),
                            message: e.message,
                            code: e.code,
                        })),
                    },
                    { status: 400 }
                ),
            };
        }

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return {
                data: null,
                error: NextResponse.json(
                    { error: 'Invalid JSON in request body' },
                    { status: 400 }
                ),
            };
        }

        return {
            data: null,
            error: NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            ),
        };
    }
}

/**
 * Validates query parameters against a Zod schema.
 * 
 * @param request - The incoming Next.js request
 * @param schema - Zod schema to validate against
 * @returns Object with validated data or error response
 * 
 * @example
 * const { data, error } = validateQueryParams(request, searchSchema);
 * if (error) return error;
 */
export function validateQueryParams<T>(
    request: Request,
    schema: ZodSchema<T>
): { data: T | null; error: Next Response | null } {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());
        const data = schema.parse(params);
        return { data, error: null };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                data: null,
                error: NextResponse.json(
                    {
                        error: 'Invalid query parameters',
                        details: error.errors.map((e) => ({
                            field: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                    { status: 400 }
                ),
            };
        }

        return {
            data: null,
            error: NextResponse.json(
                { error: 'Invalid query parameters' },
                { status: 400 }
            ),
        };
    }
}

/**
 * Creates a standardized success response.
 * 
 * @param data - Data to include in response
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with JSON data
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
}

/**
 * Creates a standardized error response.
 * 
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param details - Optional additional error details
 * @returns NextResponse with error JSON
 */
export function errorResponse(
    message: string,
    status: number = 500,
    details?: any
): NextResponse {
    return NextResponse.json(
        {
            error: message,
            ...(details && { details }),
        },
        { status }
    );
}

/**
 * Extracts IP address from request headers.
 * 
 * @param request - The incoming request
 * @returns IP address string
 */
export function getIP(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

/**
 * Checks if request is from localhost/development.
 * 
 * @param request - The incoming request
 * @returns true if localhost
 */
export function isLocalhost(request: Request): boolean {
    const origin = request.headers.get('origin') || '';
    return origin.includes('localhost') || origin.includes('127.0.0.1');
}

/**
 * Requires authentication for API routes.
 * Extracts user from Supabase session.
 * 
 * @param request - The incoming request
 * @returns User object if authenticated, null otherwise
 * 
 * @example
 * const user = await requireAuth(request);
 * if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function requireAuth(request: Request): Promise<any | null> {
    try {
        const { createServerClient } = await import('@supabase/ssr');
        const { cookies } = await import('next/headers');

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
                        } catch {
                            // Cookie setting can fail in middleware
                        }
                    },
                },
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}
