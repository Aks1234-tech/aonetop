import { useQuery } from '@tanstack/react-query';
import { supabase, Tables } from '@/lib/supabase';

export type Product = Tables<'products'> & {
    images?: Tables<'product_images'>[];
};

interface ProductFilters {
    category?: string;
    search?: string;
    inStock?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNew?: boolean;
}

interface ProductsQueryOptions {
    filters?: ProductFilters;
    sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'name' | 'rating';
    limit?: number;
}

// Fetch all products with optional filters and sorting
export function useProducts(options: ProductsQueryOptions = {}) {
    const { filters = {}, sortBy = 'featured', limit } = options;

    return useQuery({
        queryKey: ['products', filters, sortBy, limit],
        queryFn: async () => {
            let query = supabase
                .from('products')
                .select(`
          *,
          images:product_images(*)
        `);

            // Apply filters
            if (filters.category) {
                query = query.ilike('category', `%${filters.category.replace(/-/g, ' ')}%`);
            }

            if (filters.search) {
                query = query.or(
                    `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
                );
            }

            if (filters.inStock !== undefined) {
                query = query.eq('in_stock', filters.inStock);
            }

            if (filters.isFeatured) {
                query = query.eq('is_featured', true);
            }

            if (filters.isBestseller) {
                query = query.eq('is_bestseller', true);
            }

            if (filters.isNew) {
                query = query.eq('is_new', true);
            }

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'name':
                    query = query.order('name', { ascending: true });
                    break;
                case 'rating':
                    query = query.order('rating', { ascending: false });
                    break;
                case 'featured':
                default:
                    query = query.order('is_featured', { ascending: false })
                        .order('is_bestseller', { ascending: false });
                    break;
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            return data as Product[];
        },
    });
}

// Fetch a single product by slug or id
export function useProduct(identifier: string) {
    return useQuery({
        queryKey: ['product', identifier],
        queryFn: async () => {
            // Try to fetch by slug first, then by id
            let { data, error } = await supabase
                .from('products')
                .select(`
          *,
          images:product_images(*)
        `)
                .eq('slug', identifier)
                .single();

            // If not found by slug, try by id
            if (error && error.code === 'PGRST116') {
                const result = await supabase
                    .from('products')
                    .select(`
            *,
            images:product_images(*)
          `)
                    .eq('id', identifier)
                    .single();

                data = result.data;
                error = result.error;
            }

            if (error) {
                throw error;
            }

            return data as Product;
        },
        enabled: !!identifier,
    });
}

// Fetch featured products
export function useFeaturedProducts(limit = 6) {
    return useProducts({
        filters: { isFeatured: true },
        limit,
    });
}

// Fetch bestseller products
export function useBestsellers(limit = 6) {
    return useProducts({
        filters: { isBestseller: true },
        limit,
    });
}

// Fetch new products
export function useNewProducts(limit = 6) {
    return useProducts({
        filters: { isNew: true },
        limit,
    });
}

// Fetch all categories
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) {
                throw error;
            }

            return data;
        },
    });
}
