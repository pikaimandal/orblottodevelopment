'use client'

import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function MinikitStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [showStatus, setShowStatus] = useState(true)

  useEffect(() => {
    const checkInstallation = () => {
      const installed = MiniKit.isInstalled()
      setIsInstalled(installed)
    }

    checkInstallation()
    const intervalId = setInterval(checkInstallation, 1000)

    // Hide status after 10 seconds in development
    const timeoutId = setTimeout(() => {
      setShowStatus(false)
    }, 10000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [])

  // Only show warning when not running in WorldApp
  if (!showStatus || isInstalled) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-4 z-50">
      <Alert className="bg-orange-950 border-orange-900">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-500">WorldApp Not Detected</AlertTitle>
        <AlertDescription className="text-orange-300">
          This app is designed to run in WorldApp. Some features may not work properly.
        </AlertDescription>
      </Alert>
    </div>
  )
} 