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
            return data.filter(offer =>
                (!offer.starts_at || new Date(offer.starts_at) <= now) &&
                (!offer.ends_at || new Date(offer.ends_at) >= now)
            ) as Tables<'offers'>[];
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

            return data as Tables<'offers'>[];
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
                throw error;
            }

            // Check dates
            const now = new Date();
            if (data.starts_at && new Date(data.starts_at) > now) return null;
            if (data.ends_at && new Date(data.ends_at) < now) return null;

            // Check usage limits
            if (data.usage_limit && (data.used_count || 0) >= data.usage_limit) return null;

            return data as Tables<'offers'>;
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
            const { data, error } = await supabase
                .from('offers')
                .insert(offer as any)
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
        mutationFn: async ({ id, ...updates }: UpdateTables<'offers'> & { id: string }) => {
            const { data, error } = await supabase
                .from('offers')
                .update(updates as any)
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
