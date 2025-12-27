import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: avatars, error } = await supabase
            .from('avatars')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching avatars:', error);
            // Return empty array instead of error object to maintain consistent response type
            return NextResponse.json([]);
        }

        return NextResponse.json(avatars || []);
    } catch (error) {
        console.error('Error fetching avatars:', error);
        // Return empty array on exception
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
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
        const { name, image_url, type, category, tags, is_premium, display_order, active } = body;

        const { data: avatar, error } = await supabase
            .from('avatars')
            .insert({
                name,
                image_url,
                type: type || 'preset',
                category: category || 'general',
                tags: tags || [],
                is_premium: is_premium ?? false,
                display_order: display_order || 0,
                active: active ?? true
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(avatar, { status: 201 });
    } catch (error: any) {
        console.error('Error creating avatar:', error);
        return NextResponse.json(
            { error: 'Failed to create avatar', details: error.message },
            { status: 500 }
        );
    }
}
