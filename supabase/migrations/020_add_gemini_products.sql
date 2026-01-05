-- Migration: Add Gemini Products
-- Description: Inserts new products based on the Gemini technical specifications

-- 1. Insert Products
INSERT INTO products (id, name, slug, description, category, base_price, images, specifications, in_stock, featured)
VALUES
  (
    'mug-ceramic-11oz',
    'Ceramic Mug 11oz Standard',
    'mug-ceramic-11oz',
    'The classic "Orca Standard" 11oz ceramic mug. Perfect for all-around printing with a high-definition glossy finish. Cylindrical shape.',
    'ceramic',
    12.99,
    '{"thumbnail": "/products/mug_11oz.png", "gallery": ["/products/mug_11oz.png"]}'::jsonb,
    '{"class": "Class I", "height": "96-98mm", "diameter": "81-82mm", "printable_area": "200mm x 96mm", "material": "Ceramic"}'::jsonb,
    true,
    true
  ),
  (
    'mug-ceramic-15oz',
    'Ceramic Mug 15oz El Grande',
    'mug-ceramic-15oz',
    'A larger 15oz version of the classic ceramic mug. Offers more surface area for your designs and holds more of your favorite beverage.',
    'ceramic',
    15.99,
    '{"thumbnail": "/products/mug_15oz.png", "gallery": ["/products/mug_15oz.png"]}'::jsonb,
    '{"class": "Class I", "height": "117-119mm", "diameter": "85-87mm", "printable_area": "213mm x 103mm", "material": "Ceramic"}'::jsonb,
    true,
    false
  ),
  (
    'mug-latte-12oz',
    'Latte Mug 12oz',
    'mug-latte-12oz',
    'Elegant conical shape designed for latte lovers. Requires conical warping for perfect design transfer.',
    'latte',
    14.99,
    '{"thumbnail": "/products/latte_12oz.png", "gallery": ["/products/latte_12oz.png"]}'::jsonb,
    '{"class": "Class II", "height": "102mm", "top_diameter": "94mm", "bottom_diameter": "63-65mm", "material": "Ceramic"}'::jsonb,
    true,
    true
  ),
  (
    'mug-latte-17oz',
    'Latte Mug 17oz Grande',
    'mug-latte-17oz',
    'The "Grande Latte" mug. Tall and elegant, perfect for large coffee creations. Conical shape.',
    'latte',
    17.99,
    '{"thumbnail": "/products/latte_17oz.png", "gallery": ["/products/latte_17oz.png"]}'::jsonb,
    '{"class": "Class II", "height": "150-152mm", "top_diameter": "88-90mm", "bottom_diameter": "60mm", "material": "Ceramic"}'::jsonb,
    true,
    false
  ),
  (
    'mug-enamel-12oz',
    'Enamel Camp Mug 12oz',
    'mug-enamel-12oz',
    'Rustic style enamel mug with a rolled silver stainless steel rim. Lightweight and durable, perfect for outdoors.',
    'metal',
    13.99,
    '{"thumbnail": "/products/camp_mug_12oz.png", "gallery": ["/products/camp_mug_12oz.png"]}'::jsonb,
    '{"class": "Class III", "height": "80-82mm", "diameter": "86-90mm", "rim": "Rolled Stainless Steel", "material": "Enamel/Steel"}'::jsonb,
    true,
    true
  ),
  (
    'mug-travel-14oz',
    'Stainless Steel Travel Mug 14oz',
    'mug-travel-14oz',
    'Double-walled vacuum insulated travel mug. Keeps drinks hot or cold. Tapered base fits most car cup holders.',
    'travel',
    19.99,
    '{"thumbnail": "/products/travel_mug_14oz.png", "gallery": ["/products/travel_mug_14oz.png"]}'::jsonb,
    '{"class": "Class III", "type": "Travel", "lid": "Plastic", "material": "Stainless Steel"}'::jsonb,
    true,
    false
  ),
  (
    'stein-glass-16oz',
    'Frosted Glass Beer Stein 16oz',
    'stein-glass-16oz',
    'Classic beer stein in frosted glass. Heavy base and sturdy handle. Premium look for beverages.',
    'glass',
    18.99,
    '{"thumbnail": "/products/beer_stein_16oz.png", "gallery": ["/products/beer_stein_16oz.png"]}'::jsonb,
    '{"class": "Class IV", "finish": "Frosted", "base": "Heavy", "material": "Glass"}'::jsonb,
    true,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  images = EXCLUDED.images,
  specifications = EXCLUDED.specifications;

-- 2. Insert Product Variants (Base variants)
INSERT INTO product_variants (product_id, sku_code, name, price, stock_quantity, attributes, is_available)
VALUES
  ('mug-ceramic-11oz', 'MUG-11-WHT', 'Standard 11oz - White', 12.99, 100, '{"color": "White"}'::jsonb, true),
  ('mug-ceramic-15oz', 'MUG-15-WHT', 'El Grande 15oz - White', 15.99, 100, '{"color": "White"}'::jsonb, true),
  ('mug-latte-12oz', 'LAT-12-WHT', 'Latte 12oz - White', 14.99, 100, '{"color": "White"}'::jsonb, true),
  ('mug-latte-17oz', 'LAT-17-WHT', 'Latte 17oz - White', 17.99, 100, '{"color": "White"}'::jsonb, true),
  ('mug-enamel-12oz', 'CAMP-12-WHT', 'Camp Mug 12oz - White/Silver', 13.99, 100, '{"color": "White", "rim": "Silver"}'::jsonb, true),
  ('mug-travel-14oz', 'TRV-14-WHT', 'Travel Mug 14oz - White', 19.99, 100, '{"color": "White"}'::jsonb, true),
  ('stein-glass-16oz', 'STN-16-FST', 'Beer Stein 16oz - Frosted', 18.99, 100, '{"finish": "Frosted"}'::jsonb, true)
ON CONFLICT (sku_code) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity;
