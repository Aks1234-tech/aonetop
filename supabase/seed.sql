-- Seed data for aonetop e-commerce
-- Run this after migrations to populate initial data

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (id, name, description, sort_order) VALUES
  ('black-tea', 'Black Tea', 'Full-bodied teas with rich, malty flavors', 1),
  ('green-tea', 'Green Tea', 'Light, refreshing teas with vegetal notes', 2),
  ('white-tea', 'White Tea', 'Delicate, subtle teas with natural sweetness', 3),
  ('oolong-tea', 'Oolong Tea', 'Semi-oxidized teas with complex flavors', 4),
  ('chai-blends', 'Chai Blends', 'Traditional Indian spiced tea blends', 5),
  ('herbal-tea', 'Herbal Tea', 'Caffeine-free herbal infusions', 6),
  ('specialty-tea', 'Specialty Tea', 'Unique and artisanal tea varieties', 7),
  ('flavored-tea', 'Flavored Tea', 'Teas enhanced with natural flavors', 8);

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (
  slug, name, description, long_description, price, original_price, category,
  product_type, weight_category, tags, weight, origin, brewing_temp, brewing_time, brewing_amount,
  in_stock, is_bestseller, is_featured, is_new, rating, reviews_count
) VALUES
(
  'darjeeling-first-flush',
  'Darjeeling First Flush',
  'The champagne of teas, harvested in early spring with delicate muscatel notes',
  'Our Darjeeling First Flush is sourced from the pristine gardens of the Himalayan foothills. This exquisite tea is harvested during the first plucking season, producing leaves that yield a light, floral cup with distinctive muscatel characteristics. The pale golden liquor offers a refined complexity that tea connoisseurs treasure.',
  249900, 299900, 'Black Tea',
  'loose-leaf', 'medium', ARRAY['organic', 'premium', 'single-origin'], '100g', 'Darjeeling, India',
  '85-90°C', '3-4 minutes', '2g per cup',
  true, true, true, false, 4.9, 128
),
(
  'assam-golden-tips',
  'Assam Golden Tips',
  'Rich, malty breakfast tea with golden tips from the finest Assam gardens',
  'This exceptional Assam tea features an abundance of golden tips, indicating the highest quality leaves. Grown in the lush valleys of Assam, this tea delivers a robust, full-bodied cup with distinctive malty undertones and a smooth, honeyed finish perfect for starting your day.',
  189900, NULL, 'Black Tea',
  'loose-leaf', 'medium', ARRAY['organic', 'breakfast', 'strong'], '100g', 'Assam, India',
  '95-100°C', '4-5 minutes', '2.5g per cup',
  true, true, false, false, 4.8, 95
),
(
  'nilgiri-blue-mountain',
  'Nilgiri Blue Mountain',
  'Fragrant, bright tea from the Blue Mountains with fruity undertones',
  'Grown at elevations above 6,000 feet in the Nilgiri Blue Mountains, this exceptional tea offers a unique character. The cool, misty climate produces leaves that yield a bright, aromatic cup with subtle fruity notes and a clean, refreshing finish.',
  169900, NULL, 'Black Tea',
  'loose-leaf', 'medium', ARRAY['organic', 'high-altitude', 'fruity'], '100g', 'Nilgiri, India',
  '90-95°C', '3-4 minutes', '2g per cup',
  true, false, true, false, 4.7, 67
),
(
  'kashmiri-kahwa',
  'Kashmiri Kahwa',
  'Traditional Kashmiri green tea with saffron, almonds, and warm spices',
  'This authentic Kashmiri Kahwa brings the warmth of the Himalayan tradition to your cup. Crafted with premium green tea, precious saffron strands, crushed almonds, cinnamon, and cardamom, this aromatic blend offers a luxurious, warming experience that''s been cherished for centuries.',
  219900, NULL, 'Specialty Tea',
  'loose-leaf', 'small', ARRAY['spiced', 'traditional', 'saffron'], '75g', 'Kashmir, India',
  '80-85°C', '4-5 minutes', '3g per cup',
  true, true, false, true, 4.9, 156
),
(
  'masala-chai-blend',
  'Royal Masala Chai',
  'Authentic spiced tea blend with ginger, cardamom, cinnamon, and cloves',
  'Our Royal Masala Chai is a carefully crafted blend of robust Assam tea and traditional Indian spices. Each sip delivers the perfect balance of bold tea flavor and aromatic spices, creating an invigorating experience that''s equally delightful with milk or on its own.',
  149900, NULL, 'Chai Blends',
  'loose-leaf', 'medium', ARRAY['spiced', 'traditional', 'strong'], '150g', 'India',
  '100°C', '5-6 minutes', '3g per cup',
  true, true, true, false, 4.8, 234
),
(
  'himalayan-green',
  'Himalayan Green Tea',
  'Delicate, vegetal green tea from high-altitude Himalayan gardens',
  'Sourced from organic gardens nestled in the Himalayas, this green tea offers a pure, authentic taste. The high altitude and pristine environment produce leaves with exceptional clarity and a subtle, refreshing character with notes of fresh vegetables and spring meadows.',
  179900, NULL, 'Green Tea',
  'loose-leaf', 'medium', ARRAY['organic', 'high-altitude', 'pure'], '100g', 'Himachal Pradesh, India',
  '75-80°C', '2-3 minutes', '2g per cup',
  true, false, false, false, 4.6, 89
),
(
  'white-moonlight',
  'White Moonlight',
  'Rare white tea with silvery buds, delicate and naturally sweet',
  'Our White Moonlight tea represents the pinnacle of tea craftsmanship. Made from tender, silver-tipped buds harvested at dawn, this rare white tea offers an ethereal, naturally sweet flavor with hints of melon and honey. A true luxury for the discerning tea lover.',
  349900, 399900, 'White Tea',
  'loose-leaf', 'small', ARRAY['rare', 'premium', 'limited-edition'], '50g', 'Darjeeling, India',
  '70-75°C', '4-5 minutes', '3g per cup',
  true, false, true, true, 5.0, 42
),
(
  'tulsi-herbal-blend',
  'Tulsi Wellness Blend',
  'Caffeine-free holy basil blend with natural healing properties',
  'This therapeutic blend features sacred Tulsi (Holy Basil), revered in Ayurveda for its adaptogenic properties. Combined with hints of lemongrass and ginger, this caffeine-free infusion supports relaxation and overall wellness while delivering a soothing, herbaceous flavor.',
  129900, NULL, 'Herbal Tea',
  'loose-leaf', 'medium', ARRAY['caffeine-free', 'ayurvedic', 'wellness'], '100g', 'India',
  '95-100°C', '5-7 minutes', '2g per cup',
  true, false, false, false, 4.7, 78
),
(
  'oolong-himalayan',
  'Himalayan Oolong',
  'Semi-oxidized tea with complex floral and fruity notes',
  'This artisanal Himalayan Oolong represents the perfect balance between green and black tea. Carefully processed to achieve optimal oxidation, it delivers a complex cup with layers of floral, fruity, and slightly roasted notes that evolve beautifully across multiple infusions.',
  289900, NULL, 'Oolong Tea',
  'loose-leaf', 'small', ARRAY['artisanal', 'complex', 'multi-infusion'], '75g', 'Darjeeling, India',
  '85-90°C', '3-4 minutes', '3g per cup',
  true, false, true, false, 4.8, 56
),
(
  'earl-grey-supreme',
  'Earl Grey Supreme',
  'Premium black tea with natural bergamot and blue cornflowers',
  'Our Earl Grey Supreme elevates the classic blend with exceptional ingredients. We combine select Darjeeling leaves with pure bergamot oil and delicate blue cornflowers to create a sophisticated, aromatic tea that''s perfect for afternoon indulgence.',
  159900, NULL, 'Flavored Tea',
  'loose-leaf', 'medium', ARRAY['classic', 'aromatic', 'afternoon-tea'], '100g', 'India',
  '90-95°C', '3-4 minutes', '2g per cup',
  true, false, false, false, 4.6, 112
),
(
  'chamomile-dreams',
  'Chamomile Dreams',
  'Pure chamomile flowers for a calming, relaxing experience',
  'Hand-picked Egyptian chamomile flowers create this soothing, caffeine-free infusion. Known for its calming properties, this gentle tea features sweet, apple-like notes perfect for unwinding before bed or during moments of quiet reflection.',
  119900, NULL, 'Herbal Tea',
  'loose-leaf', 'small', ARRAY['caffeine-free', 'calming', 'bedtime'], '75g', 'Egypt',
  '95-100°C', '5-7 minutes', '3g per cup',
  true, false, false, false, 4.5, 89
),
(
  'jasmine-pearl',
  'Jasmine Pearl',
  'Hand-rolled green tea pearls scented with fresh jasmine blossoms',
  'Each pearl is hand-rolled from tender green tea leaves and naturally scented multiple times with fresh jasmine flowers. As the pearls unfurl in hot water, they release an intoxicating floral aroma and a smooth, sweet taste that lingers beautifully.',
  229900, NULL, 'Green Tea',
  'loose-leaf', 'small', ARRAY['scented', 'artisanal', 'floral'], '75g', 'Fujian, China',
  '75-80°C', '2-3 minutes', '4-5 pearls per cup',
  true, false, false, true, 4.9, 67
);

