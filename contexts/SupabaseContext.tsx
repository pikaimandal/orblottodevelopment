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
      
      // First, try to check if user exists with this wallet address in our users table
      // regardless of auth status
      try {
        const { data: existingUsers } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress.toLowerCase());
          
        if (existingUsers && existingUsers.length > 0) {
          console.log('Found existing user by wallet address:', existingUsers[0]);
          setUser(existingUsers[0]);
          return;
        }
      } catch (error) {
        console.error('Error checking for existing user:', error);
        // Continue with creation even if this check fails
      }
      
      // If we couldn't find the user, create a new one with a direct DB insert
      try {
        // Generate a UUID for the user
        const userId = crypto.randomUUID ? crypto.randomUUID() : 
          'user_' + Math.random().toString(36).substring(2, 15);
        
        // Create the user with a direct insert
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: userId,
              wallet_address: walletAddress.toLowerCase(),
              username: username || 'worldapp_user',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating user:', insertError);
          throw insertError;
        }
        
        if (newUser) {
          console.log('Created new user:', newUser);
          setUser(newUser);
        }
      } catch (insertError) {
        console.error('Error creating new user:', insertError);
        throw insertError;
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