export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    phone: string | null;
                    avatar_url: string | null;
                    role: string;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    phone?: string | null;
                    avatar_url?: string | null;
                    role?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    phone?: string | null;
                    avatar_url?: string | null;
                    role?: string;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    long_description: string | null;
                    price: number;
                    original_price: number | null;
                    category: string;
                    product_type: string | null;
                    weight_category: string | null;
                    tags: string[] | null;
                    weight: string | null;
                    // origin: string | null;
                    // brewing_temp: string | null;
                    // brewing_time: string | null;
                    // brewing_amount: string | null;
                    in_stock: boolean;
                    is_bestseller: boolean;
                    is_featured: boolean;
                    is_new: boolean;
                    rating: number;
                    reviews_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    long_description?: string | null;
                    price: number;
                    original_price?: number | null;
                    category: string;
                    product_type?: string | null;
                    weight_category?: string | null;
                    tags?: string[] | null;
                    weight?: string | null;
                    // origin?: string | null;
                    // brewing_temp?: string | null;
                    // brewing_time?: string | null;
                    // brewing_amount?: string | null;
                    in_stock?: boolean;
                    is_bestseller?: boolean;
                    is_featured?: boolean;
                    is_new?: boolean;
                    rating?: number;
                    reviews_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    long_description?: string | null;
                    price?: number;
                    original_price?: number | null;
                    category?: string;
                    product_type?: string | null;
                    weight_category?: string | null;
                    tags?: string[] | null;
                    weight?: string | null;
                    // origin?: string | null;
                    // brewing_temp?: string | null;
                    // brewing_time?: string | null;
                    // brewing_amount?: string | null;
                    in_stock?: boolean;
                    is_bestseller?: boolean;
                    is_featured?: boolean;
                    is_new?: boolean;
                    rating?: number;
                    reviews_count?: number;
                    created_at?: string;
                };
            };
            product_images: {
                Row: {
                    id: string;
                    product_id: string;
                    url: string;
                    is_primary: boolean;
                    sort_order: number;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    url: string;
                    is_primary?: boolean;
                    sort_order?: number;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    url?: string;
                    is_primary?: boolean;
                    sort_order?: number;
                };
            };
            product_weight_variants: {
                Row: {
                    id: string;
                    product_id: string;
                    weight: string;
                    price: number;
                    original_price: number | null;
                    stock_quantity: number;
                    in_stock: boolean;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    weight: string;
                    price: number;
                    original_price?: number | null;
                    stock_quantity?: number;
                    in_stock?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    weight?: string;
                    price?: number;
                    original_price?: number | null;
                    stock_quantity?: number;
                    in_stock?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    sort_order: number;
                    parent_id: string | null;
                    image_url: string | null;
                };
                Insert: {
                    id: string;
                    name: string;
                    description?: string | null;
                    sort_order?: number;
                    parent_id?: string | null;
                    image_url?: string | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    sort_order?: number;
                    parent_id?: string | null;
                    image_url?: string | null;
                };
            };
            carts: {
                Row: {
                    id: string;
                    user_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    created_at?: string;
                };
            };
            cart_items: {
                Row: {
                    id: string;
                    cart_id: string;
                    product_id: string;
                    quantity: number;
                    weight_variant_id: string | null;
                };
                Insert: {
                    id?: string;
                    cart_id: string;
                    product_id: string;
                    quantity?: number;
                    weight_variant_id?: string | null;
                };
                Update: {
                    id?: string;
                    cart_id?: string;
                    product_id?: string;
                    quantity?: number;
                    weight_variant_id?: string | null;
                };
            };
            orders: {
                Row: {
                    id: string;
                    user_id: string | null;
                    order_number: string | null;
                    status: string;
                    subtotal: number;
                    shipping_cost: number;
                    total: number;
                    payment_method: string;
                    shipping_name: string | null;
                    shipping_email: string | null;
                    shipping_phone: string | null;
                    shipping_address: string | null;
                    shipping_city: string | null;
                    shipping_state: string | null;
                    shipping_pincode: string | null;
                    notes: string | null;
                    offer_id: string | null;
                    discount_amount: number;
                    // Payment gateway fields
                    razorpay_order_id: string | null;
                    razorpay_payment_id: string | null;
                    razorpay_signature: string | null;
                    payment_status: 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded';
                    payment_gateway: 'cod' | 'razorpay';
                    paid_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    order_number?: string | null;
                    status?: string;
                    subtotal: number;
                    shipping_cost?: number;
                    total: number;
                    payment_method?: string;
                    shipping_name?: string | null;
                    shipping_email?: string | null;
                    shipping_phone?: string | null;
                    shipping_address?: string | null;
                    shipping_city?: string | null;
                    shipping_state?: string | null;
                    shipping_pincode?: string | null;
                    notes?: string | null;
                    offer_id?: string | null;
                    discount_amount?: number;
                    // Payment gateway fields
                    razorpay_order_id?: string | null;
                    razorpay_payment_id?: string | null;
                    razorpay_signature?: string | null;
                    payment_status?: 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded';
                    payment_gateway?: 'cod' | 'razorpay';
                    paid_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    order_number?: string | null;
                    status?: string;
                    subtotal?: number;
                    shipping_cost?: number;
                    total?: number;
                    payment_method?: string;
                    shipping_name?: string | null;
                    shipping_email?: string | null;
                    shipping_phone?: string | null;
                    shipping_address?: string | null;
                    shipping_city?: string | null;
                    shipping_state?: string | null;
                    shipping_pincode?: string | null;
                    notes?: string | null;
                    offer_id?: string | null;
                    discount_amount?: number;
                    // Payment gateway fields
                    razorpay_order_id?: string | null;
                    razorpay_payment_id?: string | null;
                    razorpay_signature?: string | null;
                    payment_status?: 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded';
                    payment_gateway?: 'cod' | 'razorpay';
                    paid_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    product_id: string;
                    product_name: string;
                    product_image: string | null;
                    quantity: number;
                    price: number;
                    weight_variant_id: string | null;
                    weight_value: string | null;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    product_id: string;
                    product_name: string;
                    product_image?: string | null;
                    quantity: number;
                    price: number;
                    weight_variant_id?: string | null;
                    weight_value?: string | null;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    product_id?: string;
                    product_name?: string;
                    product_image?: string | null;
                    quantity?: number;
                    price?: number;
                    weight_variant_id?: string | null;
                    weight_value?: string | null;
                };
            };
            contact_messages: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    subject: string | null;
                    message: string;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    email: string;
                    phone?: string | null;
                    subject?: string | null;
                    message: string;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    phone?: string | null;
                    subject?: string | null;
                    message?: string;
                    is_read?: boolean;
                    created_at?: string;
                };
            };
            bulk_inquiries: {
                Row: {
                    id: string;
                    company_name: string;
                    contact_name: string;
                    email: string;
                    phone: string;
                    business_type: string | null;
                    estimated_volume: string | null;
                    products_interested: string | null;
                    message: string | null;
                    address: string | null;
                    pincode: string | null;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_name: string;
                    contact_name: string;
                    email: string;
                    phone: string;
                    business_type?: string | null;
                    estimated_volume?: string | null;
                    products_interested?: string | null;
                    message?: string | null;
                    address?: string | null;
                    pincode?: string | null;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_name?: string;
                    contact_name?: string;
                    email?: string;
                    phone?: string;
                    business_type?: string | null;
                    estimated_volume?: string | null;
                    products_interested?: string | null;
                    message?: string | null;
                    address?: string | null;
                    pincode?: string | null;
                    status?: string;
                    created_at?: string;
                };
            };
            offers: {
                Row: {
                    id: string;
                    name: string;
                    code: string | null;
                    type: string;
                    value: number | null;
                    min_order_value: number | null;
                    max_discount: number | null;
                    applies_to: string;
                    is_active: boolean;
                    starts_at: string | null;
                    ends_at: string | null;
                    usage_limit: number | null;
                    used_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    code?: string | null;
                    type: string;
                    value?: number | null;
                    min_order_value?: number | null;
                    max_discount?: number | null;
                    applies_to?: string;
                    is_active?: boolean;
                    starts_at?: string | null;
                    ends_at?: string | null;
                    usage_limit?: number | null;
                    used_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    code?: string | null;
                    type?: string;
                    value?: number | null;
                    min_order_value?: number | null;
                    max_discount?: number | null;
                    applies_to?: string;
                    is_active?: boolean;
                    starts_at?: string | null;
                    ends_at?: string | null;
                    usage_limit?: number | null;
                    used_count?: number;
                    created_at?: string;
                };
            };
            offer_products: {
                Row: {
                    id: string;
                    offer_id: string;
                    product_id: string | null;
                    category: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    offer_id: string;
                    product_id?: string | null;
                    category?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    offer_id?: string;
                    product_id?: string | null;
                    category?: string | null;
                    created_at?: string;
                };
            };
            payment_transactions: {
                Row: {
                    id: string;
                    order_id: string;
                    payment_gateway: string;
                    gateway_order_id: string | null;
                    gateway_payment_id: string | null;
                    amount: number;
                    currency: string;
                    status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
                    method: string | null;
                    bank: string | null;
                    wallet: string | null;
                    vpa: string | null;
                    card_last4: string | null;
                    card_network: string | null;
                    error_code: string | null;
                    error_description: string | null;
                    raw_response: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    payment_gateway?: string;
                    gateway_order_id?: string | null;
                    gateway_payment_id?: string | null;
                    amount: number;
                    currency?: string;
                    status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
                    method?: string | null;
                    bank?: string | null;
                    wallet?: string | null;
                    vpa?: string | null;
                    card_last4?: string | null;
                    card_network?: string | null;
                    error_code?: string | null;
                    error_description?: string | null;
                    raw_response?: Record<string, unknown> | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    payment_gateway?: string;
                    gateway_order_id?: string | null;
                    gateway_payment_id?: string | null;
                    amount?: number;
                    currency?: string;
                    status?: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
                    method?: string | null;
                    bank?: string | null;
                    wallet?: string | null;
                    vpa?: string | null;
                    card_last4?: string | null;
                    card_network?: string | null;
                    error_code?: string | null;
                    error_description?: string | null;
                    raw_response?: Record<string, unknown> | null;
                    created_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}
