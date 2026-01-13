# Aonetop API Flow Diagrams

## 1. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant Supabase Auth
    participant Supabase DB
    participant Auth Context

    User->>Browser: Access Application
    Browser->>Frontend: Load App
    Frontend->>Supabase Auth: Check Session (getSession)
    Supabase Auth-->>Frontend: Session Data
    Frontend->>Supabase DB: Fetch User Profile
    Supabase DB-->>Frontend: Profile Data
    Frontend->>Auth Context: Set User & Profile
    Auth Context-->>Browser: Render Authenticated UI

    User->>Browser: Click Sign Up
    Browser->>Frontend: Submit Email & Password
    Frontend->>Supabase Auth: signUp(email, password)
    Supabase Auth->>Supabase DB: Create Auth Record
    Supabase Auth-->>Frontend: Auth Success
    Frontend->>Supabase DB: Create Profile Record
    Supabase DB-->>Frontend: Profile Created
    Frontend->>Auth Context: Update Auth State
    Auth Context-->>Browser: Redirect to Home

    User->>Browser: Click Sign In
    Browser->>Frontend: Submit Email & Password
    Frontend->>Supabase Auth: signIn(email, password)
    Supabase Auth-->>Frontend: Session & User Data
    Frontend->>Supabase DB: Fetch User Profile
    Supabase DB-->>Frontend: Profile Data
    Frontend->>Auth Context: Set Authenticated State
    Auth Context-->>Browser: Redirect to Home
```

## 2. Product Discovery & Browsing Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant useProducts Hook
    participant React Query
    participant Supabase DB

    User->>Browser: Visit Shop Page
    Browser->>Frontend: Render Shop Component
    Frontend->>useProducts Hook: useProducts({filters, sortBy})
    useProducts Hook->>React Query: Create Query
    React Query->>Supabase DB: SELECT * FROM products
    Supabase DB->>React Query: Fetch with Relations
    React Query-->>useProducts Hook: Cached Data
    useProducts Hook-->>Frontend: Product List
    Frontend-->>Browser: Display Products

    User->>Browser: Apply Filters/Search
    Browser->>Frontend: Update Filter State
    Frontend->>useProducts Hook: useProducts({filters: updated})
    useProducts Hook->>React Query: New Query (different key)
    React Query->>Supabase DB: SELECT * FROM products WHERE filters
    Supabase DB-->>React Query: Filtered Results
    React Query-->>Frontend: Updated Product List
    Frontend-->>Browser: Display Filtered Products

    User->>Browser: View Product Details
    Browser->>Frontend: Render ProductDetails Component
    Frontend->>useProducts Hook: Query specific product
    Supabase DB->>Frontend: Product with Images & Variants
    Frontend-->>Browser: Display Full Product Info
```

## 3. Shopping Cart & Checkout Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant CartContext
    participant localStorage

    User->>Browser: Add Product to Cart
    Browser->>Frontend: Handle Add to Cart
    Frontend->>CartContext: addToCart(product, quantity)
    CartContext->>CartContext: Update Cart Items
    CartContext->>localStorage: Save Cart State
    CartContext-->>Frontend: Cart Updated
    Frontend-->>Browser: Show Toast Notification

    User->>Browser: View Cart
    Browser->>Frontend: Render Cart Component
    Frontend->>CartContext: getCartItems()
    CartContext-->>Frontend: Cart Items & Total
    Frontend->>Frontend: Calculate Totals
    Frontend-->>Browser: Display Cart Items

    User->>Browser: Apply Coupon/Offer
    Browser->>Frontend: Submit Offer Code
    Frontend->>CartContext: applyOffer(offerCode)
    CartContext->>CartContext: Validate & Apply Discount
    CartContext-->>Frontend: Updated Total with Discount
    Frontend-->>Browser: Display Discounted Price

    User->>Browser: Proceed to Checkout
    Browser->>Frontend: Render Checkout Page
    Frontend->>CartContext: Get Cart Items & Total
    Frontend->>Frontend: Validate Cart (not empty)
    Frontend-->>Browser: Display Checkout Form
