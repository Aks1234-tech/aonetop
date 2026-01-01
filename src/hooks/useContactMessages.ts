import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];

/**
 * Hook to fetch all contact messages (admin only)
 * Sorted by created_at DESC (newest first)
 */
export function useAdminContactMessages() {
    return useQuery({
        queryKey: ['admin', 'contact-messages'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[Contact Messages] Fetch error:', error);
                throw error;
            }

            return data as ContactMessage[];
        },
    });
}

/**
 * Hook to mark a contact message as read
 */
export function useMarkContactMessageAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, isRead }: { messageId: string; isRead: boolean }) => {
            const { error } = await (supabase
                .from('contact_messages') as any)
                .update({ is_read: isRead })
                .eq('id', messageId);

            if (error) {
                console.error('[Contact Messages] Update error:', error);
                throw error;
            }

            return { success: true };
        },
        onSuccess: () => {
            // Invalidate query to refetch messages
            queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] });
        },
    });
}

/**
 * Hook to delete a contact message
 */
export function useDeleteContactMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (messageId: string) => {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                console.error('[Contact Messages] Delete error:', error);
                throw error;
            }

            return { success: true };
        },
        onSuccess: () => {
            // Invalidate query to refetch messages
            queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] });
        },
    });
}
