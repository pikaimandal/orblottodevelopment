import { create } from "zustand"
import { MiniKit } from "@worldcoin/minikit-js"

interface WalletState {
  isConnected: boolean
  walletAddress: string
  username: string
  totalTickets: number
  totalWon: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  walletAddress: "",
  username: "",
  totalTickets: 0,
  totalWon: 0,
  connectWallet: async () => {
    try {
      // Check if MiniKit is installed
      if (!MiniKit.isInstalled()) {
        console.error("MiniKit not installed or not running in WorldApp")
        // Fallback for development/testing
        set({
          isConnected: true,
          walletAddress: "0x1a2b...3c4d (Dev Mode)",
          username: "orbuser42",
          totalTickets: 37,
          totalWon: 125,
        })
        return
      }
      
      // Request wallet connection using MiniKit
      const address = await MiniKit.requestWalletAddress()
      
      // Set wallet information
      set({
        isConnected: true,
        walletAddress: address || "Error getting address",
        username: "worldapp_user", // This would come from your backend in production
        totalTickets: 0,
        totalWon: 0,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // Fallback for errors
      set({
        isConnected: true,
        walletAddress: "0x1a2b...3c4d (Error Fallback)",
        username: "error_user",
        totalTickets: 0,
        totalWon: 0,
      })
    }
  },
  disconnectWallet: () => {
    // No official disconnect method in MiniKit, just reset state
    set({
      isConnected: false,
      walletAddress: "",
      username: "",
      totalTickets: 0,
      totalWon: 0,
    })
  },
}))
