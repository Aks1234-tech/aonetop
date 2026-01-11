# Implementation Plan: Aonetop E-Commerce Platform Enhancements

## Overview

This document outlines the technical implementation plan for enhancing the Aonetop e-commerce platform. The changes focus on streamlining product information, improving order management, reorganizing product categories, integrating WhatsApp for customer enquiries, implementing weight-based pricing, and adding payment gateway integration.

---

## User Review Required

> [!IMPORTANT]
> **Payment Gateway Selection Required**
> Multiple UPI payment gateway options are available for integration. Please confirm which payment gateway provider you prefer:
> - **Razorpay** - Most popular, supports UPI, Cards, Wallets, Net Banking
> - **PhonePe Payment Gateway** - Direct UPI integration
> - **Paytm Payment Gateway** - UPI + Wallet
> - **Cashfree** - Good for SMEs
> - **Instamojo** - Simple integration
> 
> Each has different pricing models and integration requirements. Default recommendation: **Razorpay** (most comprehensive).

> [!WARNING]
> **Breaking Changes**
> - Removing `origin`, `brewing_temp`, `brewing_time`, and `brewing_amount` fields will require database migration
> - Existing product data in these fields will be permanently deleted
> - Category structure changes may affect existing product references

> [!IMPORTANT]
> **WhatsApp Business API Requirements**
> To integrate WhatsApp for enquiries, you'll need:
> - WhatsApp Business Account (verified)
> - WhatsApp Business API access (requires Facebook Business Manager)
> - OR use a third-party service like:
>   - **Twilio WhatsApp API** (paid, easiest integration)
>   - **wa.me links** (free, opens WhatsApp directly but no automated messages)
>   - **WATI/Interakt** (WhatsApp Business API resellers)
> 
> Please confirm which approach you prefer.

---

## Proposed Changes

### 1. Product Schema - Remove Origin and Brewing Instructions

Remove fields that are no longer needed from the product data structure.

---

#### [MODIFY] Database Migration

**File**: `supabase/migrations/003_remove_product_fields.sql` (NEW)

Create a new migration to remove the following columns from the `products` table:
- `origin` (TEXT)
- `brewing_temp` (TEXT)
- `brewing_time` (TEXT)
- `brewing_amount` (TEXT)

```sql
-- Migration to remove origin and brewing instruction fields
ALTER TABLE products 
  DROP COLUMN IF EXISTS origin,
  DROP COLUMN IF EXISTS brewing_temp,
  DROP COLUMN IF EXISTS brewing_time,
  DROP COLUMN IF EXISTS brewing_amount;
```

---

#### [MODIFY] [database.types.ts](file:///d:/aonetop/src/lib/database.types.ts)

Update TypeScript type definitions to remove:
- Lines 53-55: Remove brewing fields from Row type
- Lines 78-80: Remove brewing fields from Insert type
- Lines 103-105: Remove brewing fields from Update type

---

#### [MODIFY] [ProductsManager.tsx](file:///d:/aonetop/src/components/admin/ProductsManager.tsx)

Remove origin and brewing instruction form fields from admin product creation/editing:
- Lines 61-64: Remove from `FormData` interface
- Lines 80-83: Remove from initial form state
- Lines 123-126: Remove from edit form population
- Lines 157-160: Remove from product creation/update payload
- Lines 461-499: Remove entire "Origin" and "Brewing Info" form sections

---

#### [MODIFY] [ProductDetails.tsx](file:///d:/aonetop/src/pages/ProductDetails.tsx)

Remove origin and brewing instructions display from product detail page:
- Lines 196-198: Remove origin display section
- Lines 209-237: Remove entire "Brewing Instructions" card section

---

#### [MODIFY] [products.ts](file:///d:/aonetop/src/data/products.ts)

Remove origin and brewingInstructions from mock product data:
- Line 13: Remove `origin` from Product interface
- Lines 14-18: Remove `brewingInstructions` from Product interface
- Remove all instances in product objects (lines 43-48, 69-73, etc. for all products)

---

### 2. Order Management - Fix Multi-User Order Numbering Conflicts

Implement thread-safe order number generation to prevent conflicts when multiple users place orders simultaneously.

---

#### [MODIFY] [001_initial_schema.sql](file:///d:/aonetop/supabase/migrations/001_initial_schema.sql#L227-L248)

