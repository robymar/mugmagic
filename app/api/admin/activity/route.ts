import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        let query = supabaseAdmin
            .from('admin_activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (type) {
            query = query.eq('action_type', type);
        }

        const { data, error } = await query;


        if (error) {
            console.error('Error fetching activity logs:', error);
            // Fallback to empty if table doesn't exist yet
            return NextResponse.json([]);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Exception fetching activity logs:', error);
        return NextResponse.json([], { status: 500 });
    }
}
