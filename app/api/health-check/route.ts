import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cache } from '@/lib/cache';

export async function GET() {
    const startTime = Date.now();

    try {
        // Check database connectivity
        const supabase = await createClient();
        const { error: dbError } = await supabase
            .from('products')
            .select('id')
            .limit(1);

        const dbStatus = dbError ? 'degraded' : 'healthy';
        const responseTime = Date.now() - startTime;

        // Get cache stats
        const cacheStats = cache.getStats();

        return NextResponse.json({
            status: dbStatus === 'healthy' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            services: {
                database: {
                    status: dbStatus,
                    ...(dbError && { error: dbError.message })
                },
                cache: {
                    status: 'healthy',
                    stats: cacheStats
                }
            },
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error: any) {
        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            error: error.message
        }, { status: 503 });
    }
}
