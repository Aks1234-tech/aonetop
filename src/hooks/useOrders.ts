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
    notes?: string;
    offerId?: string;
    discountAmount?: number;
}

// Create a new order
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateOrderInput) => {
            const { data: { user } } = await supabase.auth.getUser();

            // Calculate totals
            const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shippingCost = subtotal >= 99900 ? 0 : 4900; // Free shipping over ₹999
            const discount = input.discountAmount || 0;
            const total = subtotal + shippingCost - discount;

            // Create order
            const orderData: InsertTables<'orders'> = {
                user_id: user?.id || null,
                subtotal,
                shipping_cost: shippingCost,
                total,
                payment_method: input.paymentMethod,
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

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            if (orderError) {
                throw orderError;
            }

            // Create order items
            const orderItems = input.items.map((item) => ({
                order_id: order.id,
                product_id: item.productId,
                product_name: item.productName,
                product_image: item.productImage || null,
                quantity: item.quantity,
                price: item.price,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

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
            const { data, error } = await supabase
                .from('orders')
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
