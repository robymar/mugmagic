import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

/**
 * In-memory rate limiter
 * Note: For production, use Redis or similar distributed cache
 */
const rateLimit = new Map<string, RateLimitRecord>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimit.entries()) {
        if (now > record.resetTime) {
            rateLimit.delete(key);
        }
    }
}, 5 * 60 * 1000);

interface RateLimitOptions {
    /**
     * Maximum number of requests allowed
     * @default 10
     */
    maxRequests?: number;

    /**
     * Time window in milliseconds
     * @default 60000 (1 minute)
     */
    windowMs?: number;

    /**
     * Custom identifier function
     * @default IP address
     */
    getIdentifier?: (request: NextRequest) => string;
}

/**
 * Check if request exceeds rate limit
 * 
 * @param request - Next.js request object
 * @param options - Rate limit configuration
 * @returns true if under limit, false if exceeded
 */
export function checkRateLimit(
    request: NextRequest,
    options: RateLimitOptions = {}
): boolean {
    const {
        maxRequests = 10,
        windowMs = 60000,
        getIdentifier = defaultIdentifier
    } = options;

    const identifier = getIdentifier(request);
    const now = Date.now();

    const record = rateLimit.get(identifier);

    // First request or window expired
    if (!record || now > record.resetTime) {
        rateLimit.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    // Limit exceeded
    if (record.count >= maxRequests) {
        return false;
    }

    // Increment count
    record.count++;
    return true;
}

/**
 * Default identifier: IP address + User Agent
 */
function defaultIdentifier(request: NextRequest): string {
    const ip = request.ip ||
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const userAgent = request.headers.get('user-agent') || '';

    return `${ip}:${userAgent.slice(0, 50)}`;
}

/**
 * Rate limit middleware wrapper
 * Returns 429 response if limit exceeded
 */
export function withRateLimit(
    handler: (req: NextRequest) => Promise<NextResponse>,
    options: RateLimitOptions = {}
) {
    return async (request: NextRequest) => {
        if (!checkRateLimit(request, options)) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter: Math.ceil((options.windowMs || 60000) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((options.windowMs || 60000) / 1000)),
                        'X-RateLimit-Limit': String(options.maxRequests || 10),
                        'X-RateLimit-Remaining': '0'
                    }
                }
            );
        }

        return handler(request);
    };
}
