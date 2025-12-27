import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check admin authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        const { data: sticker, error } = await supabase
            .from('stickers')
            .update({
                name: body.name,
                image_url: body.image_url,
                category: body.category,
                tags: body.tags,
                is_premium: body.is_premium,
                display_order: body.display_order,
                active: body.active,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(sticker);
    } catch (error: any) {
        console.error('Error updating sticker:', error);
        return NextResponse.json(
            { error: 'Failed to update sticker', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check admin authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase
            .from('stickers')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Sticker deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting sticker:', error);
        return NextResponse.json(
            { error: 'Failed to delete sticker', details: error.message },
            { status: 500 }
        );
    }
}
