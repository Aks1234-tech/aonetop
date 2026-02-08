-- Migration: Fix Multi-User Order Numbering Conflicts
-- This migration implements thread-safe order number generation using a dedicated counter table

-- Step 1: Create order counter table for atomic incrementing
CREATE TABLE IF NOT EXISTS order_counters (
  year INTEGER PRIMARY KEY,
  counter INTEGER DEFAULT 0
);

-- Step 2: Initialize counter with existing orders (if any)
INSERT INTO order_counters (year, counter)
SELECT 
  EXTRACT(YEAR FROM created_at)::INTEGER as year,
  COUNT(*)::INTEGER as counter
FROM orders
GROUP BY EXTRACT(YEAR FROM created_at)::INTEGER
ON CONFLICT (year) DO UPDATE SET counter = EXCLUDED.counter;

-- Step 3: Replace the order number generation function with thread-safe version
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part INTEGER;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Upsert and increment counter atomically
  -- This uses PostgreSQL's INSERT ... ON CONFLICT with RETURNING for atomic increment
  INSERT INTO order_counters (year, counter)
  VALUES (year_part, 1)
  ON CONFLICT (year) DO UPDATE
  SET counter = order_counters.counter + 1
  RETURNING counter INTO seq_num;
  
  NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Add unique constraint on order_number to prevent duplicates (safety net)
-- This will cause an error if somehow duplicates still occur
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_unique'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
  END IF;
END $$;

-- Step 5: Add RLS policy for order_counters table
ALTER TABLE order_counters ENABLE ROW LEVEL SECURITY;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON order_counters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON order_counters TO service_role;
GRANT ALL ON order_counters TO postgres;

-- RLS Policy: Allow authenticated users to read order counters
-- This is needed for the trigger function to check existing counter values
CREATE POLICY "Allow authenticated users to read order counters"
  ON order_counters
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow authenticated users to insert new year counters
-- This is needed when the first order of a new year is placed
CREATE POLICY "Allow authenticated users to insert order counters"
  ON order_counters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to update counters
-- This is needed to increment the counter when orders are placed
CREATE POLICY "Allow authenticated users to update order counters"
  ON order_counters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to order counters"
  ON order_counters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 6: Make the trigger function SECURITY DEFINER to ensure it can always access order_counters
-- This ensures the function runs with elevated privileges regardless of caller
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part INTEGER;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Upsert and increment counter atomically
  -- This uses PostgreSQL's INSERT ... ON CONFLICT with RETURNING for atomic increment
  INSERT INTO order_counters (year, counter)
  VALUES (year_part, 1)
  ON CONFLICT (year) DO UPDATE
  SET counter = order_counters.counter + 1
  RETURNING counter INTO seq_num;
  
  NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE order_counters IS 'Stores yearly order counters for thread-safe order number generation';
COMMENT ON FUNCTION public.generate_order_number() IS 'Generates unique order numbers in format ORD-YYYY-NNNN using atomic counter increment';
