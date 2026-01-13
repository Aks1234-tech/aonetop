# Backend Technical Documentation

## Overview

This document provides comprehensive technical documentation for the **aonetop** e-commerce application backend. The application is built using React + Vite with Supabase as the Backend-as-a-Service (BaaS) provider, handling authentication, database operations, and real-time synchronization.

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph Frontend["React Frontend"]
        App[App Component]
        Pages[Pages]
        Components[UI Components]
    end
    
    subgraph State["State Management"]
        AuthCtx[AuthContext]
        CartCtx[CartContext]
        RQ[React Query Cache]
    end
    
    subgraph Hooks["Data Hooks"]
        useProducts
        useOrders
        useOffers
        useForms
    end
    
    subgraph Supabase["Supabase Backend"]
        Auth[Authentication]
        DB[(PostgreSQL Database)]
        RLS[Row Level Security]
    end
    
    App --> State
    Pages --> Hooks
    Components --> Hooks
    State --> Supabase
    Hooks --> RQ
    RQ --> Supabase
    Auth --> DB
    RLS --> DB
```

---

## Module Documentation

### 1. Supabase Client Configuration

**File:** `src/lib/supabase.ts`

The Supabase client is the central connection point to the backend. It handles:

| Feature | Description |
|---------|-------------|
| Client Initialization | Creates typed Supabase client with auto-refresh tokens |
| Session Persistence | Maintains user sessions across browser restarts |
| URL Detection | Detects auth callbacks from OAuth providers |
| Type Helpers | Exports `Tables`, `InsertTables`, `UpdateTables` for typed queries |

```typescript
// Key exports
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type Tables<T> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T> = Database['public']['Tables'][T]['Update'];
```

---

### 2. Authentication Module

**File:** `src/contexts/AuthContext.tsx`

Manages user authentication state and profile data.

#### Functionality

| Function | Description |
|----------|-------------|
| `signUp` | Register new user with email, password, and full name |
| `signIn` | Authenticate user with email/password |
| `signOut` | Log out user with timeout protection and local storage cleanup |
| `updateProfile` | Update user profile information |
| `fetchProfile` | Retrieve user profile from `profiles` table |

#### Auth State Flow

```mermaid
stateDiagram-v2
    [*] --> Loading: App Init
    Loading --> CheckSession: getSession()
    
    CheckSession --> Authenticated: Session Found
    CheckSession --> Guest: No Session
    
    Guest --> Authenticating: signIn/signUp
    Authenticating --> Authenticated: Success
    Authenticating --> Guest: Error
    
    Authenticated --> FetchProfile: Load Profile
    FetchProfile --> Ready: Profile Loaded
    Ready --> Guest: signOut
    
    state Authenticated {
        [*] --> HasProfile
        HasProfile --> Admin: role = admin
        HasProfile --> Customer: role = customer
    }
```

#### Key Features
- **Auto-creates profile** on signup via database trigger
- **Admin detection** via `profile.role === 'admin'`
- **Timeout protection** to prevent hanging signOut calls

---

### 3. Cart Module

**File:** `src/contexts/CartContext.tsx`

Manages shopping cart with hybrid local/remote storage.

#### State Structure

```typescript
interface CartState {
  items: CartItem[];        // Cart items with product details
  isOpen: boolean;          // Cart drawer visibility
  appliedOffer: Offer;      // Applied discount coupon
}
```

#### Cart Operations

| Operation | Guest Mode | Authenticated Mode |
|-----------|------------|-------------------|
| Add Item | localStorage | Supabase + localStorage sync |
| Remove Item | localStorage | Supabase delete |
| Update Quantity | localStorage | Supabase update |
| Clear Cart | localStorage | Supabase delete all |
| Apply Offer | Local state | Local state + validation |

#### Cart Synchronization Workflow

```mermaid
sequenceDiagram
    participant User
    participant CartContext
    participant LocalStorage
    participant Supabase
    
    User->>CartContext: Login
    CartContext->>LocalStorage: Get local cart
    CartContext->>Supabase: Get remote cart
    
    alt Has Local Items
        CartContext->>Supabase: Merge/Upsert items
        LocalStorage->>LocalStorage: Clear after merge
    end
    
    CartContext->>Supabase: Fetch merged cart
    Supabase-->>CartContext: Return cart items
    CartContext->>User: Display synced cart
    
    User->>CartContext: Add item
    CartContext->>CartContext: Optimistic update
    CartContext->>Supabase: Upsert item
    Supabase-->>CartContext: Confirm
