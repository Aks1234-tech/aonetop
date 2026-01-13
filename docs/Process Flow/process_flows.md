# Aonetop Process Flow Diagrams

## 1. User Registration & Authentication Process

```mermaid
flowchart TD
    A[User Visits App] --> B{User<br/>Authenticated?}
    B -->|No| C[User Clicks Sign Up]
    B -->|Yes| D[Load Dashboard]
    
    C --> E[Fill Registration Form]
    E --> F[Validate Form Data]
    F --> G{Valid?}
    G -->|No| H[Show Validation Errors]
    H --> E
    G -->|Yes| I[Send to Supabase Auth]
    
    I --> J[Create Auth Record]
    J --> K{Auth Success?}
    K -->|Failed| L[Show Error Message]
    L --> E
    K -->|Success| M[Create User Profile]
    
    M --> N[Store in Profiles Table]
    N --> O[Set Auth Context]
    O --> P[Save Session to localStorage]
    P --> Q[Redirect to Home]
    Q --> D
    
    style A fill:#e1f5ff
    style Q fill:#c8e6c9
    style L fill:#ffcdd2
```

## 2. User Login Process

```mermaid
flowchart TD
    A[User Visits App] --> B{User<br/>Authenticated?}
    B -->|Yes| C[Load Dashboard]
    B -->|No| D[User Clicks Sign In]
    
    D --> E[Fill Login Form]
    E --> F[Validate Credentials]
    F --> G{Valid?}
    G -->|No| H[Show Error]
    H --> E
    
    G -->|Yes| I[Send to Supabase Auth]
    I --> J[Compare Email & Password]
    J --> K{Auth Success?}
    K -->|Failed| H
    K -->|Success| L[Fetch User Profile]
    
    L --> M[Get Role: Admin/Customer]
    M --> N[Set Auth Context]
    N --> O[Save Session]
    O --> P[Check Role]
    
    P -->|Admin| Q[Redirect to Admin Panel]
    P -->|Customer| R[Redirect to Home]
    
    Q --> C
    R --> C
    
    style C fill:#c8e6c9
    style H fill:#ffcdd2
```

## 3. Product Browsing & Filtering Process

```mermaid
flowchart TD
    A[User Visits Shop] --> B[Load Products]
    B --> C[Fetch from Supabase]
    C --> D[Cache in React Query]
    
    D --> E[Display All Products]
    E --> F{User Action?}
    
    F -->|Search| G[Enter Search Query]
    G --> H[Filter by Name/Description]
    H --> I[Display Filtered Results]
    
    F -->|Category| J[Select Category]
    J --> K[Filter by Category]
    K --> I
    
    F -->|Sort| L[Select Sort Option]
    L --> M{Sort By?}
    M -->|Price| N[Sort Ascending/Descending]
    M -->|Rating| O[Sort by Rating]
    M -->|Featured| P[Show Featured First]
    N --> I
    O --> I
    P --> I
    
    F -->|View Details| Q[Click Product]
    Q --> R[Navigate to Details Page]
    R --> S[Fetch Full Product Info]
    S --> T[Display Images & Variants]
    
    I --> U{Continue Shopping?}
    U -->|Yes| F
    U -->|No| V[Exit]
    
    style A fill:#e1f5ff
    style I fill:#fff9c4
    style T fill:#fff9c4
```

## 4. Shopping Cart Management Process

```mermaid
flowchart TD
    A[User Browsing Products] --> B{Cart Action?}
    
    B -->|Add to Cart| C[Click Add Button]
    C --> D[Select Quantity]
    D --> E{Quantity Valid?}
    E -->|No| F[Show Error]
    F --> D
    E -->|Yes| G[Update Cart Context]
    
    G --> H[Add Item to Cart Array]
    H --> I[Save to localStorage]
    I --> J[Show Success Toast]
    J --> K[Update Cart Count]
    K --> L[Continue Shopping]
    
    B -->|View Cart| M[Click Cart Icon]
    M --> N[Open Cart Drawer]
    N --> O[Display Cart Items]
    O --> P{Cart Actions?}
    
    P -->|Change Quantity| Q[Update Item Quantity]
    Q --> R[Update Total Price]
    R --> S[Save to localStorage]
    
    P -->|Remove Item| T[Click Remove]
    T --> U[Remove from Cart]
    U --> S
    
    P -->|Apply Offer| V[Enter Offer Code]
    V --> W[Validate Offer]
    W --> X{Valid?}
    X -->|No| Y[Show Error]
    Y --> V
    X -->|Yes| Z[Calculate Discount]
    Z --> AA[Update Total]
    AA --> S
    
    P -->|Proceed| AB[Go to Checkout]
    
    L --> B
    S --> O
    
    style M fill:#e1f5ff
    style AB fill:#c8e6c9
    style F fill:#ffcdd2
```

