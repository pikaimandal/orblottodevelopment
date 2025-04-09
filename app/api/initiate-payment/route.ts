import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// This address has been whitelisted to receive payments
const RECIPIENT_ADDRESS = '0xe0C663edaC17EF5dB4DfB5de063A014f856D0042'

export async function POST(req: NextRequest) {
  try {
    const { ticketCount, amount, currency } = await req.json()
    
    if (!ticketCount || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    // Generate a unique payment ID
    const paymentId = crypto.randomUUID().replace(/-/g, '')
    
    // Calculate the total amount in smallest unit (Wei for WLD, Cents for USDC)
    // Currency can be 'WLD' or 'USDC'
    const totalAmount = ticketCount * amount
    
    // In a real implementation, you would store this payment record in a database
    // For now, we'll just return the payment information
    
    return NextResponse.json({
      success: true,
      paymentId,
      recipientAddress: RECIPIENT_ADDRESS,
      amount: totalAmount,
      currency,
      ticketCount,
      ticketPrice: amount
    })
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
} 