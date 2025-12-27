-- Create stickers and avatars tables if they don't exist, then populate with initial data
-- This migration combines table creation and data population for easier deployment

-- Create stickers table
CREATE TABLE IF NOT EXISTS public.stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create avatars table  
CREATE TABLE IF NOT EXISTS public.avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    type TEXT DEFAULT 'preset',
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for stickers
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stickers are viewable by everyone" ON public.stickers;
CREATE POLICY "Stickers are viewable by everyone"
    ON public.stickers FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Only admins can manage stickers" ON public.stickers;
CREATE POLICY "Only admins can manage stickers"
    ON public.stickers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS policies for avatars
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Avatars are viewable by everyone" ON public.avatars;
CREATE POLICY "Avatars are viewable by everyone"
    ON public.avatars FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Only admins can manage avatars" ON public.avatars;
CREATE POLICY "Only admins can manage avatars"
    ON public.avatars FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Populate stickers and avatars tables with initial data from editor
INSERT INTO public.stickers (name, image_url, category, display_order, active) VALUES
('Sticker 1', 'https://cdn-icons-png.flaticon.com/512/4710/4710916.png', 'general', 1, true),
('Sticker 2', 'https://cdn-icons-png.flaticon.com/512/4710/4710917.png', 'general', 2, true),
('Sticker 3', 'https://cdn-icons-png.flaticon.com/512/4710/4710918.png', 'general', 3, true),
('Sticker 4', 'https://cdn-icons-png.flaticon.com/512/4710/4710919.png', 'general', 4, true),
('Sticker 5', 'https://cdn-icons-png.flaticon.com/512/4710/4710920.png', 'general', 5, true),
('Sticker 6', 'https://cdn-icons-png.flaticon.com/512/4710/4710921.png', 'general', 6, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.avatars (name, image_url, type, category, display_order, active) VALUES
('Avatar 1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=0&backgroundColor=transparent', 'preset', 'general', 1, true),
('Avatar 2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=transparent', 'preset', 'general', 2, true),
('Avatar 3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=transparent', 'preset', 'general', 3, true),
('Avatar 4', 'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=transparent', 'preset', 'general', 4, true),
('Avatar 5', 'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=transparent', 'preset', 'general', 5, true),
('Avatar 6', 'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=transparent', 'preset', 'general', 6, true),
('Avatar 7', 'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=transparent', 'preset', 'general', 7, true),
('Avatar 8', 'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=transparent', 'preset', 'general', 8, true)
ON CONFLICT DO NOTHING;