**Current Issue**: The existing `generate_order_number()` function uses a `SELECT MAX()` query that can cause race conditions when multiple orders are created simultaneously.

**Solution**: Implement a PostgreSQL sequence-based approach with row-level locking:

```sql
-- Create a sequence for order numbering
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Improved thread-safe order number generator
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Use advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext('order_number_generation'));
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%'
    FOR UPDATE; -- Row-level lock
  
  NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Alternative Solution**: Use a dedicated sequence table:

```sql
-- Create order counter table
CREATE TABLE IF NOT EXISTS order_counters (
  year INTEGER PRIMARY KEY,
  counter INTEGER DEFAULT 0
);

-- Improved function using dedicated counter table
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part INTEGER;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Upsert and increment counter atomically
  INSERT INTO order_counters (year, counter)
  VALUES (year_part, 1)
  ON CONFLICT (year) DO UPDATE
  SET counter = order_counters.counter + 1
  RETURNING counter INTO seq_num;
  
  NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Product Categories - Reorganize into Three Main Categories

Restructure product categorization to focus on three main product types: Tea, Honey, and Ghee, with subcategories for Tea.

---

#### [MODIFY] Database - Categories Table

**File**: Create migration `supabase/migrations/004_update_categories.sql`

```sql
-- Clear existing categories
TRUNCATE TABLE categories CASCADE;

-- Insert new category structure
INSERT INTO categories (id, name, description, sort_order) VALUES
  ('tea', 'Tea', 'Premium tea collection including domestic and masala varieties', 1),
  ('tea-domestic', 'Domestic Tea', 'Traditional domestic tea varieties', 2),
  ('tea-masala', 'Masala Tea', 'Spiced masala tea blends', 3),
  ('honey', 'Honey', 'Pure and natural honey products', 4),
  ('ghee', 'Ghee', 'Premium ghee and clarified butter', 5);
```

---

#### [MODIFY] [ShopByCategory.tsx](file:///d:/aonetop/src/components/home/ShopByCategory.tsx)

Update category display to show the three main categories with appropriate icons and descriptions:
- Update category cards to display: Tea, Honey, Ghee
- Implement sub-category navigation for Tea (Domestic/Masala)
- Update category images/icons

---

#### [MODIFY] [Shop.tsx](file:///d:/aonetop/src/pages/Shop.tsx)

Update shop page filters:
- Implement hierarchical category filtering
- Add Tea sub-category filters (Domestic, Masala)
- Update category breadcrumbs

---

#### [MODIFY] Product Data Seeding

**File**: `supabase/seed.sql`

Update product category assignments to match new structure:
- Categorize existing products into tea/honey/ghee
- Assign tea products to domestic or masala subcategories
- Ensure all products have valid category references

---

### 4. Homepage Images - Update Hero and Feature Sections

Replace placeholder images with new branded imagery.

---

#### [MODIFY] [Hero.tsx](file:///d:/aonetop/src/components/home/Hero.tsx)

Update hero section images:
- Replace hero background image
- Update featured product images
- Implement responsive image loading

---

#### [MODIFY] [FeaturedProducts.tsx](file:///d:/aonetop/src/components/home/FeaturedProducts.tsx)

Update featured product section imagery:
- Replace product showcase images
- Add category-specific banner images

---

#### [MODIFY] [Bestsellers.tsx](file:///d:/aonetop/src/components/home/Bestsellers.tsx)

Update bestseller section:
- Refresh product images
- Update section background imagery

---

#### Image Assets Required

New image assets needed:
- Hero banner (1920x1080px recommended)
- Category banners for Tea/Honey/Ghee (600x400px each)
- Product showcase images (800x800px minimum)
- Mobile-optimized versions (max 768px width)

**Storage**: Upload to Supabase Storage bucket or use existing public folder structure

---

### 5. WhatsApp Integration - Replace Supabase Forms with WhatsApp

Redirect contact and bulk enquiry forms to WhatsApp instead of storing in Supabase.

---

#### Option A: Simple wa.me Link (Recommended for Quick Implementation)

#### [MODIFY] [Contact.tsx](file:///d:/aonetop/src/pages/Contact.tsx#L26-L59)

