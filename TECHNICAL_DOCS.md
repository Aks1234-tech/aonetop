# Technical Documentation

## 1. Technology Stack

The project utilizes a modern, type-safe React stack powered by Vite.

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 18 | Component-based UI library. |
| **Language** | TypeScript | Statically typed JavaScript for better maintainability. |
| **Build Tool** | Vite | Fast development server and build tool. |
| **Styling** | Tailwind CSS | Utility-first CSS framework. |
| **UI Library** | shadcn/ui | Reusable components built on Radix UI and Tailwind. |
| **State Management** | React Context & React Query | Context for global UI state (Cart); React Query for async data. |
| **Routing** | React Router DOM | Client-side routing. |
| **Forms** | React Hook Form + Zod | Form handling and schema validation. |
| **Icons** | Lucide React | Consistent icon set. |

## 2. Project Architecture

### Directory Structure

-   `src/components`:
    -   `ui/`: Base UI components (buttons, inputs, dialogs, etc.).
    -   `layout/`: Structural components (Header, Footer, Layout wrapper).
    -   `home/`: Components specific to the landing page (Hero, FeaturedProducts).
-   `src/pages`: Top-level route components.
-   `src/contexts`: React Context providers (e.g., `CartContext`).
-   `src/hooks`: Custom hooks (e.g., `use-toast`).
-   `src/lib`: Utilities (e.g., `cn` class merger).
-   `src/data`: Static data files (e.g., `products.ts`).

### Routes (`App.tsx`)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `Index` | Homepage. |
| `/shop` | `Shop` | Product listing with filters and sorting. |
| `/products/:id` | `ProductDetails` | Single product view. |
| `/cart` | `Cart` | Shopping cart summary. |
| `/checkout` | `Checkout` | Checkout form. |
| `/about` | `About` | About Us page. |
| `/contact` | `Contact` | Contact form. |
| `/bulk-orders` | `BulkOrders` | Bulk order inquiry form. |
| `/admin` | `Admin` | Admin dashboard. |

## 3. Workflows & Features

### Product Browsing (`Shop.tsx`)
-   **Data Source**: Currently uses a static `products` array from `@/data/products`.
-   **Filtering**: Client-side filtering by Category and Search Query.
-   **Sorting**: Client-side sorting (Price, Name, Rating, Featured).
-   **UI**: Responsive grid/list view toggle.

### Shopping Cart
-   **State**: Managed via `CartContext`.
-   **Storage**: Persisted in `localStorage` (assumed standard pattern for this context).
-   **Interaction**: Users can add items from Shop or Product Details. Cart is often accessible via a Drawer (`CartDrawer`).

### Checkout
-   **Form**: Multi-step or long-form input for shipping and payment details.
-   **Validation**: Uses `react-hook-form` and `zod` schema validation.

### Admin Dashboard
-   **Purpose**: Manage store settings and potentially view orders/products.
-   **Auth**: Likely simple client-side protection or placeholder for this demo.

## 4. Key UI Components

### Layout Components
-   **Header**: Contains navigation, search trigger, and cart indicator.
-   **Footer**: Site links and newsletter signup.
-   **CartDrawer**: Slide-out panel showing cart contents.

### Home Components
-   **Hero**: Main banner with Call-to-Action.
-   **FeaturedProducts**: Carousel or grid of highlighted items.
-   **WhyChoose**: Value proposition section.

## 5. API & Data Fetching

-   **React Query**: Configured in `App.tsx` (`QueryClientProvider`). Used for managing async state, caching, and background updates.
-   **Mock Data**: The application currently relies heavily on `src/data` for product listings, simulating a backend response. Future integration would replace these imports with API calls (e.g., `fetch` or `axios` inside `useQuery` hooks).
