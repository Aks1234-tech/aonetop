-- Migration: Update categories to three main categories (Tea, Honey, Ghee) with subcategories for Tea
-- This restructures the product categorization

-- First, add a parent_id column to support subcategories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES categories(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for parent_id lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Clear existing categories (this will cascade to products if there's a FK, 
-- but products.category is TEXT, so we need to update products first)

-- Insert new category structure
-- Using ON CONFLICT to handle re-runs gracefully
INSERT INTO categories (id, name, description, sort_order, parent_id, image_url) VALUES
  ('tea', 'Tea', 'Premium tea collection including domestic and masala varieties', 1, NULL, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80'),
  ('tea-domestic', 'Domestic Tea', 'Traditional domestic tea varieties', 2, 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'),
  ('tea-masala', 'Masala Tea', 'Spiced masala tea blends', 3, 'tea', 'https://images.unsplash.com/photo-1561336526-2914f13ceb36?w=600&q=80'),
  ('honey', 'Honey', 'Pure and natural honey products', 4, NULL, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80'),
  ('ghee', 'Ghee', 'Premium ghee and clarified butter', 5, NULL, 'https://images.unsplash.com/photo-1631963416786-c715c7b358dd?w=600&q=80')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  parent_id = EXCLUDED.parent_id,
  image_url = EXCLUDED.image_url;

-- Delete old categories that are no longer needed
DELETE FROM categories WHERE id NOT IN ('tea', 'tea-domestic', 'tea-masala', 'honey', 'ghee');

-- Update existing products to map to new categories
-- Map tea-related categories to appropriate subcategories
UPDATE products SET category = 'tea-domestic' 
WHERE category IN ('black-tea', 'green-tea', 'white-tea', 'oolong-tea', 'herbal-tea', 'specialty-tea', 'flavored-tea');

UPDATE products SET category = 'tea-masala' 
WHERE category IN ('chai-blends', 'Chai Blends');

-- For any products with categories that don't exist, default to tea-domestic
UPDATE products SET category = 'tea-domestic' 
WHERE category NOT IN ('tea', 'tea-domestic', 'tea-masala', 'honey', 'ghee');
