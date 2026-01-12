import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Tables, InsertTables } from '@/lib/supabase';

export type WeightVariant = Tables<'product_weight_variants'>;

// Fetch weight variants for a specific product
export function useWeightVariants(productId: string | undefined) {
    return useQuery<WeightVariant[]>({
        queryKey: ['weight-variants', productId],
        queryFn: async () => {
            if (!productId) return [];

            const { data, error } = await supabase
                .from('product_weight_variants')
                .select('*')
                .eq('product_id', productId)
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('[useWeightVariants] Error:', error);
                throw error;
            }

            return data as WeightVariant[];
        },
        enabled: !!productId,
    });
}

// Fetch weight variants for multiple products (for shop page)
export function useProductsWeightVariants(productIds: string[]) {
    return useQuery<Record<string, WeightVariant[]>>({
        queryKey: ['weight-variants', 'bulk', productIds],
        queryFn: async () => {
            if (productIds.length === 0) return {};

            const { data, error } = await supabase
                .from('product_weight_variants')
                .select('*')
                .in('product_id', productIds)
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('[useProductsWeightVariants] Error:', error);
                throw error;
            }

            // Group variants by product_id
            const grouped: Record<string, WeightVariant[]> = {};
            for (const variant of (data as WeightVariant[])) {
                if (!grouped[variant.product_id]) {
                    grouped[variant.product_id] = [];
                }
                grouped[variant.product_id].push(variant);
            }

            return grouped;
        },
        enabled: productIds.length > 0,
    });
}

// Create a new weight variant
export function useCreateWeightVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variant: InsertTables<'product_weight_variants'>) => {
            const { data, error } = await supabase
                .from('product_weight_variants')
                .insert(variant as any)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data as WeightVariant;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['weight-variants', data.product_id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}

// Update an existing weight variant
export function useUpdateWeightVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertTables<'product_weight_variants'>> }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase
                .from('product_weight_variants') as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data as WeightVariant;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['weight-variants', data.product_id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}

// Delete a weight variant
export function useDeleteWeightVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
            const { error } = await supabase
                .from('product_weight_variants')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            return { id, productId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['weight-variants', data.productId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}

// Helper function to get the minimum price from variants
export function getMinVariantPrice(variants: WeightVariant[]): number | null {
    if (!variants || variants.length === 0) return null;
    
    const inStockVariants = variants.filter(v => v.in_stock);
    if (inStockVariants.length === 0) {
        // If all out of stock, return minimum anyway
        return Math.min(...variants.map(v => v.price));
    }
    
    return Math.min(...inStockVariants.map(v => v.price));
}

// Helper function to check if product has variants
export function hasWeightVariants(variants: WeightVariant[] | undefined): boolean {
    return !!variants && variants.length > 0;
}
