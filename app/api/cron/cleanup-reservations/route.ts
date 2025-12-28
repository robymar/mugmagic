/**
 * Cron Job: Cleanup Expired Reservations
 * 
 * Should be called periodically (every 5 minutes recommended)
 * 
 * Setup:
 * - Vercel Cron: Add to vercel.json
 * - GitHub Actions: Schedule workflow
 * - Manual: Call this endpoint from external cron service
 */

import { NextResponse } from 'next/server';
import { cleanupExpiredReservations } from '@/lib/stock-reservation';
import { cleanupExpiredIdempotencyKeys } from '@/lib/idempotency-middleware';
import { logInfo, logWarn } from '@/lib/logger';

export async function GET(request: Request) {
    try {
        // Verify authorization (cron secret or internal call)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'dev-secret';

        if (authHeader !== `Bearer ${cronSecret}`) {
            logWarn('Unauthorized cron attempt', {
                data: { ip: request.headers.get('x-forwarded-for') }
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logInfo('Starting cleanup job');

        // Cleanup expired reservations
        const reservationsCleanedstep = await cleanupExpiredReservations();

        // Cleanup expired idempotency keys
        const keysCleaned = await cleanupExpiredIdempotencyKeys();

        logInfo('Cleanup job completed', {
            data: {
                reservationsCleaned: reservationsCleanedstep,
                idempotencyKeysCleaned: keysCleaned
            }
        });

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results: {
                reservations_cleaned: reservationsCleanedstep,
                idempotency_keys_cleaned: keysCleaned
            }
        });

    } catch (error: any) {
        console.error('Cleanup job error:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// POST method for compatibility with some cron services
export async function POST(request: Request) {
    return GET(request);
}