Replace form submission with WhatsApp redirect:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Construct WhatsApp message
  const message = `*New Contact Enquiry*\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
  
  const phoneNumber = '919876543210'; // Your WhatsApp Business number
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
  
  toast({
    title: 'Redirecting to WhatsApp',
    description: 'You will be redirected to WhatsApp to send your message.',
  });
};
```

---

#### [MODIFY] [BulkOrders.tsx](file:///d:/aonetop/src/pages/BulkOrders.tsx#L53-L88)

Replace bulk inquiry submission with WhatsApp:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const message = `*Bulk Order Inquiry*\n\nCompany: ${formData.companyName}\nContact: ${formData.contactName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nBusiness Type: ${formData.businessType}\nEstimated Volume: ${formData.estimatedVolume}\nProducts: ${formData.productsInterested}\n\nMessage:\n${formData.message}`;
  
  const phoneNumber = '919876543210';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
  
  setSubmitted(true);
};
```

---

#### [MODIFY] UI Components - Add WhatsApp Icon

Add floating WhatsApp button in layout:

**File**: `src/components/layout/FloatingWhatsApp.tsx` (NEW)

```typescript
// Floating WhatsApp button component
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const handleClick = () => {
    window.open('https://wa.me/919876543210', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
};
```

Add to main App layout.

---

#### Option B: WhatsApp Business API Integration (Advanced)

If using Twilio or similar service:

**File**: `src/lib/whatsapp.ts` (NEW)

```typescript
// WhatsApp API integration
export const sendWhatsAppMessage = async (to: string, message: string) => {
  const response = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message })
  });
  return response.json();
};
```

Requires backend API endpoint setup.

---

### 6. Weight Categorization - Product Weight & Price System

Implement weight-based product variants with dynamic pricing.

---

#### [MODIFY] Database Schema

**File**: `supabase/migrations/005_weight_variants.sql` (NEW)

```sql
-- Add weight variant support
CREATE TABLE product_weight_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  weight_category TEXT NOT NULL CHECK (weight_category IN ('small', 'medium', 'large', 'bulk')),
  weight_value TEXT NOT NULL, -- e.g., '100g', '250g', '500g', '1kg'
  price INTEGER NOT NULL, -- price in paise
  original_price INTEGER,
  in_stock BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, weight_category)
);

CREATE INDEX idx_weight_variants_product ON product_weight_variants(product_id);

-- Add selected weight to cart items
ALTER TABLE cart_items ADD COLUMN weight_variant_id UUID REFERENCES product_weight_variants(id);

-- Add selected weight to order items
ALTER TABLE order_items ADD COLUMN weight_variant_id UUID REFERENCES product_weight_variants(id);
ALTER TABLE order_items ADD COLUMN weight_value TEXT; -- denormalized
```

---

#### [MODIFY] [ProductsManager.tsx](file:///d:/aonetop/src/components/admin/ProductsManager.tsx)

Add weight variant management interface:
- Add weight variants table in product form
- Allow adding multiple weight options per product
- Set price for each weight variant
- Manage stock per weight variant

---

#### [MODIFY] [ProductDetails.tsx](file:///d:/aonetop/src/pages/ProductDetails.tsx)

Add weight selection UI:
- Display available weight options as selectable buttons/dropdown
- Update price display based on selected weight
- Pass selected weight variant to cart

---

#### [MODIFY] [CartContext.tsx](file:///d:/aonetop/src/contexts/CartContext.tsx)

Update cart logic to include weight variant:
- Store weight_variant_id with cart items
- Display weight information in cart
- Calculate prices based on selected weight

---

#### [MODIFY] [useOrders.ts](file:///d:/aonetop/src/hooks/useOrders.ts)

Update order creation to include weight variant information.

---

### 7. Bulk Order Address - Split Address and Pincode

Improve bulk order form with separate address and pincode fields.

---

#### [MODIFY] Database Schema

**File**: `supabase/migrations/006_bulk_order_address.sql` (NEW)

```sql
-- Add address fields to bulk_inquiries
ALTER TABLE bulk_inquiries 
  ADD COLUMN address TEXT,
  ADD COLUMN pincode TEXT;
