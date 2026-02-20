-- Migration: Weight-based product variants with dynamic pricing
-- Allows products to have multiple weight options with different prices

-- ============================================
-- PRODUCT WEIGHT VARIANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_weight_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight TEXT NOT NULL,                    -- e.g., "100g", "250g", "500g", "1kg"
  price INTEGER NOT NULL,                  -- in paise (1 INR = 100 paise)
  original_price INTEGER,                  -- for discounts/sales
  stock_quantity INTEGER DEFAULT 0,        -- per-variant stock tracking
  in_stock BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique weight per product
  UNIQUE(product_id, weight)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weight_variants_product ON product_weight_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_weight_variants_in_stock ON product_weight_variants(in_stock) WHERE in_stock = true;

-- ============================================
-- UPDATE CART_ITEMS TABLE
-- ============================================
ALTER TABLE cart_items 
  ADD COLUMN IF NOT EXISTS weight_variant_id UUID REFERENCES product_weight_variants(id) ON DELETE SET NULL;

-- ============================================
-- UPDATE ORDER_ITEMS TABLE
-- ============================================
ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS weight_variant_id UUID REFERENCES product_weight_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS weight_value TEXT;  -- Denormalized for historical record

-- ============================================
-- RLS POLICIES FOR WEIGHT VARIANTS
-- ============================================
ALTER TABLE product_weight_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can read weight variants (for product display)
CREATE POLICY "Weight variants are viewable by everyone"
  ON product_weight_variants
  FOR SELECT
  USING (true);

-- Only admins can modify weight variants
CREATE POLICY "Admins can manage weight variants"
  ON product_weight_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- HELPER FUNCTION: Get minimum price for product
-- ============================================
CREATE OR REPLACE FUNCTION get_product_min_price(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  min_variant_price INTEGER;
  product_price INTEGER;
BEGIN
  -- Get minimum price from variants
  SELECT MIN(price) INTO min_variant_price
  FROM product_weight_variants
  WHERE product_id = p_product_id AND in_stock = true;
  
  -- If no variants, get product base price
  IF min_variant_price IS NULL THEN
    SELECT price INTO product_price
    FROM products
    WHERE id = p_product_id;
    RETURN product_price;
  END IF;
  
  RETURN min_variant_price;
END;
$$ LANGUAGE plpgsql;
