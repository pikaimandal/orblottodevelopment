import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
    
    // Create a Supabase client with the service role key
    // This bypasses RLS policies and allows direct database manipulation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('wallet_address', wallet_address)
      .limit(1);
      
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'User already exists', user: existingUsers[0] },
        { status: 200 }
      );
    }
    
    // Create direct database entry for user with a generated UUID
    const userId = uuidv4();
    
    // For admin operations, you'd typically need to:
    // 1. Create an auth user first (if your schema requires it)
    // 2. Then create the user in your public schema
    
    // Optional: Create auth user first (if needed)
    /*
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `${wallet_address.toLowerCase()}_${Date.now()}@example.com`,
      password: `Password!${Math.random().toString(36).substring(2, 10)}`,
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
    
    const authUserId = authUser.user.id;
    */
    
    // For now, we'll insert directly and use our generated UUID
    // This might not work if there are foreign key constraints
    // If it fails, you'll need to use the commented out code above
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        { 
          id: userId,
          wallet_address: wallet_address.toLowerCase(),
          username: username || 'worldapp_user'
        }
      ])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating user in database:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user', details: insertError },
        { status: 500 }
      );
    }
    
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