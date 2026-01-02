import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Tables, InsertTables, UpdateTables } from '@/lib/supabase';

// Fetch all categories
export function useCategories() {
    return useQuery<Tables<'categories'>[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            console.log('[useCategories] Query starting');
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('[useCategories] Query error:', error);
                throw error;
            }

            console.log('[useCategories] Query success, returned', (data as Tables<'categories'>[])?.length || 0, 'categories');
            return data as Tables<'categories'>[];
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
}

// Helper to generate category ID from name
function generateCategoryId(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Create new category
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (category: Omit<InsertTables<'categories'>, 'id'> & { id?: string }) => {
            // Generate ID if not provided
            const id = category.id || generateCategoryId(category.name);

            const { data, error } = await (supabase
                .from('categories') as any)
                .insert({
                    ...category,
                    id,
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

// Update category
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: UpdateTables<'categories'> }) => {
            const { data, error } = await (supabase
                .from('categories') as any)
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
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

// Delete category
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
