import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('banners')
            .select('*')
            .order('priority', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get max priority to append to top
        const { data: maxP } = await supabaseAdmin
            .from('banners')
            .select('priority')
            .order('priority', { ascending: false })
            .limit(1)
            .single();

        const nextPriority = (maxP?.priority || 0) + 1;

        const { data, error } = await supabaseAdmin
            .from('banners')
            .insert({ ...body, priority: nextPriority })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // Reorder endpoint
    try {
        const body = await request.json();
        const { items } = body; // Array of { id, priority }

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        // Batch update is not native in Supabase JS easily without RPC, 
        // so we loop. For few banners (usually < 10) this is fine.
        for (const item of items) {
            await supabaseAdmin
                .from('banners')
                .update({ priority: item.priority })
                .eq('id', item.id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
