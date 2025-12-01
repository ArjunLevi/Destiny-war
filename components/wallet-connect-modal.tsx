"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, Box, Button, Stack, Typography, CircularProgress } from "@mui/material"
import { styled } from "@mui/material/styles"
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material"
import { useSignIn, SignInButton } from "@farcaster/auth-kit"

const WalletButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  justifyContent: "flex-start",
  gap: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}30`,
  background: theme.palette.background.paper,
  transition: "all 0.3s ease",
  "&:hover": {
    border: `2px solid ${theme.palette.primary.main}`,
    background: `${theme.palette.primary.main}10`,
    transform: "translateY(-2px)",
    boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
  },
}))

interface WalletConnectModalProps {
  open: boolean
  onClose: () => void
  onConnect: (address: string, type: "browser" | "farcaster") => void
}

export function WalletConnectModal({ open, onClose, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<"browser" | "farcaster" | null>(null)
  const [error, setError] = useState<string>("")

  const { isSuccess, isError, data } = useSignIn({
    onSuccess: ({ fid, username }) => {
      console.log("[v0] Farcaster sign in successful:", { fid, username })
      // Generate a wallet address from Farcaster FID
      const farcasterAddress = `0xFC${fid.toString(16).padStart(38, "0")}`
      onConnect(farcasterAddress, "farcaster")
      onClose()
    },
    onError: (error) => {
      console.error("[v0] Farcaster sign in error:", error)
      setError("Failed to connect with Farcaster. Please try again.")
      setConnecting(null)
    },
  })

  const connectBrowserWallet = async () => {
    setConnecting("browser")
    setError("")

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        // Switch to Base mainnet
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }], // Base mainnet = 8453 = 0x2105
          })
        } catch (switchError: any) {
          // If Base network is not added, add it
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x2105",
                  chainName: "Base",
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org/"],
                },
              ],
            })
          } else {
            throw switchError
          }
        }

        onConnect(accounts[0], "browser")
        onClose()
      } else {
        setError("No browser wallet detected. Please install MetaMask or another Web3 wallet.")
      }
    } catch (err: any) {
      console.error("Browser wallet connection failed:", err)
      setError(err.message || "Failed to connect browser wallet")
    } finally {
      setConnecting(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 4 }}>
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 1, textAlign: "center", p: 0 }}>
          Connect Wallet
        </DialogTitle>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
          Choose your preferred wallet to connect
        </Typography>

        <Stack spacing={2}>
          <WalletButton
            fullWidth
            onClick={connectBrowserWallet}
            disabled={connecting !== null}
            startIcon={connecting === "browser" ? <CircularProgress size={20} /> : <WalletIcon />}
          >
            <Box sx={{ flex: 1, textAlign: "left" }}>
              <Typography variant="body1" fontWeight={600}>
                Browser Wallet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MetaMask, Coinbase Wallet, etc.
              </Typography>
            </Box>
          </WalletButton>

          <Box>
            <SignInButton
              onSuccess={({ fid, username }) => {
                console.log("[v0] Farcaster connected:", { fid, username })
                const farcasterAddress = `0xFC${fid.toString(16).padStart(38, "0")}`
                onConnect(farcasterAddress, "farcaster")
                onClose()
              }}
              onError={(error) => {
                console.error("[v0] Farcaster error:", error)
                setError("Failed to connect with Farcaster")
              }}
            />
          </Box>
        </Stack>

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}