## 5. Checkout & Order Creation Process (COD)

```mermaid
flowchart TD
    A[User in Checkout Page] --> B[Verify Cart Not Empty]
    B --> C{Cart Valid?}
    C -->|Empty| D[Show Empty Cart Message]
    D --> E[Redirect to Cart]
    
    C -->|Valid| F[Display Checkout Form]
    F --> G[Fill Shipping Details]
    G --> H[Enter Name, Address, Phone]
    H --> I[Select Payment Method]
    
    I --> J{Payment<br/>Method?}
    J -->|COD| K[Select COD]
    J -->|Online| L[Select Online Payment]
    
    K --> M[Validate Form Data]
    M --> N{Valid?}
    N -->|No| O[Show Validation Errors]
    O --> G
    
    N -->|Yes| P[Submit Order]
    P --> Q[Call createOrder Mutation]
    Q --> R[Create Order in Database]
    R --> S[Generate Order Number]
    S --> T[Create Order Items]
    T --> U[Decrement Product Stock]
    
    U --> V{Order Created?}
    V -->|Failed| W[Show Error Message]
    W --> G
    V -->|Success| X[Clear Cart]
    
    X --> Y[Show Order Confirmation]
    Y --> Z[Display Order Number & Details]
    Z --> AA[Save Order Number to State]
    AA --> AB[Redirect to Order History]
    
    style A fill:#e1f5ff
    style AB fill:#c8e6c9
    style W fill:#ffcdd2
```

## 6. Online Payment Process (Razorpay)

```mermaid
flowchart TD
    A[User Selects Online Payment] --> B[Submit Checkout Form]
    B --> C[Validate Form Data]
    C --> D{Valid?}
    D -->|No| E[Show Errors]
    E --> F[Go Back to Form]
    
    D -->|Yes| G[Call createRazorpayOrder]
    G --> H[Create Order Record<br/>Status: Pending]
    H --> I[Create Order Items]
    I --> J[Call Razorpay API]
    J --> K[Create Razorpay Order]
    
    K --> L[Get Order ID from Razorpay]
    L --> M[Load Razorpay Script]
    M --> N[Open Payment Modal]
    
    N --> O[User Enters Payment Details]
    O --> P{Payment<br/>Processed?}
    
    P -->|Failed| Q[Show Payment Error]
    Q --> R{Retry?}
    R -->|Yes| O
    R -->|No| S[Close Modal]
    S --> F
    
    P -->|Success| T[Razorpay Returns Response]
    T --> U[Get Payment ID & Signature]
    U --> V[Call verifyPayment]
    V --> W[Verify Signature on Backend]
    W --> X{Signature<br/>Valid?}
    
    X -->|Invalid| Y[Log Security Alert]
    Y --> Z[Show Payment Failed]
    Z --> F
    
    X -->|Valid| AA[Update Order Status: Completed]
    AA --> AB[Save Payment Details]
    AB --> AC[Clear Cart]
    AC --> AD[Show Order Confirmation]
    AD --> AE[Redirect to Order History]
    
    style N fill:#fff9c4
    style AA fill:#c8e6c9
    style Q fill:#ffcdd2
```

## 7. Admin Order Management Process

