"use client"

import type { ReactNode } from "react"
import { AuthKitProvider } from "@farcaster/auth-kit"

interface FarcasterAuthProviderProps {
  children: ReactNode
}

export function FarcasterAuthProvider({ children }: FarcasterAuthProviderProps) {
  const config = {
    rpcUrl: "https://mainnet.base.org",
    domain: process.env.NEXT_PUBLIC_DOMAIN || "destinywar.app",
    siweUri: process.env.NEXT_PUBLIC_SIWE_URI || "https://destinywar.app/login",
  }

  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
