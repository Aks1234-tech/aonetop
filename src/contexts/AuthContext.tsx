import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Tables, UpdateTables } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Tables<'profiles'> | null;
    isLoading: boolean;
    isAdmin: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: UpdateTables<'profiles'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = profile?.role === 'admin';

    // Fetch user profile
    const fetchProfile = async (userId: string) => {
        console.log('[Auth] Fetching profile for user:', userId);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[Auth] Error fetching profile:', error);
            return null;
        }
        console.log('[Auth] Profile fetched:', data);
        return data;
    };

    // Initialize auth state
    useEffect(() => {
        console.log('[Auth] Initializing auth state');

        // Set timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            console.warn('[Auth] Auth initialization timeout - setting isLoading to false');
            setIsLoading(false);
        }, 5000);

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[Auth] Got session:', session ? 'Logged in' : 'Not logged in');
            clearTimeout(timeout);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id).then(() => {
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        }).catch((err) => {
            console.error('[Auth] getSession error:', err);
            clearTimeout(timeout);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setProfile(profile);
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        console.log('[Auth] signOut() called - starting sign out process');

        // Clear all React Query cache to prevent stale data on re-login
        console.log('[Auth] Clearing React Query cache...');
        queryClient.clear();

        // Clear React state immediately for instant UI feedback
        console.log('[Auth] Clearing React state...');
        setUser(null);
        setSession(null);
        setProfile(null);

        // Call Supabase signOut with timeout protection
        // This properly clears both server session AND client internal state
        try {
            console.log('[Auth] Calling supabase.auth.signOut()...');
            const signOutPromise = supabase.auth.signOut();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Sign out timed out')), 5000)
            );

            await Promise.race([signOutPromise, timeoutPromise]);
            console.log('[Auth] Supabase signOut completed successfully');
        } catch (err) {
            console.warn('[Auth] Supabase signOut failed or timed out:', err);
            // If signOut fails, manually clear localStorage as fallback
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                console.log('[Auth] Fallback: Removing localStorage key:', key);
                localStorage.removeItem(key);
            });
        }

        console.log('[Auth] Sign out complete');
    };

    const updateProfile = async (updates: UpdateTables<'profiles'>) => {
        if (!user) return;

        const { error } = await (supabase
            .from('profiles') as any)
            .update(updates as any)
            .eq('id', user.id);

        if (error) {
            throw error;
        }

        // Refetch profile
        const newProfile = await fetchProfile(user.id);
        setProfile(newProfile);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                isLoading,
                isAdmin,
                signUp,
                signIn,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
