-- =====================================================
-- MUGMAGIC - SAMPLE PRODUCTS FOR TESTING
-- Execute this in Supabase SQL Editor to add demo products
-- =====================================================

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
('mugs', 'Mugs', 'mugs', 'Customizable mugs for every occasion', 0, true),
('gifts', 'Gifts', 'gifts', 'Perfect personalized gifts', 1, true),
('office', 'Office', 'office', 'Professional office supplies', 2, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (
    id, name, slug, description, long_description, category,
    base_price, compare_at_price, images, specifications, variants, tags,
    in_stock, stock_quantity, featured, bestseller, new, rating, review_count, customizable
) VALUES

-- Product 1: Classic White Mug 11oz (Featured, Bestseller)
(
    'mug-11oz-white',
    'Classic White Mug 11oz',
    'classic-white-mug-11oz',
    'Perfect everyday mug with smooth ceramic finish. Ideal for personalizing with your own designs.',
    'Our classic 11oz white ceramic mug is the perfect canvas for your creativity. Made from high-quality ceramic with a smooth, glossy finish that ensures vibrant, long-lasting prints. Microwave and dishwasher safe for everyday convenience. Whether for morning coffee, afternoon tea, or hot chocolate before bed, this mug is your reliable companion.',
    'mugs',
    12.99,
    16.99,
    '{"thumbnail": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400", "gallery": ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800", "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800"]}'::jsonb,
    '{"capacity": "11 oz (330ml)", "material": "Ceramic", "height": "9.5cm", "diameter": "8cm", "dishwasher_safe": true, "microwave_safe": true, "print_area": "9cm x 20cm wrap"}'::jsonb,
    '[{"id": "white-11oz-v1", "name": "Standard White", "color": "White", "hexCode": "#FFFFFF", "image": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400", "priceModifier": 0}]'::jsonb,
    ARRAY['bestseller', 'classic', 'white', 'ceramic', '11oz'],
    true,
    100,
    true,
    true,
    false,
    4.8,
    127,
    true
),

-- Product 2: Large Black Mug 15oz (Featured)
(
    'mug-15oz-black',
    'Large Black Mug 15oz',
    'large-black-mug-15oz',
    'Extra large capacity mug with elegant black finish. Perfect for those who need more caffeine!',
    'Get your caffeine fix with our spacious 15oz black ceramic mug. The sleek black exterior provides a sophisticated look while offering maximum contrast for colorful designs. Higher capacity means fewer refills and more productivity. Premium ceramic construction ensures durability and excellent heat retention.',
    'mugs',
    15.99,
    19.99,
    '{"thumbnail": "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400", "gallery": ["https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800", "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800"]}'::jsonb,
    '{"capacity": "15 oz (450ml)", "material": "Ceramic", "height": "11cm", "diameter": "9cm", "dishwasher_safe": true, "microwave_safe": true, "print_area": "10cm x 22cm wrap"}'::jsonb,
    '[{"id": "black-15oz-v1", "name": "Classic Black", "color": "Black", "hexCode": "#000000", "image": "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400", "priceModifier": 0}]'::jsonb,
    ARRAY['large', 'black', 'ceramic', '15oz', 'office'],
    true,
    75,
    true,
    false,
    true,
    4.6,
    89,
    true
),

-- Product 3: Color Classic Mug 11oz (Multiple variants)
(
    'mug-11oz-colors',
    'Colorful Classic Mug 11oz',
    'colorful-classic-mug-11oz',
    'Vibrant colored mugs available in 6 beautiful colors. Add personality to your morning routine!',
    'Express yourself with our colorful ceramic mugs! Available in 6 stunning colors, each mug features a vibrant exterior finish that complements any design. Same high-quality construction as our classic white mug, with the added pop of color. Mix and match for a dynamic mug collection.',
    'mugs',
    13.99,
    17.99,
    '{"thumbnail": "https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=400", "gallery": ["https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=800", "https://images.unsplash.com/photo-1565193566371-bddbedd75474?w=800"]}'::jsonb,
    '{"capacity": "11 oz (330ml)", "material": "Ceramic", "height": "9.5cm", "diameter": "8cm", "dishwasher_safe": true, "microwave_safe": true, "print_area": "9cm x 20cm wrap"}'::jsonb,
    '[
        {"id": "red-11oz", "name": "Ruby Red", "color": "Red", "hexCode": "#DC143C", "image": "https://images.unsplash.com/photo-1565193566371-bddbedd75474?w=400", "priceModifier": 1},
        {"id": "blue-11oz", "name": "Ocean Blue", "color": "Blue", "hexCode": "#1E90FF", "image": "https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=400", "priceModifier": 1},
        {"id": "green-11oz", "name": "Forest Green", "color": "Green", "hexCode": "#228B22", "image": "https://images.unsplash.com/photo-1558857563-b1d9e69a0c98?w=400", "priceModifier": 1},
        {"id": "yellow-11oz", "name": "Sunshine Yellow", "color": "Yellow", "hexCode": "#FFD700", "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400", "priceModifier": 1},
        {"id": "pink-11oz", "name": "Rose Pink", "color": "Pink", "hexCode": "#FF69B4", "image": "https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=400", "priceModifier": 1},
        {"id": "purple-11oz", "name": "Royal Purple", "color": "Purple", "hexCode": "#9370DB", "image": "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400", "priceModifier": 1}
    ]'::jsonb,
    ARRAY['colorful', 'ceramic', '11oz', 'variants', 'popular'],
    true,
    150,
    false,
    true,
    false,
    4.7,
    203,
    true
),

