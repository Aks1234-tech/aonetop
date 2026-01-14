# Complete Implementation Plan - AOneTop Updates

**Date:** January 14, 2026  
**Status:** Planning Phase

---

## Table of Contents
1. [Feature 1: Order Details View with Clickable Order Links](#feature-1-order-details-view)
2. [Feature 2: Coupon Code & Offers Discount on Checkout](#feature-2-coupon-offers)
3. [Feature 3: Invoice PDF Format Updates](#feature-3-invoice-updates)
4. [Feature 4: Address Management in User Profile](#feature-4-address-management)
5. [Feature 5: Product Out-of-Stock Status](#feature-5-out-of-stock)

---

## Feature 1: Order Details View

### Overview
Enable users to view detailed information about their orders from the Order History page by clicking on the Order ID (e.g., Order #ORD-2026-0008).

### Requirements
- **User Story:** As a customer, I want to click on an order ID to view full details including items, quantities, prices, payment status, and shipping information
- **Access Level:** User can only view their own orders
- **Visual:** Clickable order ID in order history table/list
- **Navigation:** Order ID links to detailed view page

### Database Schema Changes
- No new tables needed
- Existing `orders` table relationships:
  - `order_items` (one-to-many)
  - `payment_details` (one-to-one)
  - `order_status_history` (one-to-many)

### API Endpoints Required
- **GET `/api/orders/{orderId}`** - Fetch single order details with all relationships
  - Auth: User must own the order
  - Response: Order with items, payment details, status history

### Frontend Components Required
- **OrderHistory.tsx** - Modification
  - Make order ID clickable (convert to Link)
  - Route to order detail page
  
- **NEW: OrderDetails.tsx** - New component
  - Display full order information
  - Show order timeline/status history
  - Display shipping address
  - Show payment method used
  - Display order items with images, quantities, unit prices
  - Show order total breakdown
  - Print/Download option

- **NEW: Order Detail View Page** - New page
  - Route: `/order/:orderId`
  - Protected route (user authentication required)
  - RLS policy verification in backend

### Implementation Steps
1. Create new RPC function in Supabase to fetch order details with all relationships
2. Add route to application router for `/order/:orderId`
3. Create OrderDetails.tsx component
4. Modify OrderHistory.tsx to make order IDs clickable
5. Add authorization check to ensure user owns the order
6. Style the detail view to match application theme
7. Add back navigation to order history
8. Test with sample orders

### Backend Logic
- Query order with all related items and payment data
- Validate RLS policies prevent unauthorized access
- Return formatted order response with status timeline
- Handle non-existent orders with proper error response

---

## Feature 2: Coupon Code & Offers Discount on Checkout

### Current Implementation Status ✅ IMPLEMENTED

The offers/discount feature is **already implemented** and operational. Below is the current state and recommended enhancements.

### Overview
The system allows customers to apply offers/coupon codes at checkout to receive discounts. Backend validation ensures codes are valid, not expired, and within usage limits.

### Current Implementation Details

#### Database Schema (Already Implemented)
- **TABLE: `offers`** ✅ CREATED
  - `id` (UUID, primary key)
  - `name` (TEXT) - Internal name
  - `code` (VARCHAR, unique, nullable) - Promo code
  - `type` (TEXT) - 'percentage' | 'fixed' | 'bogo' | 'free_shipping'
  - `value` (INTEGER) - Discount value (% or amount in paise)
  - `min_order_value` (INTEGER, nullable) - Minimum cart total
  - `max_discount` (INTEGER, nullable) - Cap for percentage discounts
  - `applies_to` (TEXT) - 'all' | 'category' | 'products'
  - `is_active` (BOOLEAN)
  - `starts_at` (TIMESTAMPTZ)
  - `ends_at` (TIMESTAMPTZ)
  - `usage_limit` (INTEGER, nullable) - Total uses allowed
  - `used_count` (INTEGER, default 0) - Current usage count
  - `created_at` (TIMESTAMPTZ)

- **TABLE: `offer_products`** ✅ CREATED
  - Links offers to specific products/categories for targeted promotions

#### Frontend Components (Already Implemented)
- **Cart.tsx** ✅
  - Promo code input field
  - Apply/Remove offer functionality
  - Shows applied offer with discount amount
  - Real-time discount calculation

- **Checkout.tsx** ✅
  - Displays applied offer
  - Shows discount in order summary
  - Integrates free shipping logic for shipping offers
  - Passes offer ID and discount to order creation

- **useOffers Hook** ✅
  - `useOffers()` - Fetch active valid offers
  - `useAdminOffers()` - Fetch all offers for admin
  - `useOfferByCode(code)` - Validate specific code
  - `useCreateOffer()` - Create new offer
  - `useUpdateOffer()` - Update offer
  - `useDeleteOffer()` - Delete offer

#### CartContext Updates (Already Implemented)
- `appliedOffer` state - Currently applied offer
- `applyOffer(code)` function - Validates and applies offer
- `removeOffer()` function - Removes applied offer
- `discount` calculation - Computes discount amount based on type
- `finalTotal` - Total after discount

#### Admin Interface (Already Implemented)
- **OffersManager.tsx** ✅
  - Create/Edit/Delete offers
  - Set discount type (percentage, fixed, free shipping)
  - Configure validity dates
  - Set usage limits
  - Display offer status and usage stats

### Current Validation Flow (Already Implemented)
1. Check if code exists and is active
2. Verify dates (started and not expired)
3. Validate usage limits
4. Check minimum order value
5. Calculate appropriate discount based on type
6. Apply discount to cart total

### Recommended Enhancements & Next Steps

#### Enhancement 1: Per-User Usage Tracking
**Status:** Partially implemented (usage_limit tracked but not per-user)
- **Action:** Add `offer_usage` table to track which users used which offers
- **Benefits:** Prevent single-user unlimited usage of offers
- **Implementation:** 
  - Create migration for `offer_usage` table
  - Track user_id, offer_id, order_id, usage_date
  - Modify validation logic to check per-user limits
  - Add RLS policies

#### Enhancement 2: Category & Product-Specific Offers
**Status:** Schema support exists (applies_to, offer_products) but not fully utilized
- **Action:** Expand validation logic to check product/category matching
- **Benefits:** Target promotions to specific product categories or items
- **Implementation:**
  - Enhanced validation in `applyOffer` function
  - Check if cart items match offer categories/products
  - Display offer applicability on product pages
  - Show "Available Offer" badge on eligible products

#### Enhancement 3: Bulk Offer Display & Discovery
**Status:** Currently only shows UI for applying codes
- **Action:** Create offers listing page/component
- **Benefits:** Customers can discover available offers
- **Implementation:**
  - New component `AvailableOffers.tsx`
  - Display active offers with terms
  - One-click apply from offers list
  - Show on home page or dedicated page

#### Enhancement 4: Offer Analytics Dashboard
**Status:** Admin can see usage count only
- **Action:** Create comprehensive analytics dashboard
- **Benefits:** Understand offer performance
- **Implementation:**
  - Chart showing offer usage over time
  - Revenue impact analysis
  - Most popular offers
  - Conversion rates with/without offers

#### Enhancement 5: Automatic Offers
**Status:** Supports code-less offers but not auto-applied in checkout
- **Action:** Auto-apply best applicable offers at checkout
- **Benefits:** Better UX, customers don't need to know codes
- **Implementation:**
  - Algorithm to select best offer
  - Auto-apply on cart page or checkout
  - Show notification of automatic discount
  - Option to see other available offers

#### Enhancement 6: BOGO (Buy One Get One) Implementation
**Status:** Schema support exists but validation not implemented
- **Action:** Complete BOGO offer logic
- **Benefits:** Common retail promotion pattern
- **Implementation:**
  - Validation for BOGO conditions
  - Logic to apply free item when criteria met
  - Visual indication of free item in cart
  - Restrictions (can't be combined with other offers)

### Integration with Feature 3 (Invoice Updates)
The offers system needs to pass discount information to invoice:
- Offer code applied
- Discount amount
- Discount type (for display)
- Will be used in updated invoice PDF generation

### Orders Table Status
- **coupon_code** column likely exists or can be added
- **coupon_discount_amount** column likely exists or can be added
- **coupon_id** reference may need to be added
- Verify with current schema

### Testing Recommendations
- ✅ Code validation (exists, active, not expired)
- ✅ Usage limits (total count)
- ✅ Minimum order value checks
- ✅ Discount type calculations (percentage, fixed)
- ❌ Per-user usage tracking (needs enhancement)
- ❌ Category/Product-specific validation (partially)
- ❌ BOGO validation (not implemented)
- ❌ Auto-application logic (not implemented)

### Files to Review/Modify for Enhancements
- [src/hooks/useOffers.ts](src/hooks/useOffers.ts) - Validation logic
- [src/contexts/CartContext.tsx](src/contexts/CartContext.tsx) - applyOffer method
- [src/pages/Cart.tsx](src/pages/Cart.tsx) - UI display
- [src/pages/Checkout.tsx](src/pages/Checkout.tsx) - Integration
- [src/components/admin/OffersManager.tsx](src/components/admin/OffersManager.tsx) - Admin UI
- `supabase/migrations/` - Database changes for enhancements

### Priority for Enhancements
1. **HIGH:** Per-user usage tracking (prevent abuse)
2. **HIGH:** Category/Product-specific validation (real-world use)
3. **MEDIUM:** Bulk offer discovery (better UX)
4. **MEDIUM:** BOGO implementation (common retail need)
5. **LOW:** Auto-application (nice-to-have)
6. **LOW:** Analytics dashboard (business intelligence)

---

## Feature 3: Invoice PDF Format Updates

### Overview
Update the invoice PDF format to include payment details, coupon discounts, and tax summary with improved design.

### Current State Analysis
- Current file: `lib/generateInvoicePDF.ts`
- Current format includes: Order header, items, totals
- Needs: Payment section, coupon discount, tax breakdown, design improvements

### New Invoice Sections Required
- **Header Section** (improved)
  - Company logo and name
  - Invoice number and date
  - Order ID with clickable reference

- **Customer Information**
  - Billing address
  - Shipping address (if different)
  - Contact details

- **Order Items Section** (unchanged but enhanced)
  - Product name
  - SKU/Product ID
  - Quantity
  - Unit price
  - Total price
  - Add: Weight/variant information if applicable

- **NEW: Tax Summary Section**
  - Subtotal
  - Tax amount (percentage basis)
  - Tax breakdown by category (if applicable)

- **NEW: Discount Summary Section**
  - Coupon code applied
  - Discount type (percentage/fixed)
  - Discount amount
  - Note: "Offer applied"

- **NEW: Payment Information Section**
  - Payment method (Credit Card, UPI, etc.)
  - Payment status (Paid/Pending/Failed)
  - Transaction ID / Razorpay Payment ID
  - Payment date
  - Payment amount

- **Order Summary**
  - Subtotal
  - Tax amount
  - Discount amount
  - Shipping charges (if applicable)
  - **Final Total**

- **Footer Section** (improved)
  - Terms and conditions
  - Return/Refund policy reference
  - Company contact information
  - Website URL

### Design Changes Required
- Modern, clean layout using colors matching brand
- Better typography hierarchy
- Improved spacing and margins
- Professional table formatting for items
- Color-coded sections for easier reading
- Responsive font sizes
- Better use of white space
- Add subtle background colors/patterns

### Data Requirements
- Fetch payment details from `payment_details` table
- Fetch coupon information if applied
- Calculate tax based on order items
- Include shipping address if different from billing

### PDF Library
- Continue using existing PDF library (likely pdfmake or similar)
- Enhance styling capabilities
- Implement improved table structures
- Add section dividers

### Implementation Steps
1. Review current `generateInvoicePDF.ts` structure
2. Create new PDF template structure with sections
3. Add data models for tax and coupon information
4. Update PDF generation function parameters
5. Implement tax calculation logic
6. Implement discount section rendering
7. Implement payment details section
8. Improve visual design with colors and styling
9. Add different address handling (billing vs shipping)
10. Test PDF generation with various order types
11. Verify PDF readability and printing quality
12. Update invoice generation calls to pass new data

### Data Transformations Needed
- Tax calculation (implement tax rules)
- Format payment status as human-readable
- Format currency values
- Format dates in readable format
- Handle multi-line addresses

---

## Feature 4: Address Management in User Profile

### Overview
Implement comprehensive address management allowing users to add, edit, and delete billing and shipping addresses, with ability to set default addresses for each type.

### Requirements
- **User Story:** As a customer, I want to manage multiple addresses and set different billing and shipping addresses, with defaults for quick checkout
- **Address Types:** Billing and Shipping (can be same or different)
- **Default Selection:** Each type can have a different default address
- **CRUD Operations:** Create, Read, Update, Delete addresses
- **Maximum Addresses:** Reasonable limit (e.g., 5-10 per type)
- **Validation:** Address field validation

### Database Schema Changes
- **NEW TABLE: `user_addresses`**
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key - references auth.users)
  - `address_type` ('billing' | 'shipping')
  - `full_name` (VARCHAR)
  - `phone_number` (VARCHAR)
  - `street_address` (VARCHAR)
  - `apartment_suite` (VARCHAR, nullable)
  - `city` (VARCHAR)
  - `state` (VARCHAR)
  - `postal_code` (VARCHAR)
  - `country` (VARCHAR)
  - `is_default` (BOOLEAN, default false)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- **MODIFY TABLE: `orders`** (if not already done)
  - Add `billing_address_id` (UUID, nullable, foreign key)
  - Add `shipping_address_id` (UUID, nullable, foreign key)
  - Add `shipping_address` (JSON, nullable - snapshot at order time)
  - Add `billing_address` (JSON, nullable - snapshot at order time)

### API Endpoints Required
- **GET `/api/user/addresses`** - Get all user addresses
  - Query params: `type` (billing|shipping|all)
  - Response: Array of user addresses

- **POST `/api/user/addresses`** - Create new address
  - Input: Address object with type
  - Response: Created address with ID

- **PUT `/api/user/addresses/{addressId}`** - Update address
  - Input: Address object
  - Auth: User must own the address
  - Response: Updated address

- **DELETE `/api/user/addresses/{addressId}`** - Delete address
  - Auth: User must own the address
  - Response: Confirmation

- **PATCH `/api/user/addresses/{addressId}/set-default`** - Set as default
  - Input: Address type (billing/shipping)
  - Response: Updated address

- **GET `/api/user/default-address`** - Get default addresses
  - Query params: `type` (billing|shipping|both)
  - Response: Default address(es)

### Frontend Components Required
- **NEW: AddressManager Component** - Main address management UI
  - Display list of addresses by type
  - Separate sections for billing and shipping
  - Show default address indicator
  - Action buttons: Edit, Delete, Set as Default

- **NEW: AddressForm Component** - Add/Edit form
  - Form fields for all address details
  - Address type selector (billing/shipping)
  - Save button
  - Cancel button
  - Form validation

- **NEW: AddressCard Component** - Display single address
  - Address details
  - Default indicator badge
  - Action buttons
  - Phone number display

- **Profile.tsx** - Modification
  - Add Address Management tab/section
  - Link to AddressManager component

- **Checkout.tsx** - Modification
  - Add address selection UI
  - Show default addresses pre-selected
  - Option to select different billing/shipping
  - Option to add new address from checkout

### Implementation Steps
1. Create database migration for user_addresses table
2. Set up RLS policies (users can only see/manage own addresses)
3. Create API endpoints for address CRUD operations
4. Create custom hook `useAddresses()` for address management
5. Create AddressCard component
6. Create AddressForm component with validation
7. Create AddressManager component
8. Integrate address manager into Profile page
9. Update Checkout to display and select addresses
10. Update order creation to use selected addresses
11. Add validation for required address fields
12. Implement address limit checks
13. Add error handling and user feedback
14. Test with multiple addresses
15. Test default address switching

### Validation Rules
- All fields required (except apartment/suite)
- Phone number format validation
- Postal code format (country-specific)
- Street address minimum length
- City and state validation

### Edge Cases
- User deletes default address (auto-select next as default)
- Same address used for billing and shipping (flag it)
- Update address that's in use (only affects future orders)
- Maximum address limit reached (show warning)
- Archive vs Delete decision (recommend archive)

---

## Feature 5: Product Out-of-Stock Status

### Overview
Display "Out of Stock" status on products when inventory is depleted, visible in product descriptions and listings.

### Requirements
- **User Story:** As a customer, I want to see clearly when a product is out of stock so I don't attempt to purchase it
- **Visibility Locations:**
  - Product listing page (Shop.tsx)
  - Product details page (ProductDetails.tsx)
  - Featured products on home page
  - Bestsellers section
  - Search results
- **Visual Indicator:** Clear badge/tag showing "Out of Stock"
- **Interaction:** Disable add to cart button when out of stock
- **Information:** Show potential re-stock date if available

### Database Schema Changes
- **MODIFY TABLE: `products`** (likely already has stock/inventory)
  - Verify `stock_quantity` or similar field exists
  - Consider adding `restock_date` (TIMESTAMP, nullable)
  - Consider adding `can_preorder` (BOOLEAN)
  - Add `is_discontinued` (BOOLEAN, optional)

- **Alternative: Check weight_variants table**
  - If variants have inventory tracking
  - Mark variant as out of stock if all weights sold out

### Logic Determination
- **Out of Stock Definition:**
  - `stock_quantity <= 0` OR
  - All weight variants have `stock_quantity = 0`
  - `is_discontinued = true`
  
- **Low Stock Warning (Optional):**
  - Show "Only X left" when stock < 10
  - Show "Limited availability" when stock < 5

### Frontend Components/Changes
- **NEW: OutOfStockBadge Component** - Reusable badge
  - Styling: Gray/muted colors
  - Text: "Out of Stock"
  - Optional: Show restock date

- **NEW: StockStatus Component** - More detailed status
  - Out of stock indicator
  - Low stock warning
  - Restock date display
  - Re-notify button (for pre-order)

- **Product Listing Cards** - Modification
  - Add OutOfStockBadge overlay
  - Dim image if out of stock
  - Disable card click if out of stock

- **ProductDetails.tsx** - Modification
  - Display prominent out-of-stock status
  - Disable "Add to Cart" button
  - Show restock date if available
  - Option to notify when back in stock

- **Shop.tsx** - Modification
  - Show stock status in listings
  - Filter out-of-stock products (optional)
  - Add filter toggle for stock status

- **CartContext** - Verification
  - Prevent adding out-of-stock items to cart
  - Validate stock when adding quantity
  - Check stock status during checkout

- **Bestsellers.tsx** - Modification
  - Add stock status badge
  - Handle out of stock bestsellers

- **FeaturedProducts.tsx** - Modification
  - Add stock status badge
  - Disable purchase if out of stock

### Implementation Steps
1. Review existing inventory/stock schema
2. Create utility function `isProductOutOfStock(product)` 
3. Create OutOfStockBadge component
4. Create StockStatus component
5. Add stock status display to all product listings
6. Update ProductDetails page
7. Disable add-to-cart button when out of stock
8. Add visual indicators (graying out, overlay)
9. Test with various stock levels
10. Add pre-order/back-in-stock notification UI (if needed)
11. Update checkout validation to prevent out-of-stock additions
12. Add stock check before order creation

### Styling Considerations
- Out of Stock Badge: Red/Gray background with white text
- Position: Top-right or center overlay
- Opacity: 0.8-0.9 for dimmed images
- Font: Bold, readable
- Size: Consistent across all views

### Inventory Update Triggers
- When order is placed (reduce stock)
- When order is cancelled (restore stock)
- When weight variant is deleted (if product still exists)
- Manual admin updates

### Performance Considerations
- Stock status calculated at component render
- Consider caching for listings with many products
- Real-time updates if using Supabase subscriptions

---

## Implementation Priority & Sequencing

### Phase 1 (Foundation)
1. Feature 4: Address Management - enables proper checkout workflow
2. Feature 2: Coupon System - database and API foundation
3. Feature 5: Out-of-Stock Status - simple visual update

### Phase 2 (Integration)
4. Feature 1: Order Details View - uses address management data
5. Feature 3: Invoice Updates - aggregates all previous features

### Dependency Map
```
Address Management (4)
    ├── Checkout (uses addresses)
    └── Order Details View (1) (displays addresses)

Coupon System (2)
    ├── Checkout (applies coupons)
    └── Invoice (3) (includes coupon details)

Out-of-Stock (5)
    ├── Product Pages (affected)
    └── Checkout Validation (independent)

Invoice Updates (3)
    └── Requires: Order Details (1), Coupons (2)
```

### Estimated Effort
- Feature 1: 3-4 days (components + authorization)
- Feature 2: 4-5 days (validation logic + integration)
- Feature 3: 2-3 days (PDF template updates)
- Feature 4: 5-6 days (CRUD + default management)
- Feature 5: 1-2 days (UI indicators + validation)

**Total: 15-20 days** (can be parallelized)

---

## Database Migration Strategy

### Order of Migrations
1. Create `coupon_codes` table
2. Create `coupon_usage` table
3. Create `user_addresses` table
4. Modify `orders` table to add address and coupon references
5. Add optional fields to `products` (restock_date, can_preorder)

### Rollback Plan
- Each migration should have a corresponding rollback script
- Test migrations in staging environment first
- Backup production database before applying
- Have deployment checklist for verification

---

## Testing Strategy

### Feature-Specific Tests
- **Feature 1:** RLS authorization, order data retrieval, UI navigation
- **Feature 2:** Coupon validation, discount calculations, usage tracking
- **Feature 3:** PDF generation, layout rendering, data accuracy
- **Feature 4:** CRUD operations, default switching, validation
- **Feature 5:** Stock status display, add-to-cart prevention

### Integration Tests
- Order creation with addresses and coupons
- Invoice generation with all new fields
- Checkout flow with address selection and coupon application

### User Acceptance Testing
- End-to-end order flow with all features
- Mobile responsiveness
- Performance with large data sets

---

## Future Enhancements
- Coupon analytics dashboard
- Address autocomplete/validation service
- Stock prediction and forecasting
- Bulk discount tiers
- Dynamic pricing based on geography
- Address book from previous orders
- One-click re-order functionality

---

## Implementation Status Summary

### Feature Implementation Tracker

| Feature | Status | Priority | Effort | Comments |
|---------|--------|----------|--------|----------|
| **1. Order Details View** | ⏳ Not Started | HIGH | 3-4 days | Clickable order ID linking to detail page |
| **2. Offers/Coupons** | ✅ IMPLEMENTED | HIGH | ~80% | Core features done, enhancements needed |
| **2a. Enhancement: Per-User Tracking** | ⏳ Not Started | HIGH | 1-2 days | Prevent offer abuse |
| **2b. Enhancement: Category/Product Offers** | ⏳ Partial | MEDIUM | 2-3 days | Schema exists, validation needed |
| **2c. Enhancement: Offer Discovery Page** | ⏳ Not Started | MEDIUM | 2-3 days | Show available offers to users |
| **2d. Enhancement: BOGO Logic** | ⏳ Not Started | MEDIUM | 2-3 days | Complete buy-one-get-one implementation |
| **2e. Enhancement: Auto-Apply Offers** | ⏳ Not Started | LOW | 2 days | Auto-select best offer for customer |
| **3. Invoice PDF Updates** | ⏳ Not Started | MEDIUM | 2-3 days | Add payment, tax, coupon sections |
| **4. Address Management** | ⏳ Not Started | HIGH | 5-6 days | Billing/shipping address management |
| **5. Out-of-Stock Status** | ⏳ Not Started | MEDIUM | 1-2 days | Display status badges |

### Current Codebase Reference
- **Offers Implementation:** Fully functional in production
  - Hooks: [src/hooks/useOffers.ts](src/hooks/useOffers.ts)
  - Components: [src/components/admin/OffersManager.tsx](src/components/admin/OffersManager.tsx)
  - Integration: [src/pages/Cart.tsx](src/pages/Cart.tsx), [src/pages/Checkout.tsx](src/pages/Checkout.tsx)
  - Context: [src/contexts/CartContext.tsx](src/contexts/CartContext.tsx)
  - Database: [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)

### Recommended Implementation Order

#### Phase 1 (Foundation & Fixes)
1. Feature 5: Out-of-Stock Status (1-2 days) - Quick win
2. Feature 4: Address Management (5-6 days) - Critical for checkout
3. Feature 2 Enhancements: Per-User Tracking (1-2 days) - System integrity

#### Phase 2 (Features & Integration)
4. Feature 1: Order Details View (3-4 days) - User-facing feature
5. Feature 2 Enhancements: Category/Product Offers (2-3 days) - Marketing feature
6. Feature 3: Invoice PDF Updates (2-3 days) - Integration task

#### Phase 3 (Nice-to-Have)
7. Feature 2 Enhancements: Offer Discovery (2-3 days)
8. Feature 2 Enhancements: BOGO Logic (2-3 days)
9. Feature 2 Enhancements: Auto-Apply (2 days)

**Total Estimated Time:** 24-33 days
**Critical Path:** Features 4, 1, 3 (approx 10-13 days)

---

## Notes for Development Team

### Key Decisions Made
1. **Offers Table:** Using flexible `applies_to` and `offer_products` junction table for targeting
2. **Address Storage:** Snapshot addresses in orders table for historical accuracy + reference to user_addresses
3. **Stock Status:** Determined by `in_stock` field (could be updated on order placement)
4. **Invoice Design:** Will include all new fields (tax, discount, payment) in improved PDF format

### Potential Challenges
- **Offers Validation:** Complex logic for combining multiple criteria (date, usage, min order)
- **Address Defaults:** Managing default switching when deleting default address
- **PDF Generation:** Rendering complex table structures reliably across browsers
- **Stock Updates:** Real-time sync between order creation and product inventory
- **Performance:** Large datasets in order history may need pagination

### Testing Priorities
1. End-to-end checkout with offers
2. RLS policies for address and order access
3. PDF generation with various data sizes
4. Concurrent offer applications
5. Address switching during checkout
