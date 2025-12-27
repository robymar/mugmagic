-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- nombre del icono de lucide-react
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage categories"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
('Mugs', 'mugs', 'Classic ceramic mugs for everyday use', 'Coffee', 1),
('Travel Mugs', 'travel-mugs', 'Insulated mugs for on-the-go', 'Car', 2),
('Camping Mugs', 'camping-mugs', 'Durable mugs for outdoor adventures', 'Tent', 3),
('Accessories', 'accessories', 'Additional items and accessories', 'Package', 4)
ON CONFLICT (slug) DO NOTHING;
