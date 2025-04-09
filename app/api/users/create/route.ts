import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Function to generate UUID without external dependency
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet_address, username } = body;
    
    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Verify environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      });
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }
    
    console.log('Creating Supabase admin client with URL:', supabaseUrl);
    
    // Create a Supabase client with the service role key
    // This bypasses RLS policies and allows direct database manipulation
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Simple test to ensure the client is authenticated with admin privileges
    const { data: testData, error: testError } = await supabaseAdmin.rpc('postgres_version');
    if (testError) {
      console.error('Supabase admin client authentication test failed:', testError);
      return NextResponse.json(
        { error: 'Supabase admin client failed to authenticate properly', details: testError },
        { status: 500 }
      );
    }
    
    console.log('Supabase admin client authenticated successfully');
    
    // Check if user already exists
    console.log('Checking if user already exists with wallet address:', wallet_address);
    const { data: existingUsers, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('wallet_address', wallet_address)
      .limit(1);
    
    if (queryError) {
      console.error('Error querying existing users:', queryError);
      return NextResponse.json(
        { error: 'Database query error', details: queryError },
        { status: 500 }
      );
    }
      
    if (existingUsers && existingUsers.length > 0) {
      console.log('User already exists:', existingUsers[0]);
      return NextResponse.json(
        { message: 'User already exists', user: existingUsers[0] },
        { status: 200 }
      );
    }
    
    console.log('No existing user found, creating new auth user...');
    
    // Step 1: Create an auth user first (critical for proper referencing)
    const randomEmail = `${wallet_address.toLowerCase().substring(2, 8)}_${Date.now()}@orbuser.example`;
    const randomPassword = `Password!${Math.random().toString(36).substring(2, 10)}`;
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: randomEmail,
      password: randomPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        wallet_address: wallet_address.toLowerCase(),
        username: username || 'worldapp_user'
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: 'Failed to create auth user', details: authError },
        { status: 500 }
      );
    }
    
    if (!authUser || !authUser.user) {
      return NextResponse.json(
        { error: 'Failed to create auth user, no user returned' },
        { status: 500 }
      );
    }
    
    const authUserId = authUser.user.id;
    console.log('Created auth user with ID:', authUserId);
    
    // Step 2: Now use the auth user ID to create the profile in the users table
    console.log('Inserting user profile into users table with ID:', authUserId);
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        { 
          id: authUserId, // Use the Supabase Auth ID as the primary key
          wallet_address: wallet_address.toLowerCase(),
          username: username || 'worldapp_user'
        }
      ])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating user in database:', insertError);
      
      // Attempt to clean up the auth user if profile creation failed
      try {
        console.log('Cleaning up auth user after profile creation error...');
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (cleanupError) {
        console.error('Failed to clean up auth user after profile creation error:', cleanupError);
      }
      
      return NextResponse.json(
        { error: 'Failed to create user profile', details: insertError },
        { status: 500 }
      );
    }
    
    if (!newUser) {
      return NextResponse.json(
        { error: 'User was created but no data was returned' },
        { status: 500 }
      );
    }
    
    console.log('Successfully created new user:', newUser);
    
    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in user creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 