-- Migration: Add address and pincode fields to bulk_inquiries
-- This allows bulk order inquiries to include delivery location information

ALTER TABLE bulk_inquiries 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT;

-- Add comment for documentation
COMMENT ON COLUMN bulk_inquiries.address IS 'Delivery address for bulk orders';
COMMENT ON COLUMN bulk_inquiries.pincode IS '6-digit postal code for delivery location';
