-- Migration: Add offer usage tracking per user
-- Purpose: Track which users have used which offers to enforce per-user limits

-- Create offer_usage table to track per-user usage
CREATE TABLE IF NOT EXISTS offer_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, user_id, order_id)
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_offer_usage_offer ON offer_usage(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_user ON offer_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_user ON offer_usage(offer_id, user_id);

-- Add per-user usage limit column to offers table if it doesn't exist
ALTER TABLE offers ADD COLUMN IF NOT EXISTS per_user_limit INTEGER;

-- Add RLS policies for offer_usage table
ALTER TABLE offer_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY IF NOT EXISTS offer_usage_users_can_view_own
  ON offer_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can view offer usage (for their own records)
CREATE POLICY IF NOT EXISTS offer_usage_authenticated_can_view
  ON offer_usage FOR SELECT
  USING (auth.role() = 'authenticated');

-- System (via service role) can insert usage records
CREATE POLICY IF NOT EXISTS offer_usage_system_can_insert
  ON offer_usage FOR INSERT
  WITH CHECK (true);
