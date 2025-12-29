import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Tables } from '@/lib/supabase';

export type BulkInquiry = Tables<'bulk_inquiries'>;

// Inquiry status options
export const INQUIRY_STATUSES = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
    { value: 'quoted', label: 'Quoted', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-700' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-700' },
];

// Fetch all bulk inquiries for admin
export function useAdminInquiries() {
    return useQuery<BulkInquiry[]>({
        queryKey: ['admin', 'bulk-inquiries'],
        queryFn: async () => {
            console.log('[useAdminInquiries] Fetching all bulk inquiries');
            const { data, error } = await supabase
                .from('bulk_inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[useAdminInquiries] Error:', error);
                throw error;
            }
            console.log('[useAdminInquiries] Fetched', data?.length || 0, 'inquiries');
            return data as BulkInquiry[];
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
}

// Update inquiry status
export function useUpdateInquiryStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ inquiryId, status }: { inquiryId: string; status: string }) => {
            console.log('[useUpdateInquiryStatus] Updating inquiry:', inquiryId, 'to', status);
            const { data, error } = await (supabase
                .from('bulk_inquiries') as any)
                .update({ status })
                .eq('id', inquiryId)
                .select()
                .single();

            if (error) {
                console.error('[useUpdateInquiryStatus] Error:', error);
                throw error;
            }
            console.log('[useUpdateInquiryStatus] Updated:', data);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bulk-inquiries'] });
        },
    });
}

// Delete an inquiry
export function useDeleteInquiry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inquiryId: string) => {
            console.log('[useDeleteInquiry] Deleting inquiry:', inquiryId);
            const { error } = await supabase
                .from('bulk_inquiries')
                .delete()
                .eq('id', inquiryId);

            if (error) {
                console.error('[useDeleteInquiry] Error:', error);
                throw error;
            }
            console.log('[useDeleteInquiry] Deleted:', inquiryId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bulk-inquiries'] });
        },
    });
}