```

---

### 4. Products Module

**File:** `src/hooks/useProducts.ts`

Handles product catalog operations using React Query.

#### Exported Hooks

| Hook | Purpose | Query Key |
|------|---------|-----------|
| `useProducts` | Fetch all products with filters/sorting | `['products', filters, sortBy, limit]` |
| `useProduct` | Fetch single product by slug or ID | `['product', identifier]` |
| `useFeaturedProducts` | Fetch featured products | Uses `useProducts` |
| `useBestsellers` | Fetch bestseller products | Uses `useProducts` |
| `useNewProducts` | Fetch new arrivals | Uses `useProducts` |
| `useCategories` | Fetch all categories | `['categories']` |

#### Filter Options

```typescript
interface ProductFilters {
  category?: string;      // Filter by category
  search?: string;        // Search in name/description
  inStock?: boolean;      // Stock availability
  isFeatured?: boolean;   // Featured products only
  isBestseller?: boolean; // Bestsellers only
  isNew?: boolean;        // New arrivals only
}
```

#### Product Query Flow

```mermaid
flowchart LR
    A[Component] --> B[useProducts Hook]
    B --> C{Cache Valid?}
    C -->|Yes| D[Return Cached Data]
    C -->|No| E[Supabase Query]
    E --> F[Apply Filters]
    F --> G[Apply Sorting]
    G --> H[Apply Limit]
    H --> I[Execute Query]
    I --> J[Update Cache]
    J --> D
```

---

### 5. Orders Module

**File:** `src/hooks/useOrders.ts`

Handles order creation and management.

#### Exported Hooks

| Hook | Type | Purpose |
|------|------|---------|
| `useOrders` | Query | Fetch current user's orders |
| `useOrder` | Query | Fetch single order by ID |
| `useOrderByNumber` | Query | Fetch order by order number |
| `useCreateOrder` | Mutation | Create new order |
| `useAdminOrders` | Query | Fetch all orders (admin) |
| `useUpdateOrderStatus` | Mutation | Update order status (admin) |

#### Order Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant Checkout
    participant useCreateOrder
    participant Supabase
    
    User->>Checkout: Submit Order
    Checkout->>useCreateOrder: Create Order Input
    
    useCreateOrder->>useCreateOrder: Calculate Totals
    Note over useCreateOrder: subtotal, shipping, discount, total
    
    useCreateOrder->>Supabase: INSERT orders
    Supabase-->>useCreateOrder: Order created (with order_number)
    
    useCreateOrder->>Supabase: INSERT order_items
    Supabase-->>useCreateOrder: Items created
    
    useCreateOrder->>useCreateOrder: Invalidate queries
    useCreateOrder-->>Checkout: Return order
    
    Checkout->>User: Show confirmation
```

#### Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: Order Created
    pending --> confirmed: Admin Confirms
    confirmed --> shipped: Order Shipped
    shipped --> delivered: Delivery Complete
    pending --> cancelled: User/Admin Cancels
    confirmed --> cancelled: Admin Cancels
