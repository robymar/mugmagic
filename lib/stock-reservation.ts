/**
 * Stock Reservation System
 * Manages temporary stock holds during checkout process
 */

import { supabaseAdmin } from './supabase-admin';
import { logInfo, logWarn, logError } from './logger';
import type { StockReservation } from '@/types/product';

interface CreateReservationParams {
    variantId: string;
    quantity: number;
    checkoutId: string;
    userId?: string;
    ttlMinutes?: number;
}

interface ReservationResult {
    success: boolean;
    reservation?: StockReservation;
    error?: string;
    availableStock?: number;
}

/**
 * Create a temporary stock reservation
 * @param params - Reservation parameters
 * @returns Result with reservation or error
 */
export async function createStockReservation(
    params: CreateReservationParams
): Promise<ReservationResult> {
    const { variantId, quantity, checkoutId, userId, ttlMinutes = 15 } = params;

    try {
        logInfo('Creating stock reservation', {
            data: { variantId, quantity, checkoutId, ttlMinutes }
        });

        const { data, error } = await supabaseAdmin.rpc('create_stock_reservation', {
            p_variant_id: variantId,
            p_quantity: quantity,
            p_checkout_id: checkoutId,
            p_user_id: userId || null,
            p_ttl_minutes: ttlMinutes
        });

        if (error) {
            // Check if it's insufficient stock error
            if (error.message?.includes('Insufficient stock')) {
                const match = error.message.match(/Available: (\d+)/);
                const availableStock = match ? parseInt(match[1]) : 0;

                logWarn('Insufficient stock for reservation', {
                    data: { variantId, requested: quantity, available: availableStock }
                });

                return {
                    success: false,
                    error: `Only ${availableStock} units available`,
                    availableStock
                };
            }

            logError('Failed to create reservation', { data: error });
            return {
                success: false,
                error: error.message || 'Failed to create reservation'
            };
        }

        logInfo('Stock reservation created successfully', {
            data: { reservationId: data.id, expiresAt: data.expires_at }
        });

        return {
            success: true,
            reservation: data
        };
    } catch (error: any) {
        logError('Exception in createStockReservation', { data: error });
        return {
            success: false,
            error: 'Internal error creating reservation'
        };
    }
}

/**
 * Create reservations for multiple variants (cart checkout)
 * @param items - Array of {variantId, quantity}
 * @param checkoutId - Unique checkout ID
 * @param userId - Optional user ID
 * @returns Array of results
 */
export async function createBulkReservations(
    items: Array<{ variantId: string; quantity: number }>,
    checkoutId: string,
    userId?: string
): Promise<{ success: boolean; reservations: StockReservation[]; errors: string[] }> {
    const reservations: StockReservation[] = [];
    const errors: string[] = [];

    for (const item of items) {
        const result = await createStockReservation({
            variantId: item.variantId,
            quantity: item.quantity,
            checkoutId,
            userId
        });

        if (result.success && result.reservation) {
            reservations.push(result.reservation);
        } else {
            errors.push(result.error || `Failed for variant ${item.variantId}`);

            // If any reservation fails, release all previously created ones
            if (reservations.length > 0) {
                await releaseReservations(checkoutId);
            }

            return { success: false, reservations: [], errors };
        }
    }

    return { success: true, reservations, errors: [] };
}

/**
 * Confirm reservations and decrement actual stock
 * Called after successful payment
 * @param checkoutId - Checkout ID
 * @returns Success boolean
 */
export async function confirmReservations(checkoutId: string): Promise<boolean> {
    try {
        logInfo('Confirming reservations', { data: { checkoutId } });

        const { data, error } = await supabaseAdmin.rpc('confirm_stock_reservation', {
            p_checkout_id: checkoutId
        });

        if (error) {
            logError('Failed to confirm reservations', { data: error });
            return false;
        }

        logInfo('Reservations confirmed successfully', { data: { checkoutId } });
        return data === true;
    } catch (error: any) {
        logError('Exception in confirmReservations', { data: error });
        return false;
    }
}

