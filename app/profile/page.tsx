"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Ticket, Trophy, LogOut, Loader2 } from "lucide-react"
import { formatWalletAddress } from "@/lib/utils"
import { useSupabase } from "@/contexts/SupabaseContext"
import { useWalletStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { getUserTickets, getUserTransactions } from "@/utils/supabase-utils"
import type { Ticket as TicketType, Transaction } from "@/types/supabase"

export default function ProfilePage() {
  const { isConnected, isConnecting, walletAddress, username, connectWallet, disconnectWallet } = useWalletStore()
  const { user, loading, signIn, signOut } = useSupabase()
  
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [winnings, setWinnings] = useState<Transaction[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [totalTickets, setTotalTickets] = useState(0)
  const [totalWon, setTotalWon] = useState(0)

  // Connect wallet function using supabase
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      if (walletAddress) {
        await signIn(walletAddress, username);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Disconnect wallet function
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      await signOut();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Fetch user data when user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      setIsLoadingData(true);
      try {
        // Fetch tickets
        const userTickets = await getUserTickets(user.id);
        setTickets(userTickets);
        setTotalTickets(userTickets.length);
        
        // Fetch transactions that are winnings
        const userTransactions = await getUserTransactions(user.id);
        const winningTransactions = userTransactions.filter(
          transaction => transaction.transaction_type === 'winning' && transaction.status === 'completed'
        );
        setWinnings(winningTransactions);
        
        // Calculate total winnings
        const totalWinningsAmount = winningTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );
        setTotalWon(totalWinningsAmount);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {(!isConnected || !user) ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your WorldWallet to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={handleConnectWallet} 
              className="gap-2"
              disabled={isConnecting || loading}
            >
              {(isConnecting || loading) ? (
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
                  <CardDescription>Wallet: {formatWalletAddress(walletAddress)}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnectWallet} className="gap-2">
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
                  <div className="text-2xl font-bold text-amber-500">${totalWon.toFixed(2)}</div>
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
              {isLoadingData ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-mono">
                                {ticket.ticket_numbers.join(' - ')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(ticket.created_at).toLocaleDateString()} - ${ticket.purchase_price}
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
              )}
            </TabsContent>
            <TabsContent value="winnings" className="mt-4">
              {isLoadingData ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {winnings.length > 0 ? (
                    winnings.map((winning) => (
                      <Card key={winning.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-mono">
                                Transaction ID: {winning.id.substring(0, 8)}...
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(winning.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                              <span className="font-medium">${winning.amount.toFixed(2)}</span>
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
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