```

---

### 6. Offers Module

**File:** `src/hooks/useOffers.ts`

Manages promotional offers and discount codes.

#### Exported Hooks

| Hook | Purpose |
|------|---------|
| `useOffers` | Fetch active, valid offers |
| `useAdminOffers` | Fetch all offers (including inactive) |
| `useOfferByCode` | Validate specific offer code |
| `useCreateOffer` | Create new offer |
| `useUpdateOffer` | Update existing offer |
| `useDeleteOffer` | Delete offer |

#### Offer Validation Flow

```mermaid
flowchart TD
    A[Apply Offer Code] --> B{Code Exists?}
    B -->|No| C[Invalid Code Error]
    B -->|Yes| D{Is Active?}
    D -->|No| C
    D -->|Yes| E{Date Valid?}
    E -->|No| F[Expired/Not Started]
    E -->|Yes| G{Usage Limit OK?}
    G -->|No| H[Limit Reached]
    G -->|Yes| I{Min Order Met?}
    I -->|No| J[Min Order Error]
    I -->|Yes| K[Apply Discount]
    
    K --> L{Offer Type?}
    L -->|percentage| M[Calculate % Discount]
    L -->|fixed| N[Apply Fixed Amount]
    L -->|free_shipping| O[Zero Shipping Cost]
    
    M --> P{Has Max Discount?}
    P -->|Yes| Q[Cap Discount]
    P -->|No| R[Apply Full %]
```

---

### 7. Forms Module

**File:** `src/hooks/useForms.ts`

Handles form submissions for contact and bulk inquiries.

#### Exported Hooks

| Hook | Table | Fields |
|------|-------|--------|
| `useSubmitContactForm` | `contact_messages` | name, email, phone, subject, message |
| `useSubmitBulkInquiry` | `bulk_inquiries` | company_name, contact_name, email, phone, business_type, volume, products, message |

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    auth_users ||--o| profiles : "extends"
    auth_users ||--o| carts : "owns"
    auth_users ||--o{ orders : "places"
    
    profiles {
        uuid id PK
        text full_name
        text phone
        text avatar_url
        text role
        timestamp created_at
    }
    
    carts ||--|{ cart_items : contains
    cart_items }|--|| products : references
    
    carts {
        uuid id PK
        uuid user_id FK
        timestamp created_at
    }
    
    cart_items {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        int quantity
    }
    
    categories ||--o{ products : categorizes
    products ||--|{ product_images : has
    
    products {
        uuid id PK
        text name
        text slug UK
        text description
        int price
        int original_price
        text category
        boolean in_stock
        boolean is_featured
        boolean is_bestseller
        boolean is_new
        numeric rating
        int reviews_count
    }
    
    product_images {
        uuid id PK
        uuid product_id FK
        text url
        boolean is_primary
        int sort_order
    }
    
    orders ||--|{ order_items : contains
    orders }o--o| offers : uses
    
    orders {
        uuid id PK
        uuid user_id FK
        text order_number UK
        text status
        int subtotal
        int shipping_cost
        int total
        text payment_method
        text shipping_info
        uuid offer_id FK
        int discount_amount
    }
    
    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        text product_name
        int quantity
        int price
    }
    
    offers ||--o{ offer_products : applies_to
    
    offers {
        uuid id PK
        text name
        text code UK
        text type
        int value
        int min_order_value
        int max_discount
        boolean is_active
        timestamp starts_at
        timestamp ends_at
        int usage_limit
        int used_count
    }
    
    contact_messages {
        uuid id PK
        text name
        text email
        text message
        boolean is_read
    }
    
    bulk_inquiries {
        uuid id PK
        text company_name
        text contact_name
        text email
        text status
    }
```

### Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profile info | role (customer/admin) |
| `products` | Product catalog | price in paise, flags for featured/bestseller/new |
| `product_images` | Product gallery | is_primary flag |
| `categories` | Product categories | sort_order for display |
| `carts` | User shopping carts | One per user (unique) |
| `cart_items` | Cart contents | Unique per cart+product |
| `orders` | Order records | Auto-generated order_number |
| `order_items` | Order line items | Denormalized product info |
| `offers` | Discount codes | Type: percentage/fixed/free_shipping |
| `offer_products` | Offer-product mapping | For targeted offers |
| `contact_messages` | Contact form submissions | is_read for admin tracking |
| `bulk_inquiries` | B2B inquiries | Status workflow |

