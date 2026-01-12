import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Tables, InsertTables, UpdateTables } from '@/lib/supabase';

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

    return useQuery<Product[]>({
        queryKey: ['products', JSON.stringify(filters), sortBy, limit],
        queryFn: async () => {
            console.log('[useProducts] Query starting with filters:', filters, 'sortBy:', sortBy);
            try {
                let query = supabase
                    .from('products')
                    .select(`
          *,
          images:product_images(*)
        `);

                console.log('[useProducts] Query builder created');

                // Apply filters
                if (filters.category) {
                    // Handle parent category filtering - if it's "tea", include all tea-related products
                    if (filters.category === 'tea') {
                        // Match all tea-related categories (old and new naming conventions)
                        const teaCategories = [
                            'tea', 'Tea',
                            'tea-domestic', 'tea domestic', 'Domestic Tea',
                            'tea-masala', 'tea masala', 'Masala Tea',
                            'black-tea', 'black tea', 'Black Tea',
                            'green-tea', 'green tea', 'Green Tea',
                            'white-tea', 'white tea', 'White Tea',
                            'oolong-tea', 'oolong tea', 'Oolong Tea',
                            'herbal-tea', 'herbal tea', 'Herbal Tea',
                            'chai-blends', 'chai blends', 'Chai Blends',
                            'specialty-tea', 'specialty tea', 'Specialty Tea',
                            'flavored-tea', 'flavored tea', 'Flavored Tea',
                        ];
                        query = query.in('category', teaCategories);
                    } else if (filters.category === 'honey') {
                        query = query.in('category', ['honey', 'Honey']);
                    } else if (filters.category === 'ghee') {
                        query = query.in('category', ['ghee', 'Ghee']);
                    } else {
                        // For subcategories or other categories
                        const cat = filters.category;
                        query = query.in('category', [
                            cat,
                            cat.replace(/-/g, ' '),
                            cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        ]);
                    }
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

                console.log('[useProducts] Filters applied');

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

                console.log('[useProducts] Sorting applied');

                if (limit) {
                    query = query.limit(limit);
                }

                console.log('[useProducts] About to execute query...');
                const { data, error } = await query;
                console.log('[useProducts] Query executed');

                if (error) {
                    console.error('[useProducts] Query error:', error);
                    throw error;
                }
                console.log('[useProducts] Query success, returned', (data as Product[])?.length || 0, 'products');
                return data as Product[];
            } catch (err) {
                console.error('[useProducts] Catch block:', err);
                throw err;
            }
        },
        retry: false,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// Fetch a single product by slug or id
export function useProduct(identifier: string) {
    return useQuery<Product>({
        queryKey: ['product', identifier],
        queryFn: async () => {
            console.log('[useProduct] Query starting for:', identifier);
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
                console.error('[useProduct] Query error for', identifier, error);
                throw error;
            }

            console.log('[useProduct] Query success for', identifier);
            return data as Product;
        },
        enabled: !!identifier,
        retry: false,
        refetchOnWindowFocus: false,
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


// ============== ADMIN CRUD OPERATIONS ==============

// Fetch all products for admin (no limit, includes all data)
export function useAdminProducts() {
    return useQuery<Product[]>({
        queryKey: ['admin-products'],
        queryFn: async () => {
            console.log('[useAdminProducts] Fetching all products for admin');
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    images:product_images(*)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[useAdminProducts] Query error:', error);
                throw error;
            }
            console.log('[useAdminProducts] Fetched', data?.length || 0, 'products');
            return data as Product[];
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
}

// Helper to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Create a new product
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product: Omit<InsertTables<'products'>, 'slug'> & { slug?: string }) => {
            console.log('[useCreateProduct] Creating product:', product.name);

            // Auto-generate slug if not provided
            const slug = product.slug || generateSlug(product.name);

            const { data, error } = await (supabase
                .from('products') as any)
                .insert({ ...product, slug })
                .select()
                .single();

            if (error) {
                console.error('[useCreateProduct] Error:', error);
                throw error;
            }
            console.log('[useCreateProduct] Created product:', data);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Update an existing product
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: UpdateTables<'products'> }) => {
            console.log('[useUpdateProduct] Updating product:', id);

            const { data, error } = await (supabase
                .from('products') as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[useUpdateProduct] Error:', error);
                throw error;
            }
            console.log('[useUpdateProduct] Updated product:', data);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
        },
    });
}

// Delete a product
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log('[useDeleteProduct] Deleting product:', id);

            // First, fetch all images for this product
            const { data: productImages, error: fetchError } = await supabase
                .from('product_images')
                .select('id, url')
                .eq('product_id', id) as { data: { id: string; url: string }[] | null; error: any };

            if (fetchError) {
                console.error('[useDeleteProduct] Error fetching images:', fetchError);
                // Continue with deletion even if we can't fetch images
            }

            // Delete images from storage
            if (productImages && productImages.length > 0) {
                console.log(`[useDeleteProduct] Found ${productImages.length} images to delete from storage`);

                for (const image of productImages) {
                    try {
                        // Extract file path from URL
                        const urlObj = new URL(image.url);
                        const pathMatch = urlObj.pathname.match(/\/product-images\/(.+)$/);
                        if (pathMatch) {
                            const filePath = pathMatch[1];
                            const { error: storageError } = await supabase.storage
                                .from('product-images')
                                .remove([filePath]);

                            if (storageError) {
                                console.warn('[useDeleteProduct] Failed to delete from storage:', filePath, storageError);
                            } else {
                                console.log('[useDeleteProduct] Deleted from storage:', filePath);
                            }
                        }
                    } catch (err) {
                        console.warn('[useDeleteProduct] Could not parse image URL:', image.url, err);
                    }
                }
            } else {
                console.log('[useDeleteProduct] No images to delete from storage');
            }

            // Now delete the product (cascade will delete product_images records)
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[useDeleteProduct] Error:', error);
                throw error;
            }
            console.log('[useDeleteProduct] Deleted product:', id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// ============== PRODUCT IMAGES ==============

// Upload image to Supabase Storage and create product_images record
export function useUploadProductImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            productId,
            file,
            category,
            isPrimary = false
        }: {
            productId: string;
            file: File;
            category: string;
            isPrimary?: boolean;
        }) => {
            console.log('[useUploadProductImage] Uploading image for product:', productId, 'category:', category);

            // Determine category folder based on product category
            const categoryFolder = category.toLowerCase().includes('honey')
                ? 'honey-products'
                : 'tea-products';

            console.log('[useUploadProductImage] Routing to folder:', categoryFolder);

            // Generate unique filename with category folder
            const fileExt = file.name.split('.').pop();
            const fileName = `${categoryFolder}/${productId}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                console.error('[useUploadProductImage] Storage upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            console.log('[useUploadProductImage] Image uploaded, URL:', publicUrl);

            // If this is primary, unset other primary images first
            if (isPrimary) {
                await (supabase.from('product_images') as any)
                    .update({ is_primary: false })
                    .eq('product_id', productId);
            }

            // Get current max sort_order
            const { data: existingImages } = await supabase
                .from('product_images')
                .select('sort_order')
                .eq('product_id', productId)
                .order('sort_order', { ascending: false })
                .limit(1);

            const nextSortOrder = existingImages && existingImages.length > 0
                ? ((existingImages as any)[0].sort_order + 1)
                : 0;

            // Create product_images record
            const { data, error } = await (supabase.from('product_images') as any)
                .insert({
                    product_id: productId,
                    url: publicUrl,
                    is_primary: isPrimary,
                    sort_order: nextSortOrder,
                })
                .select()
                .single();

            if (error) {
                console.error('[useUploadProductImage] Insert error:', error);
                throw error;
            }

            console.log('[useUploadProductImage] Image record created:', data);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
        },
    });
}

// Delete a product image
export function useDeleteProductImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, url }: { id: string; url: string }) => {
            console.log('[useDeleteProductImage] Deleting image:', id);

            // Extract file path from URL for storage deletion
            try {
                const urlObj = new URL(url);
                const pathMatch = urlObj.pathname.match(/\/product-images\/(.+)$/);
                if (pathMatch) {
                    const filePath = pathMatch[1];
                    await supabase.storage.from('product-images').remove([filePath]);
                    console.log('[useDeleteProductImage] Removed from storage:', filePath);
                }
            } catch (err) {
                console.warn('[useDeleteProductImage] Could not delete from storage:', err);
            }

            // Delete the database record
            const { error } = await supabase
                .from('product_images')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[useDeleteProductImage] Delete error:', error);
                throw error;
            }
            console.log('[useDeleteProductImage] Deleted image record:', id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
        },
    });
}