```

---

#### [MODIFY] [BulkOrders.tsx](file:///d:/aonetop/src/pages/BulkOrders.tsx#L37-L46)

Add address fields to form:

```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  address: '',
  pincode: '',
});
```

Add form fields after products section (around line 269):

```tsx
<div className="grid sm:grid-cols-2 gap-6">
  <div className="sm:col-span-2">
    <Label htmlFor="address">Delivery Address</Label>
    <Textarea
      id="address"
      name="address"
      value={formData.address}
      onChange={handleChange}
      placeholder="Enter complete delivery address"
      rows={3}
    />
  </div>
  <div>
    <Label htmlFor="pincode">Pincode</Label>
    <Input
      id="pincode"
      name="pincode"
      value={formData.pincode}
      onChange={handleChange}
      placeholder="Enter 6-digit pincode"
      maxLength={6}
    />
  </div>
</div>
```

Update WhatsApp message to include address and pincode.

---

#### [MODIFY] [useForms.ts](file:///d:/aonetop/src/hooks/useForms.ts)

Update bulk inquiry mutation to include address and pincode fields.

---

### 8. Remove Corporate from Bulk Order

Remove "Corporate" option from business type dropdown in bulk order form.

---

#### [MODIFY] [BulkOrders.tsx](file:///d:/aonetop/src/pages/BulkOrders.tsx#L236)

Remove line 236:
```tsx
<option value="corporate">Corporate</option>
```

This is a simple one-line deletion.

---

### 9. Payment Integration - UPI and Multiple Payment Methods

Integrate payment gateway for online payments (Razorpay recommended).

---

#### Dependencies

Add to `package.json`:
```json
"dependencies": {
  "razorpay": "^2.9.4" // If using backend
}
```

For frontend-only:
- Use Razorpay Checkout script (loaded via CDN)

---

#### [NEW] Environment Variables

Add to `.env.local`:
```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret # Backend only
```

---

#### [NEW] Payment Integration Module

**File**: `src/lib/razorpay.ts` (NEW)

```typescript
// Razorpay payment integration
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayOptions {
  amount: number; // in paise
  currency: string;
  orderId: string;
  name: string;
  description: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const initiateRazorpayPayment = async (options: RazorpayOptions) => {
  const loaded = await loadRazorpayScript();
  
  if (!loaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  const razorpayOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.orderId,
    prefill: {
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    theme: {
      color: '#8B7355', // Brand color
    },
    handler: (response: any) => {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        options.onFailure(new Error('Payment cancelled'));
      },
    },
  };

  const razorpay = new (window as any).Razorpay(razorpayOptions);
  razorpay.open();
};
```

---

#### [MODIFY] Database Schema

**File**: `supabase/migrations/007_payment_integration.sql` (NEW)

```sql
-- Add payment tracking
ALTER TABLE orders 
  ADD COLUMN payment_id TEXT, -- Razorpay payment ID
  ADD COLUMN payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  ADD COLUMN payment_gateway TEXT DEFAULT 'razorpay',
  ADD COLUMN paid_at TIMESTAMPTZ;

-- Payment transaction log
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_gateway TEXT NOT NULL,
  gateway_payment_id TEXT,
  gateway_order_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,
  error_message TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
```

---

#### [MODIFY] [Checkout.tsx](file:///d:/aonetop/src/pages/Checkout.tsx)

Add payment method selection and Razorpay integration:

1. Add payment method state (COD vs Online):
```typescript
const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
```

2. Add payment method selection UI (radio buttons)

3. Modify handleSubmit to initiate Razorpay for online payments:
```typescript
if (paymentMethod === 'online') {
  // Create order first (to get order_id)
  const order = await createOrder.mutateAsync(orderData);
  
  // Initiate Razorpay payment
  await initiateRazorpayPayment({
    amount: finalTotal,
    currency: 'INR',
    orderId: order.order_number,
    name: 'Aonetop',
    description: `Order ${order.order_number}`,
    customerEmail: checkoutData.email,
    customerPhone: checkoutData.phone,
    onSuccess: async (response) => {
      // Update order with payment details
      // Show success message
    },
    onFailure: (error) => {
      // Handle payment failure
    },
  });
} else {
  // COD flow remains unchanged
}
```

---

#### [MODIFY] [useOrders.ts](file:///d:/aonetop/src/hooks/useOrders.ts)

Add mutation to update payment status:

```typescript
export const useUpdatePaymentStatus = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      paymentId,
      status,
    }: {
      orderId: string;
      paymentId: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_id: paymentId,
          payment_status: status,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
    },
  });
};
```

---

#### [MODIFY] Admin - Payment Status Display

**File**: [OrdersManager.tsx](file:///d:/aonetop/src/components/admin/OrdersManager.tsx)

Add payment status column in orders table:
- Display payment_status badge
- Show payment_id
- Add filter for payment status

---

#### Backend Considerations (Optional)

For production Razorpay integration, consider:
- Backend order verification endpoint
- Webhook handler for payment status updates
- Signature verification for security

**File**: Backend API endpoint (if implementing server-side)
- Verify payment signature
- Update order status
- Send confirmation email

---

## Verification Plan

### Automated Tests

1. **Database Migrations**
   ```bash
   # Reset and apply all migrations
   supabase db reset
   supabase db push
   ```

2. **Type Checking**
   ```bash
   npm run build
   ```

3. **Linting**
   ```bash
   npm run lint
   ```

### Manual Verification

1. **Product Management**
   - Navigate to admin panel → Products
   - Create new product without origin/brewing fields
   - Verify weight variants can be added
   - Check category dropdown shows new structure

2. **Order Numbering**
   - Create multiple test orders simultaneously (use multiple browser tabs)
   - Verify unique order numbers are generated
   - Check no conflicts in order_number column

3. **Categories**
   - Visit shop page
   - Verify Tea, Honey, Ghee categories display
   - Test Tea subcategory filters (Domestic/Masala)
   - Ensure products are correctly categorized

4. **Homepage**
   - Verify new images load correctly
   - Check responsive behavior on mobile
   - Test image optimization and loading speed

5. **WhatsApp Integration**
   - Submit contact form → verify WhatsApp opens with pre-filled message
   - Submit bulk order form → verify WhatsApp redirect
   - Test floating WhatsApp button
   - Verify message formatting is correct

6. **Weight Selection**
   - Visit product detail page
   - Select different weight options
   - Verify price updates correctly
   - Add to cart and verify weight is saved
   - Complete checkout and verify order shows correct weight

7. **Bulk Order Address**
   - Fill bulk order form
   - Verify address and pincode fields work
   - Check validation for pincode (6 digits)

8. **Payment Integration**
   - Place test order with "Online Payment"
   - Verify Razorpay modal opens
   - Complete test payment (use Razorpay test mode)
   - Verify payment status updates in admin panel
   - Test COD flow still works

---

## Database Migration Sequence

Run migrations in this order:

1. `003_remove_product_fields.sql` - Remove origin and brewing fields
2. `004_update_categories.sql` - Update category structure
3. `005_weight_variants.sql` - Add weight variant system
4. `006_bulk_order_address.sql` - Add address fields to bulk orders
5. `007_payment_integration.sql` - Add payment tracking

---

## Environment Setup Required

### New Environment Variables

Add to `.env.local`:

```bash
# WhatsApp
VITE_WHATSAPP_BUSINESS_NUMBER=919876543210