```

## 4. Order Creation & Payment Flow (COD)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant useCreateOrder Hook
    participant Supabase Functions
    participant Supabase DB
    participant Auth Context

    User->>Browser: Submit Order (COD)
    Browser->>Frontend: handleSubmitOrder()
    Frontend->>Auth Context: Get Current User
    Auth Context-->>Frontend: User ID
    Frontend->>useCreateOrder Hook: createOrder.mutate(orderData)
    useCreateOrder Hook->>Supabase Functions: Call create-order function
    Supabase Functions->>Supabase Functions: Validate Order Data
    Supabase Functions->>Supabase DB: BEGIN Transaction
    Supabase DB->>Supabase DB: INSERT INTO orders
    Supabase DB->>Supabase DB: INSERT INTO order_items (for each item)
    Supabase DB->>Supabase DB: UPDATE products (decrement stock)
    Supabase DB->>Supabase DB: COMMIT Transaction
    Supabase Functions-->>Frontend: Order Success (order_number)
    Frontend->>CartContext: clearCart()
    CartContext->>localStorage: Clear Cart
    CartContext-->>Frontend: Cart Cleared
    Frontend-->>Browser: Show Order Confirmation
    Frontend->>Browser: Redirect to Order History
```

## 5. Razorpay Payment Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant useCreateRazorpayOrder Hook
    participant Supabase Functions
    participant Razorpay API
    participant Razorpay Payment Gateway

    User->>Browser: Submit Order (Online Payment)
    Browser->>Frontend: handleSubmitOrder(paymentMethod='online')
    Frontend->>useCreateRazorpayOrder Hook: mutate(orderData)
    useCreateRazorpayOrder Hook->>Supabase Functions: create-razorpay-order
    Supabase Functions->>Supabase Functions: Validate Cart
    Supabase Functions->>Supabase DB: Create ORDER (status: pending)
    Supabase Functions->>Supabase DB: Create ORDER_ITEMS
    Supabase Functions->>Razorpay API: POST /orders
    Razorpay API-->>Supabase Functions: Order ID & Details
    Supabase Functions-->>Frontend: Razorpay Order Details
    Frontend->>Frontend: loadRazorpayScript()
    Frontend->>Razorpay Payment Gateway: new Razorpay(options)
    Razorpay Payment Gateway-->>Frontend: Razorpay Modal
    Frontend-->>Browser: Display Payment Modal

    User->>Browser: Enter Payment Details
    Browser->>Razorpay Payment Gateway: Submit Payment
    Razorpay Payment Gateway->>Razorpay API: Process Payment
    Razorpay API-->>Razorpay Payment Gateway: Payment Success
    Razorpay Payment Gateway-->>Frontend: Payment Response
    Frontend->>Frontend: Handle Success Event
    Frontend->>useVerifyPayment Hook: mutate(paymentResponse)
    useVerifyPayment Hook->>Supabase Functions: verify-payment
    Supabase Functions->>Supabase Functions: Verify Signature
    Supabase DB->>Supabase DB: UPDATE orders SET payment_status='completed'
    Supabase Functions-->>Frontend: Verification Success
    Frontend->>CartContext: clearCart()
    Frontend-->>Browser: Show Order Confirmation
