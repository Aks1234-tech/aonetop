import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Tables, UpdateTables } from '@/lib/supabase';

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
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
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
