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

### Overview
Allow customers to apply coupon codes at checkout to receive discount offers. Backend validation ensures codes are valid, not expired, and within usage limits.

### Requirements
- **User Story:** As a customer, I want to enter a coupon code at checkout to receive a discount on my order
- **Validation:** Backend must verify:
  - Code exists and is active
  - Code has not expired
  - Minimum purchase amount is met
  - Maximum usage limit not exceeded
  - Code hasn't been used by this user (if single-use)
  - Code applies to items in cart
- **Display:** Show discount amount before checkout
- **Behavior:** User can add/remove coupon codes

### Database Schema Changes
- **NEW TABLE: `coupon_codes`**
  - `id` (UUID, primary key)
  - `code` (VARCHAR, unique)
  - `discount_type` ('percentage' | 'fixed_amount')
  - `discount_value` (DECIMAL - percentage or amount)
  - `description` (TEXT)
  - `min_purchase_amount` (DECIMAL, nullable)
  - `max_usage_count` (INT, nullable)
  - `current_usage_count` (INT, default 0)
  - `applicable_categories` (UUID[], nullable - if category-specific)
  - `applicable_products` (UUID[], nullable - if product-specific)
  - `valid_from` (TIMESTAMP)
  - `valid_until` (TIMESTAMP)
  - `single_use_per_user` (BOOLEAN)
  - `active` (BOOLEAN)
  - `created_at` (TIMESTAMP)
  - `created_by` (UUID)

- **NEW TABLE: `coupon_usage`**
  - `id` (UUID, primary key)
  - `coupon_id` (UUID, foreign key)
  - `user_id` (UUID, foreign key)
  - `order_id` (UUID, foreign key)
  - `discount_amount` (DECIMAL)
  - `used_at` (TIMESTAMP)

- **MODIFY TABLE: `orders`**
  - Add `coupon_code` (VARCHAR, nullable)
  - Add `coupon_discount_amount` (DECIMAL, default 0)
  - Add `coupon_id` (UUID, nullable, foreign key)

### API Endpoints Required
- **POST `/api/coupons/validate`** - Validate coupon code
  - Input: couponCode, cartTotal, cartItems
  - Response: {isValid: boolean, discountAmount: number, message: string}
  - Auth: User authentication required

- **POST `/api/coupons/apply`** - Apply coupon to order (on checkout)
  - Input: orderId, couponCode
  - Response: {success: boolean, discountAmount: number}
  - Auth: User must own the order

- **GET `/api/coupons/available`** - List available coupon codes (optional, for display)
  - Response: List of active coupons with terms

### Frontend Components/Changes
- **Checkout.tsx** - Modification
  - Add coupon code input field
  - Add "Apply Coupon" button
  - Show validation feedback (errors/success)
  - Display discount amount in order summary
  - Show discount breakdown

- **NEW: CouponInput Component** - Reusable component
  - Input field for coupon code
  - Validation feedback
  - Remove coupon option
  - Loading state during validation

- **CartContext** - Modification
  - Add `appliedCoupon` state
  - Add `couponDiscount` calculation
  - Add methods to apply/remove coupon

### Implementation Steps
1. Create database migration for coupon_codes and coupon_usage tables
2. Set up RLS policies for coupon tables (coupons readable by all, usage by owner)
3. Create validation RPC function for coupon verification
4. Create apply coupon RPC function
5. Create CouponInput component with validation UI
6. Integrate with Checkout.tsx
7. Update order summary to show coupon discount
8. Implement order total recalculation logic
9. Add coupon information to order confirmation
10. Create coupon management UI for admin (future)

### Backend Logic
- Validate code format and existence
- Check expiration date and active status
- Verify usage limits (total and per-user)
- Calculate discount amount based on type
- Apply category/product restrictions if any
- Record coupon usage on successful order
- Handle concurrent requests to prevent overselling

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
