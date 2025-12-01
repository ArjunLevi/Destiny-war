"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { sdk } from "@farcaster/frame-sdk"

export function FarcasterMiniAppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [context, setContext] = useState<any>(null)

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Initialize the Farcaster SDK
        const farcasterContext = await sdk.context

        // Get user information if available
        if (farcasterContext?.user) {
          console.log("[v0] Farcaster user detected:", farcasterContext.user)
          setContext(farcasterContext)
        }

        // Signal that the app is ready
        await sdk.actions.ready()
        setIsReady(true)
        console.log("[v0] Farcaster Mini App initialized")
      } catch (error) {
        console.error("[v0] Failed to initialize Farcaster Mini App:", error)
        // If not in Farcaster, continue normally
        setIsReady(true)
      }
    }

    initFarcaster()
  }, [])

  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#00ffff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Loading Destiny War...</h2>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook to access Farcaster context
export function useFarcasterContext() {
  const [context, setContext] = useState<any>(null)

  useEffect(() => {
    sdk.context.then((ctx) => setContext(ctx)).catch(() => setContext(null))
  }, [])

  return context
}

// Function to trigger Farcaster notifications
export async function sendNotification(title: string, body: string) {
  try {
    await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(body)}`)
  } catch (error) {
    console.error("[v0] Failed to send notification:", error)
  }
}
