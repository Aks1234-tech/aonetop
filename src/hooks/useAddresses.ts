
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type Address = Database['public']['Tables']['addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
export type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

export const useAddresses = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: addresses = [], isLoading } = useQuery({
        queryKey: ['addresses', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const addAddress = useMutation({
        mutationFn: async (address: Omit<AddressInsert, 'user_id'>) => {
            if (!user) throw new Error('User not authenticated');

            // If setting as default, unset other defaults of same type first
            if (address.is_default) {
                await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('user_id', user.id)
                    .eq('type', address.type);
            }

            const { data, error } = await supabase
                .from('addresses')
                .insert([{ ...address, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
            toast({
                title: 'Address added',
                description: 'Your new address has been saved successfully.',
            });
        },
        onError: (error) => {
            console.error('Error adding address:', error);
            toast({
                title: 'Error',
                description: 'Failed to add address. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const updateAddress = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: AddressUpdate }) => {
            if (!user) throw new Error('User not authenticated');

            // If setting as default, unset other defaults of same type first
            if (updates.is_default) {
                let type = updates.type;

                // If type is not in updates, fetch it from existing record
                if (!type) {
                    const { data: currentAddr } = await supabase
                        .from('addresses')
                        .select('type')
                        .eq('id', id)
                        .single();

                    if (currentAddr) {
                        type = currentAddr.type;
                    }
                }

                if (type) {
                    await supabase
                        .from('addresses')
                        .update({ is_default: false })
                        .eq('user_id', user.id)
                        .eq('type', type);
                }
            }




            const { data, error } = await supabase
                .from('addresses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
            toast({
                title: 'Address updated',
                description: 'Your address has been updated successfully.',
            });
        },
        onError: (error) => {
            console.error('Error updating address:', error);
            toast({
                title: 'Error',
                description: 'Failed to update address. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const deleteAddress = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
            toast({
                title: 'Address deleted',
                description: 'Address has been removed successfully.',
            });
        },
        onError: (error) => {
            console.error('Error deleting address:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete address. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const setDefaultAddress = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: 'billing' | 'shipping' }) => {
            if (!user) throw new Error('User not authenticated');

            // Unset current default
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .eq('type', type);

            // Set new default
            const { data, error } = await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
            toast({
                title: 'Default address updated',
                description: 'Your default address has been updated.',
            });
        },
        onError: (error) => {
            console.error('Error setting default address:', error);
            toast({
                title: 'Error',
                description: 'Failed to update default address.',
                variant: 'destructive',
            });
        },
    });

    return {
        addresses,
        isLoading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    };
};
