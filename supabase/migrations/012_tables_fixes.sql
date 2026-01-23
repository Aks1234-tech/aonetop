-- ============================================================================
-- Migration: 012_tables_fixes.sql
-- Description: Add user_id columns to relevant tables and update RLS policies
-- Date: 24 January 2026
-- Purpose: Track user ownership for contact_messages and bulk_inquiries,
--          and update RLS policies to allow users to view their own submissions
-- ============================================================================

-- ============================================================================
-- 1. ADD user_id COLUMN TO contact_messages TABLE
-- ============================================================================
-- Add optional user_id for authenticated users who submit contact messages
ALTER TABLE contact_messages 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user lookup
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id 
  ON contact_messages(user_id) 
  WHERE user_id IS NOT NULL;

COMMENT ON COLUMN contact_messages.user_id 
  IS 'Optional reference to authenticated user who submitted the message. NULL for anonymous submissions.';

-- ============================================================================
-- 2. ADD user_id COLUMN TO bulk_inquiries TABLE
-- ============================================================================
-- Add optional user_id for authenticated users who submit bulk inquiries
ALTER TABLE bulk_inquiries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user lookup
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_user_id 
  ON bulk_inquiries(user_id) 
  WHERE user_id IS NOT NULL;

COMMENT ON COLUMN bulk_inquiries.user_id 
  IS 'Optional reference to authenticated user who submitted the inquiry. NULL for anonymous submissions.';

-- ============================================================================
-- 3. ADD created_by/updated_by COLUMNS TO products TABLE
-- ============================================================================
-- Track which admin created/modified products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_created_by 
  ON products(created_by) 
  WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_updated_by 
  ON products(updated_by) 
  WHERE updated_by IS NOT NULL;

COMMENT ON COLUMN products.created_by 
  IS 'Reference to admin user who created this product';
COMMENT ON COLUMN products.updated_by 
  IS 'Reference to admin user who last updated this product';

-- ============================================================================
-- 4. ADD created_by/updated_by COLUMNS TO categories TABLE
-- ============================================================================
-- Track which admin created/modified categories
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_created_by 
  ON categories(created_by) 
  WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_updated_by 
  ON categories(updated_by) 
  WHERE updated_by IS NOT NULL;

COMMENT ON COLUMN categories.created_by 
  IS 'Reference to admin user who created this category';
COMMENT ON COLUMN categories.updated_by 
  IS 'Reference to admin user who last updated this category';

-- ============================================================================
-- 5. ADD created_by/updated_by COLUMNS TO product_images TABLE
-- ============================================================================
-- Track which admin created/modified product images
ALTER TABLE product_images 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_images_created_by 
  ON product_images(created_by) 
  WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_images_updated_by 
  ON product_images(updated_by) 
  WHERE updated_by IS NOT NULL;

COMMENT ON COLUMN product_images.created_by 
  IS 'Reference to admin user who uploaded this image';
COMMENT ON COLUMN product_images.updated_by 
  IS 'Reference to admin user who last updated this image';

-- ============================================================================
-- 6. UPDATE RLS POLICIES FOR contact_messages TABLE
-- ============================================================================

-- Drop existing policies to recreate them with user_id support
DROP POLICY IF EXISTS "Anyone can submit contact message" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

-- Policy: Anyone (anonymous or authenticated) can submit contact messages
CREATE POLICY "Anyone can submit contact message"
  ON contact_messages 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Users can view their own contact messages (if authenticated)
CREATE POLICY "Users can view own contact messages"
  ON contact_messages 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all contact messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages 
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update contact messages (mark as read, add notes, etc.)
CREATE POLICY "Admins can update contact messages"
  ON contact_messages 
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete contact messages
CREATE POLICY "Admins can delete contact messages"
  ON contact_messages 
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

COMMENT ON POLICY "Users can view own contact messages" ON contact_messages
  IS 'Authenticated users can view their own submitted contact messages';

-- ============================================================================
-- 7. UPDATE RLS POLICIES FOR bulk_inquiries TABLE
-- ============================================================================

-- Drop existing policies to recreate them with user_id support
DROP POLICY IF EXISTS "Anyone can submit bulk inquiry" ON bulk_inquiries;
DROP POLICY IF EXISTS "Admins can view bulk inquiries" ON bulk_inquiries;
DROP POLICY IF EXISTS "Admins can update bulk inquiries" ON bulk_inquiries;

-- Policy: Anyone (anonymous or authenticated) can submit bulk inquiries
CREATE POLICY "Anyone can submit bulk inquiry"
  ON bulk_inquiries 
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Users can view their own bulk inquiries (if authenticated)
CREATE POLICY "Users can view own bulk inquiries"
  ON bulk_inquiries 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all bulk inquiries
CREATE POLICY "Admins can view all bulk inquiries"
  ON bulk_inquiries 
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update bulk inquiries (change status, add notes, etc.)
CREATE POLICY "Admins can update bulk inquiries"
  ON bulk_inquiries 
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete bulk inquiries
CREATE POLICY "Admins can delete bulk inquiries"
  ON bulk_inquiries 
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

COMMENT ON POLICY "Users can view own bulk inquiries" ON bulk_inquiries
  IS 'Authenticated users can view their own submitted bulk inquiries';

-- ============================================================================
-- 8. ADD TRIGGER TO AUTO-SET user_id ON contact_messages INSERT
-- ============================================================================

-- Function to auto-set user_id when an authenticated user submits a contact message
CREATE OR REPLACE FUNCTION set_contact_message_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is authenticated and user_id is not explicitly set, set it
  IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id on insert
DROP TRIGGER IF EXISTS trigger_set_contact_message_user_id ON contact_messages;
CREATE TRIGGER trigger_set_contact_message_user_id
  BEFORE INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_contact_message_user_id();

