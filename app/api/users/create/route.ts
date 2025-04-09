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

    // Normalize wallet address - strip out any dev mode text
    const normalizedWalletAddress = wallet_address
      .toLowerCase()
      .replace(/\s*\(dev\s*mode\)\s*/i, '')
      .trim();
    
    // Verify environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      });
      
      // For development, allow a fallback pattern if this is running in dev mode
      if (process.env.NODE_ENV === 'development') {
        const devUserId = generateUUID();
        console.log('DEV MODE: Returning mock user without database connection');
        
        return NextResponse.json({
          message: 'DEV MODE: Mock user created',
          user: {
            id: devUserId,
            wallet_address: normalizedWalletAddress,
            username: username || 'dev_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }, { status: 201 });
      }
      
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
    
    try {
      // Simple test to ensure the client is authenticated with admin privileges
      const { data: testData, error: testError } = await supabaseAdmin.rpc('postgres_version');
      if (testError) {
        console.error('Supabase admin client authentication test failed:', testError);
        
        // For development, allow a fallback pattern
        if (process.env.NODE_ENV === 'development') {
          const devUserId = generateUUID();
          console.log('DEV MODE: Returning mock user after connection error');
          
          return NextResponse.json({
            message: 'DEV MODE: Mock user created after connection error',
            user: {
              id: devUserId,
              wallet_address: normalizedWalletAddress,
              username: username || 'dev_user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }, { status: 201 });
        }
        
        return NextResponse.json(
          { error: 'Supabase admin client failed to authenticate properly', details: testError },
          { status: 500 }
        );
      }
    } catch (connectionError) {
      console.error('Error testing Supabase connection:', connectionError);
      
      // For development, allow a fallback pattern
      if (process.env.NODE_ENV === 'development') {
        const devUserId = generateUUID();
        console.log('DEV MODE: Returning mock user after connection exception');
        
        return NextResponse.json({
          message: 'DEV MODE: Mock user created after connection exception',
          user: {
            id: devUserId,
            wallet_address: normalizedWalletAddress,
            username: username || 'dev_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }, { status: 201 });
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to Supabase', details: connectionError },
        { status: 500 }
      );
    }
    
    console.log('Supabase admin client authenticated successfully');
    
    // Check if user already exists
    console.log('Checking if user already exists with wallet address:', normalizedWalletAddress);
    const { data: existingUsers, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('wallet_address', normalizedWalletAddress)
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
    
    try {
      // Step 1: Create an auth user first (critical for proper referencing)
      const randomEmail = `${normalizedWalletAddress.substring(2, 8)}_${Date.now()}@orbuser.example`;
      const randomPassword = `Password!${Math.random().toString(36).substring(2, 10)}`;
      
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: randomEmail,
        password: randomPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          wallet_address: normalizedWalletAddress,
          username: username || 'worldapp_user'
        }
      });
      
      if (authError) {
        console.error('Error creating auth user:', authError);
        
        // For development, allow a fallback pattern
        if (process.env.NODE_ENV === 'development') {
          // In dev mode, proceed with direct user creation even if auth fails
          const devUserId = generateUUID();
          
          // Step 2: Direct insert if auth user creation failed
          try {
            const { data: directUser, error: directError } = await supabaseAdmin
              .from('users')
              .insert([
                { 
                  id: devUserId, 
                  wallet_address: normalizedWalletAddress,
                  username: username || 'dev_user'
                }
              ])
              .select()
              .single();
              
            if (directError) {
              console.error('Error creating direct user in dev mode:', directError);
              throw directError;
            }
            
            if (directUser) {
              console.log('DEV MODE: Created direct user bypassing auth:', directUser);
              return NextResponse.json({
                message: 'DEV MODE: Direct user created',
                user: directUser
              }, { status: 201 });
            }
          } catch (directInsertError) {
            console.error('Failed direct insert in dev mode:', directInsertError);
          }
          
          // Last resort fallback for dev mode
          console.log('DEV MODE: Returning mock user after auth error');
          return NextResponse.json({
            message: 'DEV MODE: Mock user created after auth error',
            user: {
              id: devUserId,
              wallet_address: normalizedWalletAddress,
              username: username || 'dev_user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }, { status: 201 });
        }
        
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
            wallet_address: normalizedWalletAddress,
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
    } catch (userCreationError) {
      console.error('Unexpected error in user creation process:', userCreationError);
      
      // For development, allow a fallback pattern
      if (process.env.NODE_ENV === 'development') {
        const devUserId = generateUUID();
        console.log('DEV MODE: Returning mock user after user creation exception');
        
        return NextResponse.json({
          message: 'DEV MODE: Mock user created after creation exception',
          user: {
            id: devUserId,
            wallet_address: normalizedWalletAddress,
            username: username || 'dev_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }, { status: 201 });
      }
      
      return NextResponse.json(
        { error: 'Error in user creation process', details: userCreationError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in user creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 