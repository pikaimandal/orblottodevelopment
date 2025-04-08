"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Ticket, Trophy, LogOut, Loader2 } from "lucide-react"
import { getUserTickets, getUserWinnings } from "@/lib/data"
import { useWalletStore } from "@/lib/store"

export default function ProfilePage() {
  const { isConnected, isConnecting, walletAddress, username, totalTickets, totalWon, connectWallet, disconnectWallet } =
    useWalletStore()

  const userTickets = getUserTickets(username || "")
  const userWinnings = getUserWinnings(username || "")

  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your WorldWallet to view your profile</CardDescription>
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
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{username ? `@${username}` : 'WorldApp User'}</CardTitle>
                  <CardDescription>Wallet: {walletAddress}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-md text-center">
                  <div className="text-muted-foreground text-sm">Total Tickets</div>
                  <div className="text-2xl font-bold">{totalTickets}</div>
                </div>
                <div className="bg-muted p-3 rounded-md text-center">
                  <div className="text-muted-foreground text-sm">Total Won</div>
                  <div className="text-2xl font-bold text-amber-500">${totalWon}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tickets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="winnings">My Winnings</TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="mt-4">
              <div className="space-y-3">
                {userTickets.length > 0 ? (
                  userTickets.map((ticket, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-mono">{ticket.ticketNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(ticket.purchaseDate).toLocaleDateString()} - ${ticket.amount}
                            </div>
                          </div>
                          <div>
                            <Ticket className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      You haven't purchased any tickets yet.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            <TabsContent value="winnings" className="mt-4">
              <div className="space-y-3">
                {userWinnings.length > 0 ? (
                  userWinnings.map((winning, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-mono">{winning.ticketNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(winning.drawDate).toLocaleDateString()} - Tier {winning.tier}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Trophy
                              className={`h-5 w-5 mr-2 ${
                                winning.tier === 1
                                  ? "text-amber-500"
                                  : winning.tier === 2
                                    ? "text-gray-400"
                                    : "text-amber-800"
                              }`}
                            />
                            <span className="font-medium">${winning.amount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      You haven't won any prizes yet. Keep trying!
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
