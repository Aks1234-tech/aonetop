import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ContactFormInput {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
}

export function useSubmitContactForm() {
    return useMutation({
        mutationFn: async (input: ContactFormInput) => {
            // Force refresh auth state to ensure we use current session (or anon key if logged out)
            // This prevents stale Authorization headers from causing 401 errors
            await supabase.auth.getSession();

            // Insert without .select() to avoid needing SELECT permission
            // This allows anonymous users to submit without RLS SELECT policy
            const { error } = await supabase
                .from('contact_messages')
                .insert({
                    name: input.name,
                    email: input.email,
                    phone: input.phone || null,
                    subject: input.subject || null,
                    message: input.message,
                } as any);

            if (error) {
                console.error('[Contact Form] Insert error:', error);
                throw error;
            }

            return { success: true };
        },
    });
}

export interface BulkInquiryInput {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    businessType?: string;
    estimatedVolume?: string;
    productsInterested?: string;
    message?: string;
}

export function useSubmitBulkInquiry() {
    return useMutation({
        mutationFn: async (input: BulkInquiryInput) => {
            const { data, error } = await supabase
                .from('bulk_inquiries')
                .insert({
                    company_name: input.companyName,
                    contact_name: input.contactName,
                    email: input.email,
                    phone: input.phone,
                    business_type: input.businessType || null,
                    estimated_volume: input.estimatedVolume || null,
                    products_interested: input.productsInterested || null,
                    message: input.message || null,
                } as any)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
    });
}
