import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Tables, InsertTables, UpdateTables } from '@/lib/supabase';

// Fetch all active offers
export function useOffers() {
    return useQuery({
        queryKey: ['offers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('offers')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Client-side filter for dates since Supabase JS filters are limited for complex ORs
            const now = new Date();
            const rows = (data ?? []) as Tables<'offers'>[];
            return rows.filter((offer) =>
                (!offer.starts_at || new Date(offer.starts_at) <= now) &&
                (!offer.ends_at || new Date(offer.ends_at) >= now)
            );
        },
    });
}

// Fetch all offers for admin (including inactive)
export function useAdminOffers() {
    return useQuery({
        queryKey: ['admin', 'offers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('offers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return (data ?? []) as Tables<'offers'>[];
        },
    });
}

// Fetch single offer by code
export function useOfferByCode(code: string) {
    return useQuery({
        queryKey: ['offer', 'code', code],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('offers')
                .select('*')
                .eq('code', code)
                .eq('is_active', true)
                .single();

            if (error) {
                // Return null when no rows found; throw for other errors
                if ((error as any).code === 'PGRST116' || (error as any).message?.toLowerCase()?.includes('no rows')) {
                    return null;
                }
                throw error;
            }

            if (!data) return null;

            const row = data as Tables<'offers'>;

            // Check dates
            const now = new Date();
            if (row.starts_at && new Date(row.starts_at) > now) return null;
            if (row.ends_at && new Date(row.ends_at) < now) return null;

            // Check usage limits
            if (row.usage_limit && (row.used_count || 0) >= row.usage_limit) return null;

            return row;
        },
        enabled: !!code,
        retry: false,
    });
}

// Create new offer
export function useCreateOffer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (offer: InsertTables<'offers'>) => {
            const { data, error } = await (supabase
                .from('offers') as any)
                .insert(offer)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] });
        },
    });
}

// Update offer
export function useUpdateOffer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: UpdateTables<'offers'> }) => {
            const { data, error } = await (supabase
                .from('offers') as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] });
        },
    });
}

// Delete offer
export function useDeleteOffer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('offers')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] });
        },
    });
}

// Check per-user offer usage
export async function checkPerUserOfferUsage(offerId: string, userId: string, perUserLimit?: number | null): Promise<boolean> {
    if (!perUserLimit) {
        // No per-user limit set
        return true;
    }

    const { data, error } = await supabase
        .from('offer_usage')
        .select('id')
        .eq('offer_id', offerId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error checking offer usage:', error);
        return false;
    }

    const usageCount = (data ?? []).length;
    return usageCount < perUserLimit;
}

// Record offer usage for a user
export async function recordOfferUsage(offerId: string, userId: string, orderId?: string): Promise<void> {
    const { error } = await supabase
        .from('offer_usage')
        .insert({
            offer_id: offerId,
            user_id: userId,
            order_id: orderId || null,
        } as any);

    if (error) {
        console.error('Error recording offer usage:', error);
        throw error;
    }
}

// Check if cart items match offer's product/category restrictions
export interface CartItem {
    id: string;
    category?: string;
}

export async function validateOfferAppliesToCart(
    offerId: string,
    appliesTo: string,
    cartItems: CartItem[]
): Promise<boolean> {
    if (appliesTo === 'all') {
        return true;
    }

    // Fetch the offer's product/category restrictions
    const { data: offerProducts, error } = await supabase
        .from('offer_products')
        .select('product_id, category')
        .eq('offer_id', offerId);

    if (error) {
        console.error('Error fetching offer products:', error);
        return false;
    }

    if (!offerProducts || offerProducts.length === 0) {
        // No restrictions defined - allow all
        return true;
    }

    // Get the list of product IDs and categories from the offer
    const offerProductIds = new Set(
        (offerProducts as any[])
            .filter((op: any) => op.product_id)
            .map((op: any) => op.product_id)
    );

    const offerCategories = new Set(
        (offerProducts as any[])
            .filter((op: any) => op.category)
            .map((op: any) => op.category)
    );

    // Check if at least one cart item matches the offer restrictions
    for (const item of cartItems) {
        if (appliesTo === 'products' && offerProductIds.has(item.id)) {
            return true;
        }
        if (appliesTo === 'category' && item.category && offerCategories.has(item.category)) {
            return true;
        }
    }

    return false;
}

// Get qualifying items from cart for an offer
export async function getOfferQualifyingItems(
    offerId: string,
    appliesTo: string,
    cartItems: CartItem[]
): Promise<CartItem[]> {
    if (appliesTo === 'all') {
        return cartItems;
    }

    const { data: offerProducts, error } = await supabase
        .from('offer_products')
        .select('product_id, category')
        .eq('offer_id', offerId);

    if (error) {
        console.error('Error fetching offer products:', error);
        return cartItems;
    }

    if (!offerProducts || offerProducts.length === 0) {
        return cartItems;
    }

    const offerProductIds = new Set(
        (offerProducts as any[])
            .filter((op: any) => op.product_id)
            .map((op: any) => op.product_id)
    );

    const offerCategories = new Set(
        (offerProducts as any[])
            .filter((op: any) => op.category)
            .map((op: any) => op.category)
    );

    return cartItems.filter((item) => {
        if (appliesTo === 'products') {
            return offerProductIds.has(item.id);
        }
        if (appliesTo === 'category') {
            return item.category && offerCategories.has(item.category);
        }
        return true;
    });
}