```mermaid
flowchart TD
    A[Admin Logs In] --> B[Access Admin Panel]
    B --> C[Navigate to Orders Section]
    C --> D[Fetch All Orders]
    D --> E[Display Orders Table]
    
    E --> F{Admin Action?}
    
    F -->|View Details| G[Click Order Number]
    G --> H[Fetch Order Details]
    H --> I[Display Order Items]
    I --> J[Show Shipping Info]
    J --> K[Show Payment Status]
    
    F -->|Update Status| L[Click Status Dropdown]
    L --> M{New Status?}
    M -->|Pending| N[Change to Pending]
    M -->|Processing| O[Change to Processing]
    M -->|Shipped| P[Change to Shipped]
    M -->|Delivered| Q[Change to Delivered]
    M -->|Cancelled| R[Change to Cancelled]
    
    N --> S[Update in Database]
    O --> S
    P --> S
    Q --> S
    R --> S
    
    S --> T[Invalidate Queries]
    T --> U[Refetch Orders]
    U --> E
    
    F -->|Filter Orders| V[Select Filter]
    V --> W{Filter By?}
    W -->|Status| X[Show by Status]
    W -->|Date| Y[Show by Date Range]
    W -->|Customer| Z[Search by Customer]
    
    X --> E
    Y --> E
    Z --> E
    
    F -->|Generate Invoice| AA[Select Order]
    AA --> AB[Click Download Invoice]
    AB --> AC[Generate PDF]
    AC --> AD[Download File]
    
    style A fill:#e1f5ff
    style E fill:#fff9c4
```

## 8. Product Management Process (Admin)

```mermaid
flowchart TD
    A[Admin Logs In] --> B[Access Admin Panel]
    B --> C[Navigate to Products Section]
    C --> D[Fetch All Products]
    D --> E[Display Products Table]
    
    E --> F{Admin Action?}
    
    F -->|Create Product| G[Click Create New]
    G --> H[Fill Product Form]
    H --> I[Enter: Name, Desc, Price]
    I --> J[Select Category]
    J --> K[Upload Images]
    K --> L[Add Weight Variants]
    L --> M[Validate Form]
    M --> N{Valid?}
    N -->|No| O[Show Errors]
    O --> I
    
    N -->|Yes| P[Submit Form]
    P --> Q[Insert Product Record]
    Q --> R[Insert Product Images]
    R --> S[Insert Weight Variants]
    S --> T[Invalidate Queries]
    T --> U[Show Success Message]
    U --> E
    
    F -->|Edit Product| V[Click Edit Button]
    V --> W[Load Product Form]
    W --> X[Prefill with Current Data]
    X --> H
    
    P --> Y[Update Product Record]
    Y --> R
    
    F -->|Delete Product| Z[Click Delete]
    Z --> AA{Confirm Delete?}
    AA -->|No| E
    AA -->|Yes| AB[Delete Product]
    AB --> AC[Delete Related Images]
    AC --> AD[Delete Variants]
    AD --> T
    
    F -->|Search/Filter| AE[Enter Search/Category]
    AE --> AF[Filter Products]
    AF --> E
    
    style A fill:#e1f5ff
    style U fill:#c8e6c9
    style O fill:#ffcdd2
```

## 9. Bulk Order Inquiry Process

```mermaid
flowchart TD
    A[User Visits Bulk Orders Page] --> B[View Bulk Orders Info]
    B --> C[Fill Inquiry Form]
    C --> D[Select Product]
    D --> E[Enter Quantity]
    E --> F[Provide Address]
    F --> G[Add Special Notes]
    G --> H[Validate Form]
    H --> I{Valid?}
    I -->|No| J[Show Errors]
    J --> C
    
    I -->|Yes| K[Submit Inquiry]
    K --> L[Create Inquiry Record]
    L --> M[Save to Database]
    M --> N[Send Admin Email]
    N --> O[Send Customer Confirmation]
    O --> P[Show Success Message]
    
    P --> Q[Redirect to Inquiry List]
    Q --> R[Display User's Inquiries]
    R --> S{User Action?}
    
    S -->|View Status| T[Click Inquiry]
    T --> U[Display Details]
    U --> V[Show Current Status]
    V --> S
    
    S -->|Edit Inquiry| W[Click Edit]
    W --> X[Modify Details]
    X --> Y[Update Record]
    Y --> Z[Show Updated Inquiry]
    Z --> R
    
    S -->|Cancel Inquiry| AA[Click Cancel]
    AA --> AB{Confirm Cancel?}
    AB -->|Yes| AC[Mark as Cancelled]
    AC --> R
    AB -->|No| R
    
    style A fill:#e1f5ff
    style P fill:#c8e6c9
    style J fill:#ffcdd2
```

