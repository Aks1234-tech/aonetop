import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('[Supabase] Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage, // Use localStorage for persistence across refreshes
    },
});

console.log('[Supabase] Client initialized successfully');

// Test connectivity
Promise.resolve(supabase.from('products').select('count', { count: 'exact', head: true }))
    .then((res) => {
        console.log('[Supabase] Health check: ✓ Connected, response:', res);
    })
    .catch((err) => {
        console.error('[Supabase] Health check failed:', err);
    });


// Helper for typed queries
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];