-- ============================================
-- PRODUCT IMAGES (using Unsplash URLs)
-- ============================================
INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80', true, 0
FROM products WHERE slug = 'darjeeling-first-flush';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80', false, 1
FROM products WHERE slug = 'darjeeling-first-flush';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80', true, 0
FROM products WHERE slug = 'assam-golden-tips';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80', true, 0
FROM products WHERE slug = 'nilgiri-blue-mountain';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', true, 0
FROM products WHERE slug = 'kashmiri-kahwa';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1561336526-2914f13ceb36?w=800&q=80', true, 0
FROM products WHERE slug = 'masala-chai-blend';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80', true, 0
FROM products WHERE slug = 'himalayan-green';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80', true, 0
FROM products WHERE slug = 'white-moonlight';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80', true, 0
FROM products WHERE slug = 'tulsi-herbal-blend';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80', true, 0
FROM products WHERE slug = 'oolong-himalayan';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80', true, 0
FROM products WHERE slug = 'earl-grey-supreme';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', true, 0
FROM products WHERE slug = 'chamomile-dreams';

INSERT INTO product_images (product_id, url, is_primary, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80', true, 0
FROM products WHERE slug = 'jasmine-pearl';

-- ============================================
-- SAMPLE OFFERS
-- ============================================
INSERT INTO offers (name, code, type, value, min_order_value, is_active, starts_at, ends_at) VALUES
  ('Welcome Discount', 'WELCOME10', 'percentage', 10, 99900, true, NOW(), NOW() + INTERVAL '1 year'),
  ('Free Shipping', 'FREESHIP', 'free_shipping', NULL, 99900, true, NOW(), NOW() + INTERVAL '6 months'),
  ('New Year Sale', 'NEWYEAR25', 'percentage', 25, 199900, true, NOW(), '2025-01-31 23:59:59');
