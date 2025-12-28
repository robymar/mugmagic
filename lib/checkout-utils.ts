/**
 * Checkout Utils
 * Helper functions for checkout flow with stock reservations
 */

export interface CheckoutReservation {
    checkout_id: string;
    expires_at: string;
    ttl_seconds: number;
}

/**
 * Initialize checkout and create stock reservations
 */
export async function initializeCheckout(items: Array<{
    variant_id: string;
    quantity: number;
}>): Promise<{ success: boolean; data?: CheckoutReservation; error?: string }> {
    try {
        const response = await fetch('/api/checkout/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.errors?.join(', ') || 'Failed to initialize checkout'
            };
        }

        return {
            success: true,
            data: {
                checkout_id: data.checkout_id,
                expires_at: data.expires_at,
                ttl_seconds: data.ttl_seconds
            }
        };
    } catch (error: any) {
        console.error('Checkout initialization error:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection.'
        };
    }
}

/**
 * Generate idempotency key for payment intent
 */
export function generateIdempotencyKey(userId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userPart = userId ? `${userId}_` : '';
    return `${userPart}${timestamp}_${random}`;
}

/**
 * Calculate time remaining for reservation
 */
export function getReservationTimeRemaining(expiresAt: Date | string): {
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
} {
    const now = new Date();
    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
        return {
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isExpired: true
        };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
        minutes,
        seconds,
        totalSeconds,
        isExpired: false
    };
}

/**
 * Format time for display
 */
export function formatReservationTime(minutes: number, seconds: number): string {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
