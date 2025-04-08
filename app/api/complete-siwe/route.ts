import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = await req.json() as IRequestPayload
  
  // Get the stored nonce from cookies
  const cookieStore = cookies()
  const storedNonce = cookieStore.get('siwe')?.value
  
  if (nonce !== storedNonce) {
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: 'Invalid nonce',
    })
  }
  
  try {
    const validMessage = await verifySiweMessage(payload, nonce)
    
    // Clear the nonce after verification
    cookieStore.delete({
      name: 'siwe',
      path: '/',
    })
    
    return NextResponse.json({
      status: 'success',
      isValid: validMessage.isValid,
      address: payload.address,
    })
  } catch (error: any) {
    // Handle errors in validation or processing
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: error.message,
    })
  }
} 