-- Product 4: Magic Color Changing Mug
(
    'mug-magic-11oz',
    'Magic Color Changing Mug',
    'magic-color-changing-mug',
    'Amazing heat-activated color changing mug. Watch your design appear when you add hot liquid!',
    'Experience the magic! Our revolutionary color-changing mug features a special thermochromic coating that reveals your custom design when filled with hot beverages. At room temperature, the mug appears black, but pour in your hot coffee and watch the transformation! Perfect for surprising gifts and interactive experiences.',
    'mugs',
    19.99,
    24.99,
    '{"thumbnail": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400", "gallery": ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800", "https://images.unsplash.com/photo-1565193566371-bddbedd75474?w=800"]}'::jsonb,
    '{"capacity": "11 oz (330ml)", "material": "Ceramic with thermochromic coating", "height": "9.5cm", "diameter": "8cm", "dishwasher_safe": false, "microwave_safe": true, "print_area": "9cm x 20cm wrap", "special_feature": "Color changes with heat"}'::jsonb,
    '[{"id": "magic-11oz-v1", "name": "Magic Black", "color": "Black (changes with heat)", "hexCode": "#000000", "image": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400", "priceModifier": 0}]'::jsonb,
    ARRAY['magic', 'color-changing', 'gift', 'unique', 'special'],
    true,
    50,
    true,
    false,
    true,
    4.9,
    164,
    true
),