```

## 6. Admin Operations Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant Frontend as React Frontend
    participant AdminProtectedRoute
    participant useProducts Hook
    participant useOrders Hook
    participant Supabase DB

    Admin->>Browser: Access Admin Panel
    Browser->>Frontend: Render /admin route
    Frontend->>AdminProtectedRoute: Check Route
    AdminProtectedRoute->>Frontend: Check isAdmin=true
    Frontend-->>Browser: Render Admin Dashboard

    Admin->>Browser: Manage Products
    Browser->>Frontend: Click Products Section
    Frontend->>useProducts Hook: Fetch All Products
    useProducts Hook->>Supabase DB: SELECT * FROM products
    Supabase DB-->>Frontend: All Products
    Frontend-->>Browser: Display Products Table

    Admin->>Browser: Create New Product
    Browser->>Frontend: Submit Product Form
    Frontend->>useProducts Hook: createProduct.mutate()
    useProducts Hook->>Supabase DB: INSERT INTO products
    Supabase DB->>Supabase DB: INSERT INTO product_images
    Supabase DB->>Supabase DB: INSERT INTO product_weight_variants
    Supabase DB-->>Frontend: Product Created
    Frontend->>React Query: Invalidate products query
    React Query->>Supabase DB: Refetch products
    Frontend-->>Browser: Update Products List

    Admin->>Browser: Manage Orders
    Browser->>Frontend: Click Orders Section
    Frontend->>useOrders Hook: fetchAllOrders()
    useOrders Hook->>Supabase DB: SELECT * FROM orders with items
    Supabase DB-->>Frontend: All Orders
    Frontend-->>Browser: Display Orders Table

    Admin->>Browser: Update Order Status
    Browser->>Frontend: Change Status Dropdown
    Frontend->>useOrders Hook: updateOrderStatus.mutate()
    useOrders Hook->>Supabase DB: UPDATE orders SET status
    Supabase DB-->>Frontend: Status Updated
    Frontend-->>Browser: Show Updated Status
```

## 7. Order History & Invoice Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant useOrders Hook
    participant Supabase DB
    participant generateInvoicePDF

    User->>Browser: Visit Order History
    Browser->>Frontend: Render OrderHistory Page
    Frontend->>useOrders Hook: useOrders() - fetch user's orders
    useOrders Hook->>Supabase Auth: Get current user
    useOrders Hook->>Supabase DB: SELECT * FROM orders WHERE user_id
    Supabase DB-->>Frontend: User's Orders with Items
    Frontend-->>Browser: Display Orders List

    User->>Browser: View Order Details
    Browser->>Frontend: Click View Order
    Frontend->>useOrders Hook: useOrder(orderId)
    useOrders Hook->>Supabase DB: SELECT * FROM orders WHERE id
    Supabase DB-->>Frontend: Order Details
    Frontend-->>Browser: Display Order Details & Items

    User->>Browser: Download Invoice
    Browser->>Frontend: Click Download Invoice Button
    Frontend->>generateInvoicePDF: generateInvoicePDF(order)
    generateInvoicePDF->>generateInvoicePDF: Create PDF Document
    generateInvoicePDF-->>Frontend: PDF Blob
    Frontend->>Browser: Trigger Download
    Browser-->>User: Download invoice.pdf
```

## 8. Bulk Orders Flow

```mermaid
sequenceDiagram
    actor Customer
    participant Browser
    participant Frontend as React Frontend
    participant useInquiries Hook
    participant Supabase DB
    participant Email Service

    Customer->>Browser: Visit Bulk Orders Page
    Browser->>Frontend: Render BulkOrders Component
    Frontend-->>Browser: Display Bulk Order Form

    Customer->>Browser: Fill Bulk Order Details
    Browser->>Frontend: Submit Form (quantity, address, notes)
    Frontend->>useInquiries Hook: createBulkOrderInquiry.mutate(data)
    useInquiries Hook->>Supabase DB: INSERT INTO bulk_order_inquiries
    Supabase DB-->>Frontend: Inquiry Created
    Frontend-->>Browser: Show Confirmation Message

    note over Supabase DB: [Backend Process - Async]
    Supabase DB->>Email Service: Send Inquiry Notification to Admin
    Email Service-->>Customer: Send Confirmation Email

    Customer->>Browser: Check Inquiry Status
    Browser->>Frontend: Render BulkOrders Page
    Frontend->>useInquiries Hook: useInquiries() - fetch user's inquiries
    useInquiries Hook->>Supabase DB: SELECT * FROM bulk_order_inquiries
    Supabase DB-->>Frontend: Inquiry History
    Frontend-->>Browser: Display Inquiry Status & Details
