"use client"

import type { ReactNode } from "react"
import { AuthKitProvider } from "@farcaster/auth-kit"

interface FarcasterAuthProviderProps {
  children: ReactNode
}

export function FarcasterAuthProvider({ children }: FarcasterAuthProviderProps) {
  const config = {
    rpcUrl: "https://mainnet.base.org",
    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000",
    siweUri: process.env.NEXT_PUBLIC_SIWE_URI || "http://localhost:3000/login",
  }

  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