---

## Complete Data Flow Architecture

```mermaid
flowchart TB
    subgraph Browser["Browser Layer"]
        UI[React Components]
        RQ[React Query Cache]
        LS[LocalStorage]
    end
    
    subgraph ContextLayer["Context Layer"]
        AC[AuthContext]
        CC[CartContext]
    end
    
    subgraph HooksLayer["Hooks Layer"]
        UP[useProducts]
        UO[useOrders]
        UF[useOffers]
        UForm[useForms]
    end
    
    subgraph SupabaseLayer["Supabase Layer"]
        Client[Supabase Client]
        Auth[Auth Service]
        DB[(PostgreSQL)]
        RLS[Row Level Security]
    end
    
    UI --> ContextLayer
    UI --> HooksLayer
    HooksLayer --> RQ
    RQ --> Client
    
    ContextLayer --> Client
    AC --> Auth
    CC --> LS
    CC --> Client
    
    Auth --> DB
    Client --> DB
    RLS --> DB
    
    DB --> |products| UP
    DB --> |orders| UO
    DB --> |offers| UF
    DB --> |forms| UForm
```

---

## User Journey Flows

### Complete Purchase Flow

```mermaid
sequenceDiagram
    actor User
    participant Home
    participant ProductPage
    participant Cart
    participant Checkout
    participant Backend as Supabase
    participant Admin
    
    User->>Home: Browse products
    Home->>Backend: useProducts()
    Backend-->>Home: Product list
    
    User->>ProductPage: View product
    ProductPage->>Backend: useProduct(slug)
    Backend-->>ProductPage: Product details
    
    User->>Cart: Add to cart
    Cart->>Backend: Upsert cart_item
    
    User->>Cart: Apply offer code
    Cart->>Backend: Validate offer
    Backend-->>Cart: Discount applied
    
    User->>Checkout: Proceed to checkout
    Checkout->>Backend: useCreateOrder()
    Backend->>Backend: Generate order_number
    Backend-->>Checkout: Order confirmed
    
    Admin->>Backend: View orders
    Backend-->>Admin: Order list
    Admin->>Backend: Update status
    Backend-->>User: Order shipped notification
```

---

## API Integration Summary

### Supabase Tables Used

| Module | Tables Accessed | Operations |
|--------|-----------------|------------|
| Auth | `profiles`, `auth.users` | SELECT, UPDATE |
| Cart | `carts`, `cart_items`, `products`, `product_images` | SELECT, INSERT, UPDATE, DELETE |
| Products | `products`, `product_images`, `categories` | SELECT |
| Orders | `orders`, `order_items` | SELECT, INSERT, UPDATE |
| Offers | `offers` | SELECT, INSERT, UPDATE, DELETE |
| Forms | `contact_messages`, `bulk_inquiries` | INSERT |

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Database Triggers & Functions

| Trigger/Function | Table | Purpose |
|------------------|-------|---------|
| `handle_new_user` | `auth.users` | Auto-creates profile on signup |
| `generate_order_number` | `orders` | Auto-generates order number (ORD-YYYY-XXXX) |
| `update_updated_at` | `orders` | Updates `updated_at` timestamp on order changes |

---

## Security Model

All data access is controlled via Supabase Row Level Security (RLS) policies:

- **Profiles**: Users can only read/update their own profile
- **Carts**: Users can only access their own cart
- **Orders**: Users see only their orders; admins see all
- **Products/Categories**: Public read access
- **Offers**: Public read for active offers; admin full access
- **Contact/Inquiries**: Insert-only for public; admin read access

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| State Management | React Context, React Query (TanStack) |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Styling | Tailwind CSS, shadcn/ui |
| Routing | React Router |
