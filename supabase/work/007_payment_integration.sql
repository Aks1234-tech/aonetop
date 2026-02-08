-- ============================================
-- PAYMENT INTEGRATION MIGRATION
-- Migration: 007_payment_integration.sql
-- Description: Add Razorpay payment gateway support
-- Date: 13 January 2026
-- ============================================

-- Add payment tracking columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'initiated', 'processing', 'completed', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway ON orders(payment_gateway);

-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- Audit log for all payment attempts
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  amount INTEGER NOT NULL, -- in paise
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  method TEXT, -- 'upi', 'card', 'netbanking', 'wallet'
  bank TEXT,
  wallet TEXT,
  vpa TEXT, -- UPI VPA (e.g., user@upi)
  card_last4 TEXT,
  card_network TEXT, -- 'visa', 'mastercard', 'rupay', etc.
  error_code TEXT,
  error_description TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_payment ON payment_transactions(gateway_payment_id) WHERE gateway_payment_id IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY FOR PAYMENT TRANSACTIONS
-- ============================================
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admins can view all payment transactions
CREATE POLICY "Admins can view all payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert payment transactions (for Edge Functions)
CREATE POLICY "Service role can insert payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (true);

-- Service role can update payment transactions
CREATE POLICY "Service role can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  USING (true);

-- ============================================
-- HELPER FUNCTION: Update payment status
-- ============================================
CREATE OR REPLACE FUNCTION update_order_payment_status(
  p_order_id UUID,
  p_payment_id TEXT,
  p_signature TEXT,
  p_status TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET 
    razorpay_payment_id = p_payment_id,
    razorpay_signature = p_signature,
    payment_status = p_status,
    paid_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE paid_at END,
    status = CASE WHEN p_status = 'completed' THEN 'confirmed' ELSE status END,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