```

## 9. Contact & Support Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend as React Frontend
    participant useContactMessages Hook
    participant Supabase DB
    participant Email Service

    User->>Browser: Visit Contact Page
    Browser->>Frontend: Render Contact Form
    Frontend-->>Browser: Display Form Fields

    User->>Browser: Submit Contact Message
    Browser->>Frontend: handleSubmit(formData)
    Frontend->>useContactMessages Hook: createMessage.mutate(data)
    useContactMessages Hook->>Supabase DB: INSERT INTO contact_messages
    Supabase DB-->>Frontend: Message Saved
    Frontend-->>Browser: Show Success Message

    note over Supabase DB: [Backend Process - Async]
    Supabase DB->>Email Service: Send Admin Notification
    Email Service-->>User: Send Confirmation Email

    Admin->>Browser: Access Admin Panel
    Admin->>Frontend: View Contact Messages
    Frontend->>useContactMessages Hook: fetchContactMessages()
    useContactMessages Hook->>Supabase DB: SELECT * FROM contact_messages
    Supabase DB-->>Frontend: All Messages
    Frontend-->>Browser: Display Messages Table
```

## 10. Offers & Promotions Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend as React Frontend
    participant useOffers Hook
    participant Supabase DB
    actor Customer

    Admin->>Frontend: Create/Update Offer
    Frontend->>useOffers Hook: createOffer.mutate() / updateOffer.mutate()
    useOffers Hook->>Supabase DB: INSERT/UPDATE INTO offers
    Supabase DB-->>Frontend: Offer Created/Updated
    Frontend-->>Admin: Show Success Message

    Customer->>Frontend: Visit Shop / Checkout
    Frontend->>useOffers Hook: useOffers() - fetch active offers
    useOffers Hook->>Supabase DB: SELECT * FROM offers WHERE active=true
    Supabase DB-->>Frontend: Active Offers List
    Frontend-->>Customer: Display Available Offers

    Customer->>Frontend: Apply Offer Code
    Frontend->>Frontend: validateOfferCode(code)
    Frontend->>Frontend: Check Offer Validity
    Frontend->>Frontend: applyOffer(offer)
    Frontend-->>Customer: Show Discount Applied

    Admin->>Frontend: View Offer Analytics
    Frontend->>useOffers Hook: fetchOffers()
    useOffers Hook->>Supabase DB: SELECT * FROM offers
    Supabase DB-->>Frontend: Offer Data
    Frontend-->>Admin: Display Offer Performance
```

## API Endpoints Summary

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/session` - Get current session

### Product Endpoints
- `GET /products` - List all products with filters
- `GET /products/:id` - Get product details
- `GET /product_images` - Get product images
- `GET /product_weight_variants` - Get weight variants

### Order Endpoints
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order (COD)
- `PUT /orders/:id` - Update order status (Admin)
- `GET /order_items` - Get order items

### Payment Endpoints
- `POST /functions/create-razorpay-order` - Create Razorpay order
- `POST /functions/verify-payment` - Verify Razorpay payment
- `PUT /payment_records/:id` - Update payment status

### Admin Endpoints
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /product_images` - Upload product images
- `POST /product_weight_variants` - Create weight variants

### Contact & Inquiry Endpoints
- `POST /contact_messages` - Submit contact form
- `GET /contact_messages` - Get contact messages (Admin)
- `POST /bulk_order_inquiries` - Submit bulk order inquiry
- `GET /bulk_order_inquiries` - Get inquiries (Admin/User)

### Offer Endpoints
- `GET /offers` - Get active offers
- `POST /offers` - Create offer (Admin)
- `PUT /offers/:id` - Update offer (Admin)
- `DELETE /offers/:id` - Delete offer (Admin)

## Data Flow Patterns

### 1. Query Pattern (Read Operations)
- Frontend Hook → React Query → Supabase DB → Cache → Component → UI

### 2. Mutation Pattern (Write Operations)
- Frontend Hook → useM utation → Supabase DB/Function → Success/Error → Query Invalidation → Refetch

### 3. Async Operations
- User Action → Frontend State Update → API Call → Loading State → Success/Error Handler → UI Update

### 4. Authentication Pattern
- Session Check → User Profile Fetch → Auth Context Update → Route Protection → Feature Access