# Payment Gateway (Razorpay)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx # Backend only, not in client
```

### External Service Setup

1. **WhatsApp Business**
   - Set up WhatsApp Business account
   - (Optional) Configure WhatsApp Business API with Twilio

2. **Razorpay**
   - Create Razorpay account at https://razorpay.com
   - Get API keys from dashboard
   - Configure webhook URL for payment notifications

---

## Rollback Plan

If issues arise during implementation:

1. **Database Rollback**
   ```bash
   # Revert specific migration
   supabase migration rollback <migration_name>
   ```

2. **Code Rollback**
   - Use git to revert to previous commit
   - Redeploy previous version

3. **Data Recovery**
   - Database backups should be taken before migration
   - Restore from Supabase backup if needed

---

## Post-Implementation Tasks

1. **Update Documentation**
   - Update README with new features
   - Document payment flow
   - Update API documentation

2. **User Communication**
   - Notify users about new payment options
   - Update help/FAQ pages
   - Train admin users on new features

3. **Monitoring**
   - Monitor payment success rate
   - Track WhatsApp enquiry conversions
   - Monitor order numbering for conflicts
   - Check category usage analytics

---

## Notes

- All changes maintain backward compatibility where possible
- Database migrations include rollback scripts
- Payment integration uses test mode initially
- WhatsApp integration can be implemented in phases (simple wa.me links first, full API later)
- Weight variant system is optional per product (products can still work without variants)
