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
      
      // First, check if user exists with this wallet address in our users table
      try {
        // Check if user exists first with a direct query
        const { data: existingUsers, error: selectError } = await supabase
          .from('users')
          .select('*')
          .ilike('wallet_address', walletAddress)
          .limit(1);
        
        if (selectError) {
          console.error('Error checking for existing user:', selectError);
        }
          
        if (existingUsers && existingUsers.length > 0) {
          console.log('Found existing user by wallet address:', existingUsers[0]);
          setUser(existingUsers[0]);
          return;
        }
        
        // If user doesn't exist, we need to create an auth user first
        console.log('User not found, creating new auth user first');
        
        // Create an auth user - using a random email since we identify by wallet address
        const email = `${walletAddress.toLowerCase()}_${Date.now()}@example.com`;
        const password = `Password123!${Math.random().toString(36).substring(2)}`;
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              wallet_address: walletAddress.toLowerCase(),
              username: username || 'worldapp_user'
            }
          }
        });
        
        if (authError) {
          console.error('Error creating auth user:', authError);
          throw authError;
        }
        
        if (!authData.user) {
          console.error('No user returned from auth signup');
          throw new Error('Failed to create auth user');
        }
        
        console.log('Auth user created with ID:', authData.user.id);
        
        // Now create the user in our users table
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: authData.user.id,
              wallet_address: walletAddress.toLowerCase(),
              username: username || 'worldapp_user'
            }
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating user in users table:', insertError);
          throw insertError;
        }
        
        console.log('User created successfully:', newUser);
        setUser(newUser);
      } catch (error) {
        console.error('Error in user management:', error);
        
        // Create a temporary client-side user
        const tempUser = {
          id: 'temp_' + Math.random().toString(36).substring(2, 15),
          wallet_address: walletAddress.toLowerCase(),
          username: username || 'worldapp_user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(tempUser as User);
        console.log('Using fallback user object due to database error:', tempUser);
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