import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { MUIThemeProvider } from "@/lib/theme"
import { FarcasterAuthProvider } from "@/lib/farcaster/auth-provider"
import { FarcasterMiniAppProvider } from "@/lib/farcaster/miniapp-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Destiny War - Mint-to-Play NFT Battle Arena",
  description:
    "Enter the arena of Destiny War. Mint unique warrior NFTs and battle your way to the top of the leaderboard on Base Network.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_DOMAIN?.startsWith("localhost")
      ? "http://localhost:3000"
      : `https://${process.env.NEXT_PUBLIC_DOMAIN || "destinywar.app"}`,
  ),
  openGraph: {
    title: "Destiny War - Mint-to-Play NFT Battle Arena",
    description:
      "Enter the arena of Destiny War. Mint unique warrior NFTs and battle your way to the top of the leaderboard on Base Network.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destiny War - Mint-to-Play NFT Battle Arena",
    description:
      "Enter the arena of Destiny War. Mint unique warrior NFTs and battle your way to the top of the leaderboard on Base Network.",
    images: ["/og-image.jpg"],
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <FarcasterMiniAppProvider>
          <FarcasterAuthProvider>
            <MUIThemeProvider>
              {children}
              <Analytics />
            </MUIThemeProvider>
          </FarcasterAuthProvider>
        </FarcasterMiniAppProvider>
      </body>
    </html>
  )
}
