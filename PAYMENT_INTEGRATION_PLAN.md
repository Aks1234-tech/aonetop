# Payment Integration Implementation Plan

## Razorpay Payment Gateway Integration for Aonetop E-Commerce

**Date:** 12 January 2026  
**Status:** Ready for Implementation  
**Estimated Effort:** 3-4 days

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Phases](#implementation-phases)
4. [File Changes Summary](#file-changes-summary)
5. [Database Schema Changes](#database-schema-changes)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend/Supabase Edge Functions](#backendsupabase-edge-functions)
8. [Security Considerations](#security-considerations)
9. [Testing Plan](#testing-plan)
10. [Rollback Plan](#rollback-plan)

---

## Overview

Integrate Razorpay payment gateway to support:
- **UPI payments** (Google Pay, PhonePe, Paytm, etc.)
- **Card payments** (Credit/Debit cards)
- **Net Banking**
- **Wallets** (Paytm, Amazon Pay, etc.)
- **Cash on Delivery** (existing - retain)

### Current State Analysis

| Component | Current State | Required Changes |
|-----------|--------------|------------------|
| Checkout Page | COD only | Add payment method selection + Razorpay |
| Orders Table | No payment tracking fields | Add payment_id, payment_status, etc. |
| useOrders Hook | Basic order creation | Add payment status updates |
| OrdersManager | Basic status display | Add payment status column + filters |
| TypeScript Types | No payment fields | Update database.types.ts |

---

## Prerequisites

### 1. Razorpay Account Setup

```bash
# Required credentials (store in environment variables)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx    # Public key (frontend)
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx       # Secret key (backend only)
```

**Steps:**
1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Complete business verification
3. Get API keys from Dashboard → Settings → API Keys
4. Configure webhook URL: `https://your-domain.com/api/razorpay/webhook`

### 2. Dependencies

No additional npm packages needed! Razorpay uses a script-based integration.

---

## Implementation Phases

### Phase 1: Database Schema (Day 1 - Morning)

Create migration for payment tracking fields.

### Phase 2: TypeScript Types (Day 1 - Afternoon)

Update type definitions to include payment fields.

### Phase 3: Razorpay Integration Module (Day 2 - Morning)

Create reusable Razorpay integration utilities.

### Phase 4: Checkout Page UI (Day 2 - Afternoon)

Add payment method selection and Razorpay checkout flow.

### Phase 5: Order Hooks (Day 3 - Morning)

Update order creation and payment status mutations.

### Phase 6: Admin Panel (Day 3 - Afternoon)

Add payment status display and filtering.

### Phase 7: Testing & Edge Cases (Day 4)

Test all payment flows and error scenarios.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/007_payment_integration.sql` | **CREATE** | Payment tracking schema |
| `src/lib/database.types.ts` | **MODIFY** | Add payment fields to orders type |
| `src/lib/razorpay.ts` | **CREATE** | Razorpay integration utilities |
| `src/pages/Checkout.tsx` | **MODIFY** | Payment method UI + Razorpay flow |
| `src/hooks/useOrders.ts` | **MODIFY** | Payment status mutations |
| `src/components/admin/OrdersManager.tsx` | **MODIFY** | Payment status display |
| `supabase/functions/create-razorpay-order/index.ts` | **CREATE** | Server-side order creation |
| `supabase/functions/verify-payment/index.ts` | **CREATE** | Payment verification |
| `.env.local` | **MODIFY** | Add Razorpay credentials |

---

## Database Schema Changes

### Migration: `007_payment_integration.sql`

```sql
-- ============================================
-- PAYMENT INTEGRATION MIGRATION
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

-- Create index for payment queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

-- Payment transactions log (for audit trail)
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
  vpa TEXT, -- UPI VPA
  card_last4 TEXT,
  card_network TEXT,
  error_code TEXT,
  error_description TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- RLS for payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Frontend Implementation

### 1. Razorpay Integration Module

**File:** `src/lib/razorpay.ts`

```typescript
// Razorpay Payment Integration for Aonetop
// Documentation: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id?: string;
  };
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  onSuccess: (response: RazorpayPaymentSuccess) => void;
  onError: (error: RazorpayPaymentError) => void;
  onDismiss?: () => void;
}

/**
 * Load Razorpay checkout script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize and open Razorpay checkout modal
 */
export const initiateRazorpayPayment = async (
  options: RazorpayCheckoutOptions
): Promise<void> => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
  }

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKeyId) {
    throw new Error('Razorpay key not configured. Please contact support.');
  }

  const razorpayOptions = {
    key: razorpayKeyId,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name || 'Aonetop',
    description: options.description || 'Order Payment',
    image: options.image || '/logo.png',
    order_id: options.orderId,
    prefill: {
      name: options.prefill?.name || '',
      email: options.prefill?.email || '',
      contact: options.prefill?.contact || '',
    },
    notes: options.notes || {},
    theme: {
      color: options.theme?.color || '#8B7355', // Brand gold color
      backdrop_color: options.theme?.backdrop_color || 'rgba(0, 0, 0, 0.5)',
    },
    handler: (response: RazorpayPaymentSuccess) => {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        options.onDismiss?.();
      },
      escape: true,
      animation: true,
      confirm_close: true,
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);

  razorpay.on('payment.failed', (response: { error: RazorpayPaymentError }) => {
    options.onError(response.error);
  });

  razorpay.open();
};

/**
 * Payment method display names
 */
export const PAYMENT_METHODS = {
  cod: { label: 'Cash on Delivery', icon: 'Truck', description: 'Pay when order arrives' },
  online: { label: 'Pay Online', icon: 'CreditCard', description: 'UPI, Cards, Net Banking, Wallets' },
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;
```

### 2. Checkout Page Modifications

**File:** `src/pages/Checkout.tsx`

Key changes:
1. Add payment method state (`cod` | `online`)
2. Add payment method selection UI
3. Modify `handleSubmit` for online payment flow
4. Add loading/processing states

```tsx
// New state additions
const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
const [isProcessingPayment, setIsProcessingPayment] = useState(false);

// Modified handleSubmit flow:
// 1. Create order in Supabase (status: pending, payment_status: pending)
// 2. If online payment:
//    a. Create Razorpay order via Edge Function
//    b. Open Razorpay checkout modal
//    c. On success: verify payment & update order
//    d. On failure: show error & allow retry
// 3. If COD: proceed as before
```

### 3. Payment Method Selection UI

```tsx
{/* Payment Method Selection */}
<div className="bg-card rounded-2xl p-6 shadow-soft">
  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
    Payment Method
  </h2>
  
  <div className="space-y-3">
    {/* Cash on Delivery */}
    <label
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
        paymentMethod === 'cod' 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      )}
    >
      <input
        type="radio"
        name="paymentMethod"
        value="cod"
        checked={paymentMethod === 'cod'}
        onChange={() => setPaymentMethod('cod')}
        className="sr-only"
      />
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
        paymentMethod === 'cod' ? "border-primary" : "border-muted-foreground"
      )}>
        {paymentMethod === 'cod' && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Cash on Delivery</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Pay when your order arrives at your doorstep
        </p>
      </div>
    </label>

    {/* Online Payment */}
    <label
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
        paymentMethod === 'online' 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      )}
    >
      <input
        type="radio"
        name="paymentMethod"
        value="online"
        checked={paymentMethod === 'online'}
        onChange={() => setPaymentMethod('online')}
        className="sr-only"
      />
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
        paymentMethod === 'online' ? "border-primary" : "border-muted-foreground"
      )}>
        {paymentMethod === 'online' && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Pay Online</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Secure
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          UPI, Credit/Debit Card, Net Banking, Wallets
        </p>
        <div className="flex gap-2 mt-2">
          <img src="/payments/upi.svg" alt="UPI" className="h-6" />
          <img src="/payments/visa.svg" alt="Visa" className="h-6" />
          <img src="/payments/mastercard.svg" alt="Mastercard" className="h-6" />
        </div>
      </div>
    </label>
  </div>
</div>
```

---

## Backend/Supabase Edge Functions

### 1. Create Razorpay Order

**File:** `supabase/functions/create-razorpay-order/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from 'https://esm.sh/razorpay@2.9.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, amount, currency = 'INR' } = await req.json();

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // in paise
      currency: currency,
      receipt: orderId,
      notes: {
        order_id: orderId,
      },
    });

    // Update order with Razorpay order ID
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrder.id,
        payment_status: 'initiated',
        payment_gateway: 'razorpay',
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

### 2. Verify Payment

**File:** `supabase/functions/verify-payment/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Update order with payment details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
        status: 'confirmed', // Auto-confirm paid orders
      })
      .eq('id', orderId);

    if (error) throw error;

    // Log transaction
    await supabase.from('payment_transactions').insert({
      order_id: orderId,
      gateway_order_id: razorpay_order_id,
      gateway_payment_id: razorpay_payment_id,
      amount: 0, // Fetch from order
      status: 'captured',
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

---

## TypeScript Type Updates

**File:** `src/lib/database.types.ts`

Add to orders Row/Insert/Update types:

```typescript
// Add to orders Row type
razorpay_order_id: string | null;
razorpay_payment_id: string | null;
razorpay_signature: string | null;
payment_status: 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded';
payment_gateway: 'cod' | 'razorpay';
paid_at: string | null;

// Add new payment_transactions table type
payment_transactions: {
  Row: {
    id: string;
    order_id: string;
    payment_gateway: string;
    gateway_order_id: string | null;
    gateway_payment_id: string | null;
    amount: number;
    currency: string;
    status: string;
    method: string | null;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    card_last4: string | null;
    card_network: string | null;
    error_code: string | null;
    error_description: string | null;
    raw_response: Record<string, any> | null;
    created_at: string;
  };
  // ... Insert and Update types
};
```

---

## useOrders Hook Updates

**File:** `src/hooks/useOrders.ts`

Add new mutations:

```typescript
// Create Razorpay order
export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: async ({ orderId, amount }: { orderId: string; amount: number }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orderId, amount }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      return response.json();
    },
  });
}

// Verify payment
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Update payment status (for failed payments)
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      errorMessage,
    }: {
      orderId: string;
      status: string;
      errorMessage?: string;
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: status,
          ...(errorMessage && { notes: errorMessage }),
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

---

## Admin Panel Updates

**File:** `src/components/admin/OrdersManager.tsx`

Add payment status column:

```tsx
// Payment status badge colors
const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  initiated: { label: 'Initiated', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

// Add to table header
<th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
  Payment
</th>

// Add to table row
<td className="py-3 px-4">
  <div className="flex flex-col gap-1">
    <span className={cn(
      "text-xs px-2 py-0.5 rounded-full inline-flex w-fit",
      PAYMENT_STATUSES[order.payment_status]?.color
    )}>
      {PAYMENT_STATUSES[order.payment_status]?.label}
    </span>
    <span className="text-xs text-muted-foreground">
      {order.payment_gateway === 'razorpay' ? 'Online' : 'COD'}
    </span>
  </div>
</td>
```

---

## Security Considerations

### 1. Never Expose Secret Key
- `RAZORPAY_KEY_SECRET` must **NEVER** be in frontend code
- Only use in Supabase Edge Functions

### 2. Always Verify Payments Server-Side
- Never trust frontend payment status
- Always verify signature before confirming order

### 3. Use HTTPS Only
- Razorpay requires HTTPS for production

### 4. Implement Webhooks (Recommended)
- Handle delayed payment confirmations
- Handle refund notifications

---

## Testing Plan

### 1. Test Mode Credentials
- Use `rzp_test_*` keys for testing
- Test card: `4111 1111 1111 1111`, any CVV, any future expiry

### 2. Test Scenarios

| Scenario | Test Steps | Expected Result |
|----------|-----------|-----------------|
| Successful Card Payment | Select online → Enter test card → Complete | Order confirmed, payment_status = completed |
| Successful UPI Payment | Select online → Choose UPI → Use test UPI | Order confirmed |
| Failed Payment | Select online → Cancel payment | Order stays pending, can retry |
| COD Order | Select COD → Place order | Order pending, no Razorpay call |
| Network Error | Disconnect during payment | Graceful error, can retry |
| Duplicate Payment | Try to pay twice | Prevent double charge |

### 3. Manual Test Checklist

- [ ] COD flow works as before
- [ ] Online payment creates Razorpay order
- [ ] Razorpay modal opens with correct amount
- [ ] Successful payment updates order status
- [ ] Failed payment shows error message
- [ ] Order history shows payment status
- [ ] Admin can see payment status
- [ ] Mobile responsive checkout

---

## Rollback Plan

### If Issues Occur:

1. **Disable Online Payment:**
   ```tsx
   // In Checkout.tsx, hide online payment option
   const ENABLE_ONLINE_PAYMENT = false;
   ```

2. **Database Rollback:**
   ```sql
   -- Revert payment columns (if needed)
   ALTER TABLE orders 
     DROP COLUMN IF EXISTS razorpay_order_id,
     DROP COLUMN IF EXISTS razorpay_payment_id,
     -- etc.
   ```

3. **Keep COD Working:**
   - COD functionality is independent
   - No changes required to existing COD flow

---

## Environment Variables Summary

```bash
# .env.local (frontend)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Supabase Edge Function Secrets (via dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

---

## Post-Implementation Checklist

- [ ] Razorpay account verified
- [ ] Test mode working
- [ ] Production keys obtained
- [ ] Webhook configured
- [ ] SSL certificate active
- [ ] Error logging implemented
- [ ] User documentation updated
- [ ] Support team briefed

---

## Questions for Stakeholder

1. **Refund Policy:** Should admins be able to initiate refunds from the panel?
2. **Partial Payments:** Support for EMI or partial payments?
3. **International Payments:** Need to accept foreign cards?
4. **Payment Timeout:** How long before marking payment as failed?
5. **Receipt Generation:** Auto-generate payment receipt PDF?

---

*Document Version: 1.0*  
*Last Updated: 12 January 2026*
