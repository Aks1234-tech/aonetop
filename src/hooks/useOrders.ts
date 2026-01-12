import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Tables, InsertTables } from '@/lib/supabase';

export type Order = Tables<'orders'> & {
    items?: Tables<'order_items'>[];
};

// Fetch orders for the current user
export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return [];
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items(*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data as Order[];
        },
    });
}

// Fetch a single order by ID
export function useOrder(orderId: string) {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items(*)
        `)
                .eq('id', orderId)
                .single();

            if (error) {
                throw error;
            }

            return data as Order;
        },
        enabled: !!orderId,
    });
}

// Fetch order by order number (for confirmation page)
export function useOrderByNumber(orderNumber: string) {
    return useQuery({
        queryKey: ['order', 'number', orderNumber],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items(*)
        `)
                .eq('order_number', orderNumber)
                .single();

            if (error) {
                throw error;
            }

            return data as Order;
        },
        enabled: !!orderNumber,
    });
}

export interface CreateOrderInput {
    items: {
        productId: string;
        productName: string;
        productImage?: string;
        quantity: number;
        price: number; // in paise
        weightVariantId?: string;
        weightValue?: string; // The weight string like "100g", "250g"
    }[];
    shippingInfo: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    paymentMethod: string;
    paymentGateway?: 'cod' | 'razorpay'; // Payment gateway type
    notes?: string;
    offerId?: string;
    discountAmount?: number;
    shippingCost?: number;
}

// Create a new order
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateOrderInput) => {
            const { data: { user } } = await supabase.auth.getUser();

            // Calculate totals
            const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shippingCost = input.shippingCost ?? (subtotal >= 99900 ? 0 : 9900); // Free shipping over ₹999
            const discount = input.discountAmount || 0;
            const total = subtotal + shippingCost - discount;

            // Create order
            const orderData: InsertTables<'orders'> = {
                user_id: user?.id || null,
                subtotal,
                shipping_cost: shippingCost,
                total,
                payment_method: input.paymentMethod,
                payment_gateway: input.paymentGateway || 'cod',
                payment_status: input.paymentGateway === 'razorpay' ? 'initiated' : 'pending',
                shipping_name: input.shippingInfo.name,
                shipping_email: input.shippingInfo.email,
                shipping_phone: input.shippingInfo.phone,
                shipping_address: input.shippingInfo.address,
                shipping_city: input.shippingInfo.city,
                shipping_state: input.shippingInfo.state,
                shipping_pincode: input.shippingInfo.pincode,
                notes: input.notes || null,
                offer_id: input.offerId || null,
                discount_amount: discount,
            };

            const { data: orderResult, error: orderError } = await supabase
                .from('orders')
                .insert(orderData as any)
                .select('*')
                .single();

            const order = orderResult as Tables<'orders'> | null;

            if (orderError) {
                throw orderError;
            }

            if (!order) {
                throw new Error('Order creation failed');
            }

            // Create order items
            const orderItems = input.items.map((item) => ({
                order_id: order.id,
                product_id: item.productId,
                product_name: item.productName,
                product_image: item.productImage || null,
                quantity: item.quantity,
                price: item.price,
                weight_variant_id: item.weightVariantId || null,
                weight_value: item.weightValue || null,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems as any);

            if (itemsError) {
                throw itemsError;
            }

            return order as Tables<'orders'>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}

// For admin: fetch all orders
export function useAdminOrders() {
    return useQuery({
        queryKey: ['admin', 'orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items(*)
        `)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data as Order[];
        },
    });
}

// For admin: update order status
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const { data, error } = await (supabase
                .from('orders') as any)
                .update({ status })
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        },
    });
}

// ============================================
// PAYMENT INTEGRATION HOOKS
// ============================================

export interface CreateRazorpayOrderInput {
    orderId: string;
    amount: number; // in paise
}

export interface CreateRazorpayOrderResponse {
    id: string;
    amount: number;
    currency: string;
}

// Create Razorpay order (calls Edge Function)
export function useCreateRazorpayOrder() {
    return useMutation({
        mutationFn: async ({ orderId, amount }: CreateRazorpayOrderInput): Promise<CreateRazorpayOrderResponse> => {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(
                `${supabaseUrl}/functions/v1/create-razorpay-order`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                    },
                    body: JSON.stringify({ orderId, amount }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create payment order');
            }

            return response.json();
        },
    });
}

export interface VerifyPaymentInput {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// Verify payment (calls Edge Function)
export function useVerifyPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: VerifyPaymentInput) => {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(
                `${supabaseUrl}/functions/v1/verify-payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Payment verification failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}

// Update payment status (for failed/cancelled payments)
export function useUpdatePaymentStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            orderId,
            paymentStatus,
            errorMessage,
        }: {
            orderId: string;
            paymentStatus: string;
            errorMessage?: string;
        }) => {
            const updateData: Record<string, unknown> = {
                payment_status: paymentStatus,
            };

            // Append error to notes if payment failed
            if (errorMessage && paymentStatus === 'failed') {
                const { data: order } = await supabase
                    .from('orders')
                    .select('notes')
                    .eq('id', orderId)
                    .single();

                const existingNotes = (order as { notes: string | null } | null)?.notes;
                updateData.notes = existingNotes
                    ? `${existingNotes}\n\nPayment Error: ${errorMessage}`
                    : `Payment Error: ${errorMessage}`;
            }

            const { error } = await (supabase
                .from('orders') as any)
                .update(updateData)
                .eq('id', orderId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        },
    });
}