/**
 * Release reservations (cancel or expire)
 * Called when payment fails or times out
 * @param checkoutId - Checkout ID
 * @returns Success boolean
 */
export async function releaseReservations(checkoutId: string): Promise<boolean> {
    try {
        logInfo('Releasing reservations', { data: { checkoutId } });

        const { data, error } = await supabaseAdmin.rpc('release_stock_reservation', {
            p_checkout_id: checkoutId
        });

        if (error) {
            logError('Failed to release reservations', { data: error });
            return false;
        }

        logInfo('Reservations released successfully', { data: { checkoutId } });
        return data === true;
    } catch (error: any) {
        logError('Exception in releaseReservations', { data: error });
        return false;
    }
}

/**
 * Get reservations for a checkout
 * @param checkoutId - Checkout ID
 * @returns Array of reservations
 */
export async function getReservations(checkoutId: string): Promise<StockReservation[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('stock_reservations')
            .select('*')
            .eq('checkout_id', checkoutId)
            .order('created_at', { ascending: true });

        if (error) {
            logError('Failed to get reservations', { data: error });
            return [];
        }

        return data || [];
    } catch (error: any) {
        logError('Exception in getReservations', { data: error });
        return [];
    }
}

/**
 * Check if reservations are still valid (not expired)
 * @param checkoutId - Checkout ID
 * @returns True if valid
 */
export async function areReservationsValid(checkoutId: string): Promise<boolean> {
    try {
        const { data, error } = await supabaseAdmin
            .from('stock_reservations')
            .select('status, expires_at')
            .eq('checkout_id', checkoutId)
            .eq('status', 'pending');

        if (error || !data || data.length === 0) {
            return false;
        }

        // Check if any reservation is expired
        const now = new Date();
        return data.every(res => new Date(res.expires_at) > now);
    } catch (error: any) {
        logError('Exception in areReservationsValid', { data: error });
        return false;
    }
}

/**
 * Get available stock for a variant (physical - reserved)
 * @param variantId - Variant ID
 * @returns Available stock count
 */
export async function getAvailableStock(variantId: string): Promise<number> {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_available_stock', {
            p_variant_id: variantId
        });

        if (error) {
            logError('Failed to get available stock', { data: error });
            return 0;
        }

        return data || 0;
    } catch (error: any) {
        logError('Exception in getAvailableStock', { data: error });
        return 0;
    }
}

/**
 * Cleanup expired reservations
 * Should be called periodically (e.g., every 5 minutes via cron)
 * @returns Number of expired reservations cleaned
 */
export async function cleanupExpiredReservations(): Promise<number> {
    try {
        logInfo('Running cleanup of expired reservations');

        const { data, error } = await supabaseAdmin.rpc('cleanup_expired_reservations');

        if (error) {
            logError('Failed to cleanup expired reservations', { data: error });
            return 0;
        }

        const count = data || 0;
        if (count > 0) {
            logInfo('Cleaned up expired reservations', { data: { count } });
        }

        return count;
    } catch (error: any) {
        logError('Exception in cleanupExpiredReservations', { data: error });
        return 0;
    }
}

/**
 * Get reservation statistics (for monitoring/debugging)
 * @returns Stats object
 */
export async function getReservationStats(): Promise<{
    pending: number;
    confirmed: number;
    expired: number;
    cancelled: number;
}> {
    try {
        const { data, error } = await supabaseAdmin
            .from('stock_reservations')
            .select('status');

        if (error || !data) {
            return { pending: 0, confirmed: 0, expired: 0, cancelled: 0 };
        }

        const stats = {
            pending: data.filter(r => r.status === 'pending').length,
            confirmed: data.filter(r => r.status === 'confirmed').length,
            expired: data.filter(r => r.status === 'expired').length,
            cancelled: data.filter(r => r.status === 'cancelled').length
        };

        return stats;
    } catch (error: any) {
        logError('Exception in getReservationStats', { data: error });
        return { pending: 0, confirmed: 0, expired: 0, cancelled: 0 };
    }
}
