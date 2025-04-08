import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  // Generate a random nonce
  const nonce = crypto.randomBytes(16).toString('hex')
  
  // Store the nonce in cookies
  const cookieStore = cookies()
  cookieStore.set({
    name: 'siwe',
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  })
  
  return NextResponse.json({ nonce })
} 