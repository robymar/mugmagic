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
    type TEXT DEFAULT 'preset', -- 'preset' or 'custom'
    category TEXT DEFAULT 'general', -- 'male', 'female', 'neutral', 'animal', etc.
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for stickers
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stickers are viewable by everyone"
    ON public.stickers FOR SELECT
    USING (active = true);

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

CREATE POLICY "Avatars are viewable by everyone"
    ON public.avatars FOR SELECT
    USING (active = true);

CREATE POLICY "Only admins can manage avatars"
    ON public.avatars FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert some default stickers (example data)
INSERT INTO public.stickers (name, image_url, category, display_order) VALUES
('Heart', 'https://api.dicebear.com/7.x/notionists/svg?seed=heart', 'emoji', 1),
('Star', 'https://api.dicebear.com/7.x/notionists/svg?seed=star', 'emoji', 2),
('Smiley', 'https://api.dicebear.com/7.x/notionists/svg?seed=smiley', 'emoji', 3),
('Coffee', 'https://api.dicebear.com/7.x/notionists/svg?seed=coffee', 'objects', 4)
ON CONFLICT DO NOTHING;

-- Insert some default avatars (example data)
INSERT INTO public.avatars (name, image_url, type, category, display_order) VALUES
('Avatar 1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 'preset', 'male', 1),
('Avatar 2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', 'preset', 'female', 2),
('Avatar 3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'preset', 'neutral', 3),
('Avatar 4', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily', 'preset', 'female', 4)
ON CONFLICT DO NOTHING;
