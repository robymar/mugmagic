/**
 * Tests for Rate Limiting
 * Validates request throttling works correctly
 */

import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

// Mock NextRequest
function createMockRequest(ip: string = '127.0.0.1', userAgent: string = 'test-agent'): NextRequest {
    const headers = new Headers();
    headers.set('x-forwarded-for', ip);
    headers.set('user-agent', userAgent);

    return {
        ip,
        headers,
        nextUrl: { pathname: '/api/test' }
    } as unknown as NextRequest;
}

describe('Rate Limiting - Security Tests', () => {
    beforeEach(() => {
        // Clear rate limit map between tests
        // Note: This requires exposing the map or using a reset function
        // For now, we'll work with the fact that different IPs don't interfere
    });

    describe('checkRateLimit', () => {
        it('should allow requests under the limit', () => {
            const req = createMockRequest('192.168.1.1');

            const result = checkRateLimit(req, {
                maxRequests: 5,
                windowMs: 60000
            });

            expect(result).toBe(true);
        });

        it('should block requests over the limit', () => {
            const req = createMockRequest('192.168.1.2');

            // Make 5 requests (should all pass)
            for (let i = 0; i < 5; i++) {
                const result = checkRateLimit(req, {
                    maxRequests: 5,
                    windowMs: 60000
                });
                expect(result).toBe(true);
            }

            // 6th request should be blocked
            const blocked = checkRateLimit(req, {
                maxRequests: 5,
                windowMs: 60000
            });

            expect(blocked).toBe(false);
        });

        it('should reset after time window', async () => {
            const req = createMockRequest('192.168.1.3');

            // Use very short window for testing
            const result1 = checkRateLimit(req, {
                maxRequests: 1,
                windowMs: 100 // 100ms
            });
            expect(result1).toBe(true);

            // Should be blocked immediately
            const blocked = checkRateLimit(req, {
                maxRequests: 1,
                windowMs: 100
            });
            expect(blocked).toBe(false);

            // Wait for window to expire
            await new Promise(resolve => setTimeout(resolve, 150));

            // Should be allowed again
            const result2 = checkRateLimit(req, {
                maxRequests: 1,
                windowMs: 100
            });
            expect(result2).toBe(true);
        });

        it('should track different IPs separately', () => {
            const req1 = createMockRequest('192.168.1.4');
            const req2 = createMockRequest('192.168.1.5');

            // Exhaust limit for IP 1
            for (let i = 0; i < 5; i++) {
                checkRateLimit(req1, { maxRequests: 5, windowMs: 60000 });
            }

            // IP 1 should be blocked
            expect(checkRateLimit(req1, { maxRequests: 5, windowMs: 60000 })).toBe(false);

            // IP 2 should still be allowed
            expect(checkRateLimit(req2, { maxRequests: 5, windowMs: 60000 })).toBe(true);
        });

        it('should use default configuration', () => {
            const req = createMockRequest('192.168.1.6');

            // Should use defaults (10 req, 60s window)
            const result = checkRateLimit(req);

            expect(result).toBe(true);
        });

        it('should handle missing IP gracefully', () => {
            const req = createMockRequest(); // Will use 'unknown'

            // Should not throw
            expect(() => {
                checkRateLimit(req);
            }).not.toThrow();
        });

        it('should use IP + User Agent for identification', () => {
            const req1 = createMockRequest('192.168.1.7', 'Browser-A');
            const req2 = createMockRequest('192.168.1.7', 'Browser-B');

            // Same IP but different user agents should be treated separately
            for (let i = 0; i < 5; i++) {
                checkRateLimit(req1, { maxRequests: 5, windowMs: 60000 });
            }

            // req1 should be blocked
            expect(checkRateLimit(req1, { maxRequests: 5, windowMs: 60000 })).toBe(false);

            // req2 should still be allowed (different identifier)
            expect(checkRateLimit(req2, { maxRequests: 5, windowMs: 60000 })).toBe(true);
        });

        it('should increment count correctly', () => {
            const req = createMockRequest('192.168.1.8');

            // Make 3 requests
            checkRateLimit(req, { maxRequests: 5, windowMs: 60000 });
            checkRateLimit(req, { maxRequests: 5, windowMs: 60000 });
            checkRateLimit(req, { maxRequests: 5, windowMs: 60000 });

            // Should have 2 more requests available
            expect(checkRateLimit(req, { maxRequests: 5, windowMs: 60000 })).toBe(true);
            expect(checkRateLimit(req, { maxRequests: 5, windowMs: 60000 })).toBe(true);

            // 6th should be blocked
            expect(checkRateLimit(req, { maxRequests: 5, windowMs: 60000 })).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle maxRequests = 0', () => {
            const req = createMockRequest('192.168.1.9');

            // First request should already be over limit
            const result = checkRateLimit(req, {
                maxRequests: 0,
                windowMs: 60000
            });

            expect(result).toBe(false);
        });

        it('should handle very large maxRequests', () => {
            const req = createMockRequest('192.168.1.10');

            // Should handle large numbers without issues
            const result = checkRateLimit(req, {
                maxRequests: 999999,
                windowMs: 60000
            });

            expect(result).toBe(true);
        });

        it('should handle very short window', () => {
            const req = createMockRequest('192.168.1.11');

            // 1ms window should work
            const result = checkRateLimit(req, {
                maxRequests: 1,
                windowMs: 1
            });

            expect(result).toBe(true);
        });
    });

    describe('Custom identifier function', () => {
        it('should use custom identifier', () => {
            const getIdentifier = (req: NextRequest) => 'custom-id';

            const req1 = createMockRequest('192.168.1.12');
            const req2 = createMockRequest('192.168.1.13');

            // Both should use same identifier
            for (let i = 0; i < 5; i++) {
                checkRateLimit(req1, {
                    maxRequests: 5,
                    windowMs: 60000,
                    getIdentifier
                });
            }

            // req2 should also hit the limit (same identifier)
            const result = checkRateLimit(req2, {
                maxRequests: 5,
                windowMs: 60000,
                getIdentifier
            });

            expect(result).toBe(false);
        });
    });
});
