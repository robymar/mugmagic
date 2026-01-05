/**
 * Idempotency Middleware
 * Prevents duplicate API requests from being processed multiple times
 * 
 * Use case: User double-clicks "Pay" button, preventing double charge
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';
import { logInfo, logWarn, logError } from './logger';

interface IdempotencyResult {
    isDuplicate: boolean;
    cachedResponse?: {
        data: any;
        statusCode: number;
    };
}

/**
 * Check if request is duplicate based on idempotency key
 * @param key - Unique idempotency key from client
 * @returns Object indicating if duplicate and cached response if exists
 */
export async function checkIdempotency(key: string): Promise<IdempotencyResult> {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_idempotent_response', {
            p_key: key
        });

        if (error) {
            logError('Error checking idempotency', { data: error });
            return { isDuplicate: false };
        }

        if (!data || data.length === 0) {
            return { isDuplicate: false };
        }

        const response = data[0];

        // Check if response is expired
        if (response.is_expired) {
            logWarn('Idempotency key expired, treating as new request', { data: { key } });
            return { isDuplicate: false };
        }

        logInfo('Duplicate request detected, returning cached response', {
            data: { key, statusCode: response.status_code }
        });

        return {
            isDuplicate: true,
            cachedResponse: {
                data: response.response_data,
                statusCode: response.status_code
            }
        };
    } catch (error: any) {
        logError('Exception in checkIdempotency', { data: error });
        return { isDuplicate: false };
    }
}

/**
 * Store response for future duplicate requests
 * @param key - Idempotency key
 * @param requestPath - API path
 * @param requestBody - Request body (sanitized)
 * @param responseData - Response to cache
 * @param statusCode - HTTP status code
 * @param ttlHours - Time to live in hours (default 24)
 */
export async function storeIdempotentResponse(
    key: string,
    requestPath: string,
    requestBody: any,
    responseData: any,
    statusCode: number,
    ttlHours: number = 24
): Promise<void> {
    try {
        await supabaseAdmin.rpc('store_idempotent_response', {
            p_key: key,
            p_request_path: requestPath,
            p_request_body: requestBody,
            p_response_data: responseData,
            p_status_code: statusCode,
            p_ttl_hours: ttlHours
        });

        logInfo('Stored idempotent response', { data: { key, statusCode } });
    } catch (error: any) {
        logError('Failed to store idempotent response', { data: error });
    }
}

/**
 * Extract idempotency key from request headers
 * @param request - Next.js request
 * @returns Idempotency key or null
 */
export function getIdempotencyKey(request: Request): string | null {
    return request.headers.get('x-idempotency-key') ||
        request.headers.get('idempotency-key');
}

/**
 * Generate idempotency key for client
 * Used when client doesn't provide one
 * @param userId - User ID
 * @param data - Request data to hash
 * @returns Generated key
 */
export function generateIdempotencyKey(userId: string, data: any): string {
    const dataString = JSON.stringify(data);
    const timestamp = Date.now();
    return `${userId}_${timestamp}_${hashString(dataString)}`;
}

/**
 * Cryptographically secure hash function for strings
 * Uses SHA-256 to prevent collisions
 */
function hashString(str: string): string {
    const crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(str)
        .digest('base64url')
        .substring(0, 32); // First 32 characters for brevity
}

/**
 * HOC wrapper for API routes with idempotency support
 * @param handler - API route handler
 * @param requireKey - If true, returns error when key is missing
 * @returns Wrapped handler with idempotency
 * 
 * @example
 * export const POST = withIdempotency(async (request) => {
 *   // Your logic here
 *   return NextResponse.json({ success: true });
 * });
 */
export function withIdempotency(
    handler: (request: Request, context?: any) => Promise<NextResponse>,
    requireKey: boolean = false
) {
    return async (request: Request, context?: any): Promise<NextResponse> => {
        const idempotencyKey = getIdempotencyKey(request);

        // If key is required but missing, return error
        if (requireKey && !idempotencyKey) {
            return NextResponse.json(
                { error: 'Idempotency-Key header is required' },
                { status: 400 }
            );
        }

        // If no key provided, proceed without idempotency
        if (!idempotencyKey) {
            return handler(request, context);
        }

        // Check for duplicate request
        const { isDuplicate, cachedResponse } = await checkIdempotency(idempotencyKey);

        if (isDuplicate && cachedResponse) {
            return NextResponse.json(
                cachedResponse.data,
                {
                    status: cachedResponse.statusCode,
                    headers: {
                        'X-Idempotency-Replayed': 'true'
                    }
                }
            );
        }

        // Execute handler
        const response = await handler(request, context);

        // Store response for future duplicate requests
        // Only store successful responses
        if (response.status >= 200 && response.status < 300) {
            try {
                const responseData = await response.clone().json();
                const requestBody = await request.clone().json().catch(() => null);

                await storeIdempotentResponse(
                    idempotencyKey,
                    new URL(request.url).pathname,
                    requestBody,
                    responseData,
                    response.status
                );
            } catch (error) {
                logWarn('Failed to cache response', { data: error });
            }
        }

        return response;
    };
}

/**
 * Cleanup expired idempotency keys
 * Should be called periodically (e.g., daily cron job)
 */
export async function cleanupExpiredIdempotencyKeys(): Promise<number> {
    try {
        const { data, error } = await supabaseAdmin.rpc('cleanup_expired_idempotency_keys');

        if (error) {
            logError('Error cleaning up idempotency keys', { data: error });
            return 0;
        }

        logInfo('Cleaned up expired idempotency keys', { data: { count: data } });
        return data || 0;
    } catch (error: any) {
        logError('Exception in cleanup', { data: error });
        return 0;
    }
}