COMMENT ON FUNCTION set_contact_message_user_id()
  IS 'Auto-sets user_id when authenticated user submits a contact message';

-- ============================================================================
-- 9. ADD TRIGGER TO AUTO-SET user_id ON bulk_inquiries INSERT
-- ============================================================================

-- Function to auto-set user_id when an authenticated user submits a bulk inquiry
CREATE OR REPLACE FUNCTION set_bulk_inquiry_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is authenticated and user_id is not explicitly set, set it
  IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id on insert
DROP TRIGGER IF EXISTS trigger_set_bulk_inquiry_user_id ON bulk_inquiries;
CREATE TRIGGER trigger_set_bulk_inquiry_user_id
  BEFORE INSERT ON bulk_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_bulk_inquiry_user_id();

COMMENT ON FUNCTION set_bulk_inquiry_user_id()
  IS 'Auto-sets user_id when authenticated user submits a bulk inquiry';

-- ============================================================================
-- 10. ADD TRIGGERS FOR TRACKING created_by/updated_by ON products
-- ============================================================================

-- Function to set created_by on product insert
CREATE OR REPLACE FUNCTION set_product_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set updated_by on product update
CREATE OR REPLACE FUNCTION set_product_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_product_created_by ON products;
CREATE TRIGGER trigger_set_product_created_by
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_created_by();

DROP TRIGGER IF EXISTS trigger_set_product_updated_by ON products;
CREATE TRIGGER trigger_set_product_updated_by
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_updated_by();

-- ============================================================================
-- 11. ADD TRIGGERS FOR TRACKING created_by/updated_by ON categories
-- ============================================================================

-- Function to set created_by on category insert
CREATE OR REPLACE FUNCTION set_category_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set updated_by on category update
CREATE OR REPLACE FUNCTION set_category_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_category_created_by ON categories;
CREATE TRIGGER trigger_set_category_created_by
  BEFORE INSERT ON categories
  FOR EACH ROW
  EXECUTE FUNCTION set_category_created_by();

DROP TRIGGER IF EXISTS trigger_set_category_updated_by ON categories;
CREATE TRIGGER trigger_set_category_updated_by
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION set_category_updated_by();

-- ============================================================================
-- 12. ADD TRIGGERS FOR TRACKING created_by/updated_by ON product_images
-- ============================================================================

-- Function to set created_by on product_image insert
CREATE OR REPLACE FUNCTION set_product_image_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set updated_by on product_image update
CREATE OR REPLACE FUNCTION set_product_image_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_product_image_created_by ON product_images;
CREATE TRIGGER trigger_set_product_image_created_by
  BEFORE INSERT ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION set_product_image_created_by();

DROP TRIGGER IF EXISTS trigger_set_product_image_updated_by ON product_images;
CREATE TRIGGER trigger_set_product_image_updated_by
  BEFORE UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION set_product_image_updated_by();

-- ============================================================================
-- 13. VERIFICATION QUERIES
-- ============================================================================

-- Verify new columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('contact_messages', 'bulk_inquiries', 'products', 'categories', 'product_images')
-- AND column_name IN ('user_id', 'created_by', 'updated_by')
-- ORDER BY table_name, column_name;

-- Verify indexes were created:
-- SELECT tablename, indexname 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('contact_messages', 'bulk_inquiries', 'products', 'categories', 'product_images')
-- AND indexname LIKE '%user%'
-- ORDER BY tablename, indexname;

-- Verify RLS policies were updated:
-- SELECT tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('contact_messages', 'bulk_inquiries')
-- ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*

SUMMARY OF CHANGES:
===================

1. Added user_id column to contact_messages table:
   - Optional reference to authenticated user who submitted the message
   - NULL for anonymous submissions
   - Auto-populated via trigger when user is authenticated

2. Added user_id column to bulk_inquiries table:
   - Optional reference to authenticated user who submitted the inquiry
   - NULL for anonymous submissions
   - Auto-populated via trigger when user is authenticated

3. Added created_by and updated_by columns to products table:
   - Track which admin created and last modified each product
   - Auto-populated via triggers

4. Added created_by and updated_by columns to categories table:
   - Track which admin created and last modified each category
   - Auto-populated via triggers

5. Added created_by and updated_by columns to product_images table:
   - Track which admin uploaded and last modified each image
   - Auto-populated via triggers

6. Updated RLS policies for contact_messages:
   - Users can view their own submitted contact messages
   - Admins can view, update, and delete all contact messages
   - Anyone (authenticated or anonymous) can submit messages

7. Updated RLS policies for bulk_inquiries:
   - Users can view their own submitted bulk inquiries
   - Admins can view, update, and delete all bulk inquiries
   - Anyone (authenticated or anonymous) can submit inquiries

8. Added triggers to automatically populate user tracking columns:
   - contact_messages: auto-set user_id on insert
   - bulk_inquiries: auto-set user_id on insert
   - products: auto-set created_by on insert, updated_by on update
   - categories: auto-set created_by on insert, updated_by on update
   - product_images: auto-set created_by on insert, updated_by on update

BENEFITS:
=========

✓ User accountability: Track which authenticated users submit contact messages and bulk inquiries
✓ Admin accountability: Track which admins create/modify products, categories, and images
✓ Better user experience: Users can view their own submission history
✓ Audit trail: Complete history of who created/modified content
✓ Backward compatible: All new columns are nullable, existing data unaffected
✓ Security: RLS policies ensure proper access control

BACKWARD COMPATIBILITY:
=======================

✓ All new columns are nullable (optional)
✓ Existing data remains intact
✓ Anonymous submissions still work (user_id will be NULL)
✓ Existing RLS policies enhanced, not broken
✓ No breaking changes to application code

*/
