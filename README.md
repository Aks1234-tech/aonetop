# Aonetop - Modern E-commerce Platform

Aonetop is a comprehensive, full-featured e-commerce application built with modern web technologies, offering a seamless shopping experience for users and robust management tools for administrators. Built with React, TypeScript, and Supabase, it provides enterprise-grade features including real-time inventory management, secure payment processing, and advanced order tracking.

## Features

### Customer Features
-   **Product Browsing & Discovery**: Intuitive product catalog with advanced filtering by category, price, and ratings
-   **Product Details**: Comprehensive product pages with images, specifications, and weight variants
-   **Shopping Cart**: Smart cart management with local/cloud synchronization, quantity updates, and item removal
-   **Checkout Process**: Streamlined checkout with address validation and order summary
-   **Payment Integration**: Razorpay payment gateway supporting:
    -   UPI payments (Google Pay, PhonePe, Paytm, etc.)
    -   Card payments (Credit/Debit cards)
    -   Net Banking
    -   Digital Wallets
    -   Cash on Delivery
-   **Order Management**: Complete order tracking with status updates (Pending, Processing, Shipped, Delivered)
-   **Order History**: View past orders with detailed information and PDF invoice generation
-   **User Authentication**: Secure signup/login with email verification and password reset
-   **User Profile**: Manage profile information, contact details, and preferences
-   **Bulk Orders**: Specialized functionality for wholesale/bulk purchasing with custom pricing
-   **Customer Testimonials**: Browse and submit reviews/ratings
-   **Newsletter Subscription**: Stay updated with latest offers and products
-   **Responsive Design**: Fully optimized for all device sizes (mobile, tablet, desktop)

### Admin Features
-   **Admin Dashboard**: Comprehensive management panel with analytics and key metrics
-   **Product Management**: Add, edit, delete, and manage product inventory with weight variants
-   **Category Management**: Create and manage product categories
-   **Order Management**: View, filter, and manage all customer orders with payment status tracking
-   **Payment Tracking**: Monitor payment status, transaction IDs, and payment confirmations
-   **Contact Messages**: Manage customer inquiries and support messages
-   **Bulk Order Inquiries**: Handle and respond to bulk order requests
-   **Offers & Coupon Management**: Create and manage discount offers
-   **Customer Reviews**: Manage and moderate customer reviews and testimonials

### Additional Features
-   **Contact & About Pages**: Informational pages for customer engagement
-   **Search Functionality**: Quick product search across catalog
-   **Category Navigation**: Easy browsing by product categories
-   **Error Handling**: Comprehensive error management with user-friendly messages
-   **Protected Routes**: Role-based access control (Admin/Customer)
-   **Real-time Updates**: Live inventory and order status synchronization

## Tech Stack

This project is built using a modern, type-safe, and production-ready stack, organized by architecture layers:

### Frontend Stack