## 10. Contact Message Process

```mermaid
flowchart TD
    A[User Visits Contact Page] --> B[View Contact Form]
    B --> C[Fill Contact Details]
    C --> D[Enter: Name, Email, Subject, Message]
    D --> E[Validate Form]
    E --> F{Valid?}
    F -->|No| G[Show Validation Errors]
    G --> C
    
    F -->|Yes| H[Submit Message]
    H --> I[Insert into Database]
    I --> J[Send Admin Email]
    J --> K[Send Customer Confirmation]
    K --> L[Show Success Message]
    
    L --> M{User Action?}
    M -->|Back to Home| N[Redirect to Home]
    M -->|Continue| O[Clear Form]
    O --> B
    
    N --> P[End]
    
    note over J,K[Async Email Service]
    
    style A fill:#e1f5ff
    style L fill:#c8e6c9
    style G fill:#ffcdd2
```

## 11. Offer & Coupon Management Process

```mermaid
flowchart TD
    A[Admin Creates Offer] --> B[Fill Offer Form]
    B --> C[Enter: Code, Type, Discount]
    C --> D[Set Validity Period]
    D --> E[Set Usage Limit]
    E --> F[Validate Form]
    F --> G{Valid?}
    G -->|No| H[Show Errors]
    H --> C
    
    G -->|Yes| I[Save Offer to Database]
    I --> J[Publish Offer]
    
    J --> K[User Views Shop/Checkout]
    K --> L[Display Available Offers]
    L --> M{User Action?}
    
    M -->|Apply Offer| N[Enter Code in Checkout]
    N --> O[Validate Code Format]
    O --> P{Valid?}
    P -->|No| Q[Show Error]
    Q --> N
    
    P -->|Yes| R[Check Code Exists]
    R --> S{Found?}
    S -->|No| Q
    
    S -->|Yes| T[Check Validity Date]
    T --> U{In Range?}
    U -->|No| Q
    
    U -->|Yes| V[Check Usage Count]
    V --> W{Within Limit?}
    W -->|No| Q
    
    W -->|Yes| X[Calculate Discount]
    X --> Y[Update Cart Total]
    Y --> Z[Show Applied Offer]
    
    Z --> AA{Proceed?}
    AA -->|Yes| AB[Complete Order with Discount]
    AA -->|No| AC[Remove Offer]
    AC --> L
    
    M -->|Browse Offers| AD[View Offer List]
    AD --> L
    
    style I fill:#c8e6c9
    style Q fill:#ffcdd2
```

## 12. Notification Flow Process

```mermaid
flowchart TD
    A[Triggering Event] --> B{Event Type?}
    
    B -->|User Registration| C[New User Signup]
    B -->|Password Reset| D[Password Reset Request]
    B -->|Order Confirmation| E[Order Created]
    B -->|Payment Success| F[Payment Completed]
    B -->|Order Status Change| G[Status Updated]
    B -->|Cart Abandonment| H[24h No Purchase]
    
    C --> I[Collect User Data]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[Prepare Notification Content]
    J --> K{Notification<br/>Type?}
    
    K -->|Email| L[Format Email Template]
    K -->|SMS| M[Format SMS Text]
    K -->|WhatsApp| N[Format WhatsApp Message]
    
    L --> O[Queue Email]
    M --> P[Queue SMS]
    N --> Q[Queue WhatsApp]
    
    O --> R[Send via Email Service]
    P --> S[Send via SMS Service]
    Q --> T[Send via WhatsApp API]
    
    R --> U{Success?}
    S --> U
    T --> U
    
    U -->|Yes| V[Log Success]
    U -->|No| W[Log Error]
    
    V --> X[Update Notification Status]
    W --> X
    X --> Y[End]
    
    style C fill:#fff9c4
    style E fill:#fff9c4
    style V fill:#c8e6c9
    style W fill:#ffcdd2
```

## 13. Product Categorization Hierarchy

