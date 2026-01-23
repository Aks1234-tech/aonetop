# Quick Integration Guide: Feature 2 Enhancements

## What Was Done

✅ **Per-User Usage Tracking**
- Database migration created: `008_offer_usage_tracking.sql`
- New functions in `useOffers.ts` for validation and tracking
- CartContext updated to validate per-user limits
- Admin UI updated with per-user limit field

✅ **Product/Category-Specific Validation**
- New validation functions in `useOffers.ts`
- CartContext now fetches product categories and validates offers
- Offers only apply if cart contains qualifying products/categories

---

## Next Steps: Integrate with Checkout

### Step 1: Update Checkout.tsx

After successful order creation, record offer usage:

```typescript
// At the top of Checkout.tsx
import { recordOfferUsageOnOrderCreation, incrementOfferUsageCount } from '@/lib/offerUtils';
import { useCart } from '@/contexts/CartContext';

// Inside your order creation success handler:
const { appliedOffer, user } = useCart();

if (appliedOffer && user && orderId) {
  try {
    // Record the usage
    await recordOfferUsageOnOrderCreation(appliedOffer.id, user.id, orderId);
    // Increment global counter
    await incrementOfferUsageCount(appliedOffer.id);
    // Clear the offer from cart
    removeOffer();
  } catch (err) {
    console.error('Error recording offer usage:', err);
    // Don't fail the order if tracking fails
  }
}
```

### Step 2: Run Database Migration

```bash
# Navigate to your project
cd /home/hackycoder/my_Data/aonetop

# If using Supabase CLI:
supabase migration up

# Or manually run the SQL in Supabase dashboard:
# Execute: supabase/migrations/008_offer_usage_tracking.sql
```

### Step 3: Test the Implementation

#### Test Per-User Limits:
1. Create an offer with `per_user_limit = 1`
2. Login and try applying the code twice
3. First attempt should succeed, second should fail

#### Test Product/Category Validation:
1. Create an offer with `applies_to = 'products'` and link specific products
2. Add non-qualifying products to cart
3. Offer should fail to apply
4. Add qualifying product and try again
5. Offer should now apply

### Step 4: Admin UI Enhancement (Optional)

The OffersManager now shows the per-user limit field when creating/editing offers.

**Future enhancement:** Add product/category selector UI in the dialog for easier management.

---

## Key Functions to Know

### In CartContext
- `applyOffer(code)` - Now validates per-user limits and product/category restrictions
- Returns `true` if successful, `false` if validation fails

### In useOffers.ts
- `checkPerUserOfferUsage(offerId, userId, perUserLimit)` - Check if user can use offer
- `validateOfferAppliesToCart(offerId, appliesTo, cartItems)` - Check if offer applies to cart
- `recordOfferUsage(offerId, userId, orderId)` - Record usage (can be called directly if needed)

### In offerUtils.ts (new)
- `recordOfferUsageOnOrderCreation(offerId, userId, orderId)` - Record usage after order
- `incrementOfferUsageCount(offerId)` - Update global usage counter

---

## Database Structure

### New Table: offer_usage
Tracks which users used which offers:
- `offer_id` - UUID of the offer
- `user_id` - UUID of the user
- `order_id` - UUID of the order (for audit trail)
- `used_at` - Timestamp of usage

### Updated Table: offers
New column:
- `per_user_limit` - Maximum times one user can use this offer (NULL = unlimited)

### Existing Table: offer_products
Used for product/category restrictions:
- `offer_id` - UUID of the offer
- `product_id` - UUID of product (for product-specific offers)
- `category` - Category name (for category-specific offers)

---

## Error Messages Users Will See

**Per-User Limit Exceeded:**
```
"User limit reached"
"You have already used this offer the maximum number of times."
```

**Offer Not Applicable to Cart:**
```
"Offer not applicable"
"This offer does not apply to items in your cart."
```

---

## Important Notes

1. **Per-user limits don't prevent global limit** - Both limits work together
   - Example: offer with `usage_limit=100` and `per_user_limit=2`
   - Each user can use it max 2 times, but offer stops at 100 total uses

2. **RLS Policies** - Users can only see their own offer usage history
   - Prevents users from viewing other users' offer usage
   - System (service role) can insert/query all usage records

3. **Error Handling** - Usage tracking failures don't fail the order
   - If tracking fails, order is still created successfully
   - Check server logs for tracking errors

4. **Guest Users** - Limits don't apply to guest (unauthenticated) users
   - Per-user tracking requires logged-in users
   - Guest users only restricted by global usage_limit

---

## Testing Checklist

- [ ] Run database migration without errors
- [ ] Per-user limit validation works (user can't use offer twice if limit=1)
- [ ] Different users can independently use per-user limited offers
- [ ] Global usage limit still works
- [ ] Product-specific offers only apply to correct products
- [ ] Category-specific offers only apply to correct categories
- [ ] "All products" offers apply to any cart contents
- [ ] Offer usage is recorded after order creation
- [ ] Admin can set per-user limit when creating offer
- [ ] RLS policies prevent users from seeing others' usage

---

## Rollback Plan

If something goes wrong:

```bash
# Drop the new table (if needed)
psql -U postgres -d your_db -c "DROP TABLE IF EXISTS offer_usage CASCADE;"

# Drop the new column (if needed)
psql -U postgres -d your_db -c "ALTER TABLE offers DROP COLUMN IF EXISTS per_user_limit;"

# Or in Supabase, create a rollback migration
```

---

## Support & Debugging

If per-user validation isn't working:
1. Check `per_user_limit` is set on the offer (not NULL)
2. Verify `offer_usage` table has correct records
3. Check AuthContext is providing correct user.id
4. Look at browser console for error messages

If product/category validation isn't working:
1. Verify `offer_products` table has correct entries
2. Check `applies_to` field is 'products' or 'category' (not 'all')
3. Verify product categories match offer restrictions
4. Ensure products are being fetched correctly in CartContext

---

**Questions?** Check the detailed documentation in [FEATURE_2_ENHANCEMENTS.md](FEATURE_2_ENHANCEMENTS.md)