-- Product 5: Travel Mug with Lid
(
    'mug-travel-16oz',
    'Insulated Travel Mug 16oz',
    'insulated-travel-mug-16oz',
    'Double-wall stainless steel travel mug keeps drinks hot for hours. Perfect for on-the-go!',
    'Take your coffee anywhere with our premium insulated travel mug. Double-wall vacuum insulation keeps beverages hot for up to 6 hours or cold for up to 12 hours. Leak-proof lid with sliding closure ensures no spills in your bag. Durable stainless steel construction with powder-coated finish provides the perfect surface for custom designs.',
    'mugs',
    24.99,
    29.99,
    '{"thumbnail": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400", "gallery": ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800"]}'::jsonb,
    '{"capacity": "16 oz (475ml)", "material": "Stainless steel", "height": "17cm", "diameter": "7.5cm", "dishwasher_safe": false, "microwave_safe": false, "insulation": "Double-wall vacuum", "keeps_hot": "6 hours", "keeps_cold": "12 hours", "print_area": "Full wrap design"}'::jsonb,
    '[
        {"id": "travel-white", "name": "Arctic White", "color": "White", "hexCode": "#F8F8F8", "image": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400", "priceModifier": 0},
        {"id": "travel-black", "name": "Midnight Black", "color": "Black", "hexCode": "#1C1C1C", "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "priceModifier": 0},
        {"id": "travel-silver", "name": "Brushed Silver", "color": "Silver", "hexCode": "#C0C0C0", "image": "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400", "priceModifier": 0}
    ]'::jsonb,
    ARRAY['travel', 'insulated', 'stainless-steel', 'lid', 'portable'],
    true,
    60,
    false,
    false,
    true,
    4.8,
    97,
    true
),

-- Product 6: Espresso Cup Set
(
    'mug-espresso-4oz',
    'Espresso Cup 4oz (Set of 2)',
    'espresso-cup-4oz-set',
    'Elegant small ceramic cups perfect for espresso shots. Sold as a set of 2.',
    'Elevate your espresso experience with our premium ceramic espresso cups. Sold as a set of 2, these perfectly sized 4oz cups are ideal for enjoying concentrated coffee beverages. Thick ceramic walls retain heat while the small size preserves crema. Customize each cup with matching or complementary designs.',
    'mugs',
    18.99,
    22.99,
    '{"thumbnail": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400", "gallery": ["https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800"]}'::jsonb,
    '{"capacity": "4 oz (120ml) per cup", "material": "Ceramic", "height": "6cm", "diameter": "6cm", "dishwasher_safe": true, "microwave_safe": true, "quantity": "Set of 2", "print_area": "6cm x 15cm wrap per cup"}'::jsonb,
    '[{"id": "espresso-white", "name": "Classic White Set", "color": "White", "hexCode": "#FFFFFF", "image": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400", "priceModifier": 0}]'::jsonb,
    ARRAY['espresso', 'small', 'set', 'ceramic', 'coffee'],
    true,
    40,
    false,
    false,
    false,
    4.6,
    42,
    true
);

-- Insert sample stickers for the design editor
INSERT INTO stickers (name, category, url, tags, is_active, sort_order) VALUES
('Heart', 'love', 'https://api.iconify.design/mdi/heart.svg', ARRAY['love', 'romance', 'valentine'], true, 0),
('Star', 'shapes', 'https://api.iconify.design/mdi/star.svg', ARRAY['favorite', 'rating', 'shape'], true, 1),
('Coffee Cup', 'drinks', 'https://api.iconify.design/mdi/coffee.svg', ARRAY['coffee', 'drink', 'hot'], true, 2),
('Smile', 'emoji', 'https://api.iconify.design/mdi/emoticon-happy.svg', ARRAY['happy', 'emoji', 'smile'], true, 3),
('Music Note', 'music', 'https://api.iconify.design/mdi/music-note.svg', ARRAY['music', 'note', 'sound'], true, 4),
('Camera', 'objects', 'https://api.iconify.design/mdi/camera.svg', ARRAY['photo', 'camera', 'picture'], true, 5),
('Gift', 'celebration', 'https://api.iconify.design/mdi/gift.svg', ARRAY['gift', 'present', 'celebration'], true, 6),
('Flower', 'nature', 'https://api.iconify.design/mdi/flower.svg', ARRAY['flower', 'nature', 'spring'], true, 7),
('Sun', 'nature', 'https://api.iconify.design/mdi/white-balance-sunny.svg', ARRAY['sun', 'sunny', 'weather'], true, 8),
('Moon', 'nature', 'https://api.iconify.design/mdi/moon-waning-crescent.svg', ARRAY['moon', 'night', 'dark'], true, 9)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM stickers) as stickers_count,
    '✅ Sample data inserted successfully!' as status;