```mermaid
graph TD
    A[All Products]
    
    A --> B[🍵 Tea]
    A --> C[🍯 Honey]
    A --> D[🥛 Ghee<br/>Future]
    
    B --> B1[Black Tea]
    B --> B2[Green Tea]
    B --> B3[White Tea]
    B --> B4[Oolong Tea]
    B --> B5[Chai Blends]
    B --> B6[Herbal Tea]
    B --> B7[Specialty Tea]
    
    C --> C1[Wild Forest Honey]
    C --> C2[Multiflora Honey]
    C --> C3[Himalayan Honey]
    C --> C4[Infused Honey]
    
    D --> D1[Cow Ghee - Future]
    D --> D2[Buffalo Ghee - Future]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#fce4ec
    style D fill:#f3e5f5
```

## 14. Inventory Management Process

```mermaid
flowchart TD
    A[Product in System] --> B[Check Current Stock]
    B --> C{Stock<br/>Available?}
    
    C -->|Yes| D[Display Product]
    D --> E[User Adds to Cart]
    E --> F[Decrement Reserved Stock]
    F --> G[Continue]
    
    C -->|No| H[Show Out of Stock]
    H --> I[Show Notification]
    
    G --> J[User Completes Order]
    J --> K[Decrement Final Stock]
    K --> L{Stock Below<br/>Threshold?}
    
    L -->|Yes| M[Generate Reorder Alert]
    M --> N[Notify Admin]
    N --> O[Email Alert]
    
    L -->|No| P[Update Complete]
    
    O --> Q[Admin Reviews Stock]
    Q --> R[Place Reorder]
    R --> S[Receive New Inventory]
    S --> T[Update Stock in DB]
    T --> P
    
    style D fill:#c8e6c9
    style H fill:#ffcdd2
    style M fill:#fff9c4
```

## 15. Analytics & Reporting Process

```mermaid
flowchart TD
    A[Data Generated] --> B{Data Type?}
    
    B -->|Product Views| C[Track Page Visits]
    B -->|Cart Actions| D[Track Add/Remove]
    B -->|Orders| E[Track Purchases]
    B -->|Payments| F[Track Transactions]
    
    C --> G[Store in Analytics Table]
    D --> G
    E --> G
    F --> G
    
    G --> H[Admin Generates Report]
    H --> I{Report Type?}
    
    I -->|Sales| J[Calculate Total Revenue]
    I -->|Products| K[Top Selling Products]
    I -->|Customers| L[Customer Demographics]
    I -->|Orders| M[Order Fulfillment Stats]
    
    J --> N[Fetch from Orders/Payments]
    K --> O[Fetch from Order Items]
    L --> P[Fetch from Profiles]
    M --> Q[Calculate Status Distribution]
    
    N --> R[Format Report Data]
    O --> R
    P --> R
    Q --> R
    
    R --> S[Generate Charts/Graphs]
    S --> T[Display Dashboard]
    T --> U[Export to CSV/PDF]
    
    style H fill:#e1f5ff
    style T fill:#fff9c4
```

## Process Flow Legend

| Symbol | Meaning |
|--------|---------|
| Rounded Rectangle | Start/End Point |
| Rectangle | Process/Action |
| Diamond | Decision Point |
| Arrow | Flow Direction |
| Color Blue | Start Point |
| Color Yellow | Data Display |
| Color Green | Success/Complete |
| Color Red | Error/Failure |

## Key Process Milestones

### Customer Journey Milestones
1. ✅ User Registration → Complete
2. ✅ Product Browsing → Complete
3. ✅ Shopping Cart → Complete
4. ✅ Checkout (COD) → Complete
5. ✅ Payment (Razorpay) → Complete
6. ✅ Order Confirmation → Complete
7. 🔄 Notifications → In Progress
8. 📋 Order Tracking → Implemented
9. 📦 Bulk Orders → Implemented
10. 💬 Contact Support → Implemented

### Admin Journey Milestones
1. ✅ Admin Login → Complete
2. ✅ Product Management → Complete
3. ✅ Order Management → Complete
4. ✅ Offer Management → Complete
5. 📊 Analytics Dashboard → Planned
6. 📧 Notification Management → Planned
7. 🎯 Customer Insights → Planned

## Critical Paths

### Sales Critical Path
User Signup → Browse Products → Add to Cart → Checkout → Payment → Order Confirmation → Notification

### Admin Critical Path
Admin Login → Inventory Check → Order Processing → Fulfillment → Shipping Updates → Customer Notification
