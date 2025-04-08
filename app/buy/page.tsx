"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wallet, Ticket, AlertCircle, LogOut, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateTicketNumber } from "@/lib/utils"
import { useWalletStore } from "@/lib/store"

export default function BuyPage() {
  const { isConnected, isConnecting, walletAddress, username, connectWallet, disconnectWallet } = useWalletStore()
  const [ticketCount, setTicketCount] = useState(1)
  const [selectedAmount, setSelectedAmount] = useState(1)
  const [generatedTickets, setGeneratedTickets] = useState<string[]>([])

  const getLottoTitle = (amount: number) => {
    switch (amount) {
      case 500:
        return "ORB Lotto Jackpot"
      case 100:
        return "ORB Lotto Mega"
      case 10:
        return "ORB Lotto Super"
      case 5:
        return "ORB Lotto Plus"
      default:
        return "ORB Lotto Basic"
    }
  }

  const handleBuyTickets = () => {
    // Generate random ticket numbers
    const tickets = Array.from({ length: ticketCount }, () => generateTicketNumber())
    setGeneratedTickets(tickets)
  }

  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Buy Tickets</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your WorldWallet to buy ORB Lotto tickets</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={connectWallet} 
              className="gap-2"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Connect WorldWallet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert className="mb-6">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div className="ml-2">
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription>
                    <div>Wallet: {walletAddress}</div>
                    {username && <div>Username: {username}</div>}
                  </AlertDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectWallet} className="gap-2">
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </Alert>

          <Tabs defaultValue="1" onValueChange={(value) => setSelectedAmount(Number(value))}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="1">$1</TabsTrigger>
              <TabsTrigger value="5">$5</TabsTrigger>
              <TabsTrigger value="10">$10</TabsTrigger>
              <TabsTrigger value="100">$100</TabsTrigger>
              <TabsTrigger value="500">$500</TabsTrigger>
            </TabsList>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{getLottoTitle(selectedAmount)}</span>
                  <Badge variant="outline">${selectedAmount}</Badge>
                </CardTitle>
                <CardDescription>
                  Next draw: {new Date(Date.now() + 86400000).toLocaleDateString()} at 8:00 PM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketCount">Number of tickets (max 50)</Label>
                    <Input
                      id="ticketCount"
                      type="number"
                      min={1}
                      max={50}
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.min(50, Math.max(1, Number.parseInt(e.target.value) || 1)))}
                    />
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Price per ticket:</span>
                      <span>${selectedAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Number of tickets:</span>
                      <span>{ticketCount}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${selectedAmount * ticketCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleBuyTickets} className="w-full gap-2">
                  <Ticket className="h-4 w-4" />
                  Buy Tickets
                </Button>
              </CardFooter>
            </Card>
          </Tabs>

          {generatedTickets.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Your Tickets</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {generatedTickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="font-mono">{ticket}</div>
                        <Badge variant="outline">${selectedAmount}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
