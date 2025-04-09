'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';
import { upsertUser } from '@/utils/supabase-utils';

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (walletAddress: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (walletAddress: string, username?: string) => {
    try {
      setLoading(true);
      console.log('Signing in with wallet address:', walletAddress);
      
      // Generate a JWT token for this wallet address
      // In production, this should be signed properly
      const jwt = btoa(JSON.stringify({
        sub: walletAddress,
        wallet_address: walletAddress,
        username: username || 'worldapp_user'
      }));
      
      // Sign in with the JWT
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${walletAddress.toLowerCase()}@example.com`,
        password: 'password123' // This is just a placeholder; in production you'd use proper auth
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        // If sign-in fails, try to sign up instead
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${walletAddress.toLowerCase()}@example.com`,
          password: 'password123',
          options: {
            data: {
              wallet_address: walletAddress,
              username: username || 'worldapp_user'
            }
          }
        });
        
        if (signUpError) {
          console.error('Supabase sign-up error:', signUpError);
          throw signUpError;
        }
        
        // If we've signed up successfully, store the session
        if (signUpData?.session) {
          setSession(signUpData.session);
        }
        
        // If we have a user, make sure they exist in our users table
        if (signUpData?.user) {
          // Directly create the user in our table, regardless of auth hook
          const userData = await upsertUser({
            id: signUpData.user.id,
            wallet_address: walletAddress,
            username: username || 'worldapp_user'
          });
          
          if (userData) {
            setUser(userData);
          }
        }
      } else {
        // Sign-in succeeded, update user metadata
        if (data?.user) {
          await supabase.auth.updateUser({
            data: {
              wallet_address: walletAddress,
              username: username || 'worldapp_user'
            }
          });
          
          // Directly create/update the user in our table, regardless of auth hook
          const userData = await upsertUser({
            id: data.user.id,
            wallet_address: walletAddress,
            username: username || 'worldapp_user'
          });
          
          if (userData) {
            setUser(userData);
          } else if (data.session) {
            // If we couldn't upsert directly, at least try to fetch the user
            await fetchUser(data.user.id);
          }
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUser(session.user.id);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signOut,
    refreshUser
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
} 