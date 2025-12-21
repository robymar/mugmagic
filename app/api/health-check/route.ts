import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    console.log('🚑 [API Route] Health Check hit!');

    const cookieStore = await cookies();
    cookieStore.set('health-check', 'ok', { secure: false, path: '/' });

    return NextResponse.json({
        status: 'ok',
        message: 'Server is reachable',
        cookiesReceived: cookieStore.getAll().map(c => c.name)
    });
}