| Technology | Purpose | Link |
|-----------|---------|------|
| **React 18** | Modern UI library with hooks for building interactive components | [react.dev](https://react.dev/) |
| **TypeScript** | Type-safe JavaScript for improved code quality and developer experience | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Vite** | Lightning-fast frontend build tool and dev server with HMR | [vitejs.dev](https://vitejs.dev/) |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development | [tailwindcss.com](https://tailwindcss.com/) |
| **shadcn/ui** | Accessible, customizable component library with Radix UI primitives | [ui.shadcn.com](https://ui.shadcn.com/) |
| **TanStack Query (React Query)** | Powerful server state management and data synchronization | [tanstack.com/query](https://tanstack.com/query/latest) |
| **React Hook Form** | Performant, flexible form validation and management | [react-hook-form.com](https://react-hook-form.com/) |
| **Zod** | TypeScript-first schema validation library | [zod.dev](https://zod.dev/) |
| **React Router DOM v6** | Modern client-side routing with protected routes and dynamic segments | [reactrouter.com](https://reactrouter.com/) |
| **Context API** | Built-in React solution for global state (AuthContext, CartContext) | [react.dev](https://react.dev/) |
| **Lucide React** | Beautiful, consistent icon library with 460+ icons | [lucide.dev](https://lucide.dev/) |
| **Embla Carousel** | Flexible carousel/slider component for product galleries | [embla-carousel.com](https://www.embla-carousel.com/) |
| **jsPDF** | Library for generating PDF invoices and receipts | [github.com/parallax/jsPDF](https://github.com/parallax/jsPDF) |
| **Recharts** | Lightweight charting library for analytics and dashboards | [recharts.org](https://recharts.org/) |
| **date-fns** | Lightweight date utility library for date manipulation | [date-fns.org](https://date-fns.org/) |
| **Sonner** | Beautiful, accessible toast notification system | [sonner.emilkowal.ski](https://sonner.emilkowal.ski/) |
| **clsx** | Utility for constructing className strings conditionally | [github.com/lukeed/clsx](https://github.com/lukeed/clsx) |
| **tailwind-merge** | Utility for merging Tailwind CSS classes intelligently | [github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge) |
| **tailwindcss-animate** | Pre-built animation utilities for Tailwind CSS | [github.com/hypesystem/tailwindcss-animate](https://github.com/hypesystem/tailwindcss-animate) |
| **Radix UI** | Unstyled, accessible UI primitives as foundation for shadcn/ui | [radix-ui.com](https://www.radix-ui.com/) |
| **react-resizable-panels** | Resizable panel layout component for flexible layouts | [github.com/bvaughn/react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) |
| **cmdk** | Fast command palette component for keyboard navigation | [github.com/pacocoursey/cmdk](https://github.com/pacocoursey/cmdk) |
| **input-otp** | Accessible OTP input component for two-factor authentication | [github.com/dcousens/input-otp](https://github.com/dcousens/input-otp) |

### Backend Stack

| Technology | Purpose | Link |
|-----------|---------|------|
| **Supabase** | Backend-as-a-Service platform with PostgreSQL and real-time capabilities | [supabase.com](https://supabase.com/) |
| **PostgreSQL** | Powerful, open-source relational database with advanced features | [postgresql.org](https://www.postgresql.org/) |
| **Supabase Auth** | JWT token-based authentication with email verification and OAuth | [supabase.com](https://supabase.com/) |
| **Row Level Security (RLS)** | Database-level access control policies for data protection | [supabase.com](https://supabase.com/) |
| **Supabase Realtime** | Live data synchronization across clients using WebSockets | [supabase.com](https://supabase.com/) |
| **Supabase Edge Functions** | Serverless functions for custom backend logic and webhook handling | [supabase.com](https://supabase.com/) |

### APIs & External Services

| Service | Purpose | Link |
|---------|---------|------|
| **Razorpay** | Payment gateway supporting UPI, card payments, net banking, and digital wallets | [razorpay.com](https://razorpay.com/) |
| **Razorpay Orders API** | Create and manage payment orders | [razorpay.com/docs](https://razorpay.com/docs/) |
| **Razorpay Payments API** | Verify and manage payment transactions | [razorpay.com/docs](https://razorpay.com/docs/) |
| **Razorpay Webhooks** | Real-time payment status notifications | [razorpay.com/docs](https://razorpay.com/docs/) |

### Development Tools & Configuration

| Tool | Purpose | Category |
|------|---------|----------|
| **ESLint** | Code quality and style checking with modern JavaScript rules | Linting |
| **Vite Config** | Build configuration for optimized production builds | Build Configuration |
| **TypeScript Config** | Type checking and compilation configuration | Type Checking |
| **Tailwind Config** | Customization for Tailwind CSS framework | Styling Configuration |
| **PostCSS** | CSS transformation tool with plugins (Tailwind, Autoprefixer) | CSS Processing |
| **Autoprefixer** | Automatically add vendor prefixes for cross-browser compatibility | CSS Processing |
| **npm/yarn** | Package manager for dependency management and scripting | Package Management |
| **ES Modules** | Modern JavaScript module system for code organization | Module System |

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js** (v16 or higher)
-   **npm** or **yarn** package manager
-   **Supabase Account** (for backend services)
-   **Razorpay Account** (for payment processing - test/production keys)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd aonetop
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the project root:
    ```env
    # Supabase Configuration
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    
    # Razorpay Configuration
    VITE_RAZORPAY_KEY_ID=your_razorpay_test_key_id
    
    # Optional: For production
    # RAZORPAY_KEY_SECRET=your_razorpay_secret_key (backend only)
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`

5.  **Build for production:**
    ```bash
    npm run build
    ```

6.  **Preview production build:**
    ```bash
    npm run preview
    ```

### Database Setup (Supabase)

The project uses Supabase for backend services. Migrations are automatically applied via the migrations directory.

To manually run migrations:
```bash
supabase migration up
```

### Payment Testing (Razorpay)

Use Razorpay test credentials for testing:
- **Test Card**: 4111 1111 1111 1111 (Visa)
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

## Available Scripts

### Development
-   `npm run dev`: Starts the Vite development server with hot module reloading.

### Build & Deployment
-   `npm run build`: Creates an optimized production build.
-   `npm run build:dev`: Creates a development-mode build for debugging.
-   `npm run preview`: Serves the production build locally for testing before deployment.

### Code Quality
-   `npm run lint`: Runs ESLint to check for code quality issues and style violations.

## Project Structure

```
aonetop/
├── src/
│   ├── pages/                 # Page components
│   │   ├── Index.tsx         # Home page with hero, featured products, testimonials
│   │   ├── Shop.tsx          # Product listing with filters
│   │   ├── ProductDetails.tsx # Individual product page with variants
│   │   ├── Cart.tsx          # Shopping cart management
│   │   ├── Checkout.tsx      # Checkout with payment integration
│   │   ├── OrderHistory.tsx  # User's past orders
│   │   ├── Profile.tsx       # User profile management
│   │   ├── Admin.tsx         # Admin dashboard
│   │   ├── BulkOrders.tsx    # Bulk order requests
│   │   ├── About.tsx         # About page
│   │   ├── Contact.tsx       # Contact page
│   │   ├── Login.tsx         # User login
│   │   ├── Signup.tsx        # User registration
│   │   └── NotFound.tsx      # 404 page
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx      # Customer route protection
│   │   ├── AdminProtectedRoute.tsx # Admin route protection
│   │   ├── NavLink.tsx            # Navigation links
│   │   │
│   │   ├── home/                  # Home page components
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── Bestsellers.tsx
│   │   │   ├── ShopByCategory.tsx
│   │   │   ├── CustomerReviews.tsx
│   │   │   ├── BulkOrdersTeaser.tsx
│   │   │   ├── WhyChoose.tsx
│   │   │   ├── AboutPreview.tsx
│   │   │   └── Newsletter.tsx
│   │   │
│   │   ├── admin/                 # Admin components
│   │   │   ├── ProductsManager.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   ├── OrdersManager.tsx
│   │   │   ├── ContactMessagesManager.tsx
│   │   │   ├── InquiriesManager.tsx
│   │   │   ├── OffersManager.tsx
│   │   │   └── AdminProtectedRoute.tsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── CartDrawer.tsx
│   │   │
│   │   └── ui/                    # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── form.tsx
│   │       └── ... (40+ UI components)
│   │
│   ├── contexts/               # State management
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── CartContext.tsx     # Shopping cart state
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useProducts.ts      # Product data fetching
│   │   ├── useCategories.ts    # Category management
│   │   ├── useOrders.ts        # Order operations
│   │   ├── useOffers.ts        # Discount offers
│   │   ├── useContactMessages.ts # Contact form handling
│   │   ├── useInquiries.ts     # Bulk order inquiries
│   │   ├── useForms.ts         # Generic form utilities
│   │   ├── useWeightVariants.ts # Product variants
│   │   ├── use-mobile.tsx      # Mobile detection
│   │   └── use-toast.ts        # Toast notifications
│   │
│   ├── lib/                    # Utility functions & configuration
│   │   ├── supabase.ts         # Supabase client setup
│   │   ├── razorpay.ts         # Razorpay payment integration
│   │   ├── generateInvoicePDF.ts # PDF invoice generation
│   │   ├── database.types.ts   # TypeScript types from Supabase
│   │   └── utils.ts            # Common utility functions
│   │
│   ├── data/                   # Static/Mock data
│   │   └── products.ts
│   │
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   └── App.css
│
├── supabase/                   # Supabase configuration
│   ├── config.toml             # Supabase project config
│   ├── seed.sql                # Database seed data
│   ├── migrations/             # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_fix_order_number_race_condition.sql
│   │   ├── 004_bulk_order_address.sql
│   │   ├── 005_update_categories.sql
│   │   ├── 006_weight_variants.sql
│   │   └── 007_payment_integration.sql
│   ├── functions/              # Edge functions
│   │   ├── create-razorpay-order/
│   │   └── verify-payment/
│   └── snippets/               # SQL snippets
│
├── docs/                       # Documentation
│   ├── BACKEND_DOCS.md
│   ├── TECHNICAL_DOCS.md
│   ├── PAYMENT_INTEGRATION_PLAN.md
│   ├── NOTIFICATIONS_IMPLEMENTATION_PLAN.md
│   ├── RAZORPAY_ISSUE_ANALYSIS.md
│   ├── FIXES_APPLIED.md
│   └── implementation_plan.md
│
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── package.json                # Project dependencies
└── README.md                   # This file
```

## Key Modules & Features

### Authentication Module (`src/contexts/AuthContext.tsx`)
- User signup with email verification
- Secure login/logout
- Password reset functionality
- Automatic session persistence
- User profile management
- Admin role detection

### Cart Module (`src/contexts/CartContext.tsx`)
- Local/cloud hybrid storage
- Real-time cart synchronization
- Quantity management
- Discount offer application
- Cart persistence across sessions

### Product Management (`src/hooks/useProducts.ts`)
- Fetch all products with filtering
- Product search functionality
- Category-based filtering
- Weight variant management
- Real-time inventory updates

### Order Processing (`src/hooks/useOrders.ts`)
- Order creation and tracking
- Payment status management
- Order history retrieval
- Invoice PDF generation
- Status update notifications

### Payment Integration (`src/lib/razorpay.ts`)
- Razorpay payment gateway integration
- Multiple payment method support
- Payment verification
- Transaction logging
- Error handling & retries

### Admin Features
- Product catalog management
- Category management
- Order management with payment tracking
- Customer message management
- Bulk order inquiry handling
- Offer/coupon management

## Database Schema

The application uses PostgreSQL (via Supabase) with the following main tables:

- **users** - User authentication and profiles
- **profiles** - Extended user information (role, phone, address)
- **products** - Product catalog with pricing
- **product_variants** - Weight/size variants
- **categories** - Product categories
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Individual items in orders
- **payments** - Payment transaction records
- **offers** - Discount codes and offers
- **contact_messages** - Customer inquiries
- **bulk_order_inquiries** - Wholesale order requests
- **customer_reviews** - Product reviews and ratings

All tables implement Row Level Security (RLS) policies for data protection.

## Security Features

✅ **Authentication & Authorization**
- JWT token-based authentication
- Row Level Security (RLS) policies
- Protected routes (Customer & Admin)
- Session timeout protection

✅ **Payment Security**
- Razorpay integration with server-side verification
- No sensitive card data stored locally
- Transaction ID tracking
- PCI compliance adherence

✅ **Data Protection**
- HTTPS-only communication
- SQL injection prevention via parameterized queries
- XSS protection via React's built-in escaping
- CSRF token protection where applicable

✅ **User Privacy**
- Encrypted sensitive data
- Secure password reset tokens (24-hour expiry)
- User data isolation via RLS policies

## Performance Optimizations

- 🚀 **Code Splitting** - Route-based lazy loading
- 📦 **Bundle Optimization** - Vite's native tree-shaking
- 🎯 **Query Caching** - TanStack Query with stale-time management
- 💾 **State Persistence** - Local storage for cart/auth
- 🖼️ **Image Optimization** - Responsive images with proper sizing
- 🔄 **Real-time Updates** - Supabase Realtime subscriptions

## Deployment

The application is optimized for deployment on platforms like:
- **Vercel** - Recommended for optimal performance
- **Netlify** - Full-stack deployment support
- **AWS Amplify** - AWS ecosystem integration
- **Docker** - Containerized deployment

For deployment, ensure environment variables are properly configured in your hosting platform.

## Documentation

Comprehensive technical documentation is available in the `/docs` directory:
- [Backend Documentation](./docs/BACKEND_DOCS.md) - Detailed backend architecture
- [Technical Documentation](./docs/TECHNICAL_DOCS.md) - In-depth technical details
- [Payment Integration Plan](./docs/PAYMENT_INTEGRATION_PLAN.md) - Razorpay integration guide
- [Notifications Plan](./docs/NOTIFICATIONS_IMPLEMENTATION_PLAN.md) - Email/SMS/WhatsApp notifications
- [Implementation Plan](./docs/implementation_plan.md) - Feature implementation roadmap

## Contributing

To contribute to this project:

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -am 'Add feature'`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request with a detailed description

## Troubleshooting

### Common Issues

**Issue**: Supabase connection errors
- **Solution**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`

**Issue**: Payment integration not working
- **Solution**: Check Razorpay keys and ensure webhook URL is properly configured

**Issue**: Database migrations not applying
- **Solution**: Run `supabase migration up` and check Supabase dashboard for errors

**Issue**: Cart not syncing
- **Solution**: Verify user is authenticated and Supabase connection is active

For more help, check the documentation files in `/docs` or review the existing GitHub issues.

## License

[Add License Information Here]

## Support & Contact

For support, questions, or bug reports:
- Create an issue on GitHub
- Contact the development team
- Check documentation in `/docs` directory

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready
