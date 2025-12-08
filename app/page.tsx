"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Stack,
  Chip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import Link from "next/link"
import Image from "next/image"
import { switchNetwork } from "@/lib/utils/wallet"
import {
  Groups as GroupsIcon,
  Style as StyleIcon,
  SportsEsports as BattleIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material"
import { WalletConnectModal } from "@/components/wallet-connect-modal"

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark}15 100%)`,
  position: "relative",
  overflow: "hidden",
}))

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  backdropFilter: "blur(10px)",
  border: `1px solid ${theme.palette.primary.main}30`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
  },
}))

const GlowButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  boxShadow: `0 4px 20px ${theme.palette.primary.main}60`,
  "&:hover": {
    boxShadow: `0 6px 30px ${theme.palette.primary.main}80`,
  },
}))

const LogoWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  filter: `drop-shadow(0 0 20px ${theme.palette.primary.main}80) drop-shadow(0 0 40px ${theme.palette.secondary.main}40)`,
  transition: "all 0.3s ease",
  "&:hover": {
    filter: `drop-shadow(0 0 30px ${theme.palette.primary.main}) drop-shadow(0 0 50px ${theme.palette.secondary.main}60)`,
    transform: "scale(1.05)",
  },
}))

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  backdropFilter: "blur(20px)",
  border: `2px solid ${theme.palette.primary.main}20`,
  borderRadius: theme.shape.borderRadius * 3,
  position: "relative",
  overflow: "hidden",
  height: "100%",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.4s ease",
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    border: `2px solid ${theme.palette.primary.main}60`,
    boxShadow: `0 12px 40px ${theme.palette.primary.main}30, 0 0 60px ${theme.palette.secondary.main}20`,
    "&::before": {
      transform: "scaleX(1)",
    },
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
  marginBottom: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}40`,
  transition: "all 0.3s ease",
  "& svg": {
    fontSize: "2rem",
    color: theme.palette.primary.main,
  },
  ".MuiCard-root:hover &": {
    transform: "rotate(360deg) scale(1.1)",
    background: `linear-gradient(135deg, ${theme.palette.primary.main}40, ${theme.palette.secondary.main}40)`,
    boxShadow: `0 0 30px ${theme.palette.primary.main}60`,
  },
}))

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: "3rem",
  fontWeight: 800,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  marginBottom: theme.spacing(1),
  lineHeight: 1.2,
  [theme.breakpoints.down("sm")]: {
    fontSize: "2.5rem",
  },
}))

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletType, setWalletType] = useState<"browser" | "farcaster" | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      ;(window as any).ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
          setWalletType("browser")
          switchNetwork(8453)
        }
      })
    }
  }, [])

  const handleWalletConnect = (address: string, type: "browser" | "farcaster") => {
    setWalletAddress(address)
    setWalletConnected(true)
    setWalletType(type)
    console.log("[v0] Wallet connected:", address, "Type:", type)
  }

  const disconnectWallet = () => {
    setWalletAddress("")
    setWalletConnected(false)
    setWalletType(null)
    console.log("[v0] Wallet disconnected")
  }

  const connectWallet = () => {
    setShowWalletModal(true)
  }

  const stats = [
    { label: "Active Players", value: "12,453", icon: <GroupsIcon />, color: "#00ffff" },
    { label: "NFTs Minted", value: "45,892", icon: <StyleIcon />, color: "#ff00ff" },
    { label: "Battles Today", value: "8,234", icon: <BattleIcon />, color: "#00ff88" },
    { label: "Prize Pool", value: "50 ETH", icon: <TrophyIcon />, color: "#ffaa00" },
  ]

  return (
    <Box>
      <WalletConnectModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />

      <AppBar
        position="static"
        sx={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(20px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(0, 255, 255, 0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 2 }}>
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              filter: "drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))",
              transition: "all 0.3s ease",
              "&:hover": {
                filter: "drop-shadow(0 0 25px rgba(0, 255, 255, 0.9))",
                transform: "scale(1.05)",
              },
            }}
          >
            <Image
              src="/images/walking-character.gif"
              alt="Walking Character"
              width={60}
              height={80}
              priority
              unoptimized
            />
          </Box>
          <Stack direction="row" spacing={2}>
            <Link href="/leaderboard" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" color="primary">
                Leaderboard
              </Button>
            </Link>
            {walletConnected ? (
              <>
                <Button variant="outlined" color="primary" disabled>
                  {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </Button>
                <Button variant="contained" color="error" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <HeroSection>
        <Container maxWidth="lg" sx={{ pt: 8, pb: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <LogoWrapper
              sx={{
                filter: "drop-shadow(0 0 30px rgba(0, 255, 255, 0.9)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.6))",
              }}
            >
              <Image src="/images/logo.png" alt="Destiny War" width={400} height={120} priority />
            </LogoWrapper>
          </Box>
        </Container>

        <Container maxWidth="lg" sx={{ pb: 8, textAlign: "center" }}>
          <Chip label="Mint-to-Play NFT Game" color="primary" sx={{ mb: 3, fontSize: "0.875rem", fontWeight: 600 }} />
          <Typography variant="h1" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
            Battle. Mint. Conquer.
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 800, mx: "auto" }}>
            Enter the arena of Destiny War. Mint unique warrior NFTs and battle your way to the top of the leaderboard.
            Every character is yours to own, trade, and dominate with.
          </Typography>
          <Stack direction="row" spacing={3} justifyContent="center">
            <Link href={walletConnected ? "/play" : "#"} passHref style={{ textDecoration: "none" }}>
              <GlowButton variant="contained" size="large" disabled={!walletConnected}>
                Start Playing
              </GlowButton>
            </Link>
            <Link href="/mint" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="large" color="primary">
                Mint Character
              </Button>
            </Link>
          </Stack>
          {!walletConnected && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Connect your wallet to start playing
            </Typography>
          )}
        </Container>

        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: "linear-gradient(135deg, #00ffff, #ff00ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Live Stats
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time game statistics from the battlefield
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center" alignItems="stretch">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={stat.label} sx={{ display: "flex" }}>
                <StatsCard
                  sx={{
                    width: "100%",
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`,
                    "@keyframes fadeInUp": {
                      from: {
                        opacity: 0,
                        transform: "translateY(30px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      py: { xs: 3, sm: 4, md: 5 },
                      px: { xs: 2, sm: 3 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconWrapper>{stat.icon}</IconWrapper>
                    <StatValue>{stat.value}</StatValue>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container maxWidth="md" sx={{ py: 8 }}>
          <StyledCard>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h3" gutterBottom>
                Ready to Fight?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Join thousands of warriors in the ultimate battle arena
              </Typography>
              <GlowButton variant="contained" size="large" onClick={connectWallet} disabled={walletConnected}>
                {walletConnected ? "Wallet Connected" : "Connect & Play"}
              </GlowButton>
            </CardContent>
          </StyledCard>
        </Container>
      </HeroSection>

      <Box sx={{ borderTop: 1, borderColor: "divider", py: 4, mt: 8, background: "rgba(0, 0, 0, 0.3)" }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <LogoWrapper
              sx={{ filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))", "&:hover": { transform: "scale(1.02)" } }}
            >
              <Image src="/images/logo.png" alt="Destiny War" width={160} height={48} />
            </LogoWrapper>
            <Typography variant="body2" color="text.secondary">
              © 2025 Destiny War. All rights reserved.
            </Typography>
            <Chip
              label="Built on Base"
              color="primary"
              variant="outlined"
              size="small"
              sx={{
                borderColor: "primary.main",
                fontWeight: 600,
              }}
            />
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
