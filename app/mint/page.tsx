"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { mintCharacter, getProvider, MINT_PRICE } from "@/lib/contracts/nft-mint"
import { ethers } from "ethers"
import { WalletConnectModal } from "@/components/wallet-connect-modal"
import { useRouter } from "next/navigation"

const CHARACTERS = [
  {
    id: 1,
    name: "Blaze & Spark",
    class: "Striker Team",
    rarity: "Legendary",
    stats: { attack: 95, defense: 60, speed: 98, hp: 450 },
    price: "0.0001 ETH",
    description: "High-energy duo with explosive combo attacks",
    image: "/images/team1.png",
    color: "from-pink-500 to-orange-500",
  },
  {
    id: 2,
    name: "Terra & Hunter",
    class: "Nature Warriors",
    rarity: "Epic",
    stats: { attack: 88, defense: 75, speed: 80, hp: 650 },
    price: "0.0001 ETH",
    description: "Earth guardians with balanced offense and defense",
    image: "/images/team2.png",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: 3,
    name: "Mystic & Oracle",
    class: "Magic Wielders",
    rarity: "Legendary",
    stats: { attack: 92, defense: 65, speed: 85, hp: 550 },
    price: "0.0001 ETH",
    description: "Powerful sorcerers with devastating spell combos",
    image: "/images/team3.png",
    color: "from-purple-500 to-blue-500",
  },
]

export default function MintPage() {
  const router = useRouter()
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [error, setError] = useState<string>("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      ;(window as any).ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
        }
      })
    }
  }, [])

  const handleWalletConnect = (address: string, type: "browser" | "farcaster") => {
    setWalletAddress(address)
    setWalletConnected(true)
    console.log("[v0] Wallet connected on mint page:", address, "Type:", type)
  }

  const disconnectWallet = () => {
    setWalletAddress("")
    setWalletConnected(false)
    console.log("[v0] Wallet disconnected on mint page")
  }

  const handleMint = async () => {
    if (!selectedCharacter) return

    if (!walletConnected) {
      setShowWalletModal(true)
      return
    }

    setIsMinting(true)
    setError("")
    setTxHash("")

    try {
      const provider = await getProvider()
      console.log("[v0] Minting character ID:", selectedCharacter)
      console.log("[v0] Wallet address:", walletAddress)

      const result = await mintCharacter(selectedCharacter, provider)

      console.log("[v0] Mint result:", result)
      setTxHash(result.transactionHash)
      setMintedTokenId(result.tokenId)
      setMintSuccess(true)
    } catch (err: any) {
      console.error("[v0] Minting error:", err)
      setError(err.message || "Failed to mint NFT. Please try again.")
      setIsMinting(false)
    } finally {
      setIsMinting(false)
    }
  }

  const handleStartPlaying = () => {
    router.push("/play")
  }

  const selected = CHARACTERS.find((c) => c.id === selectedCharacter)

  return (
    <div className="min-h-screen">
      <WalletConnectModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <Image src="/images/logo.png" alt="Destiny War" width={150} height={45} className="h-10 w-auto" />
          <div className="flex items-center gap-2">
            {walletConnected ? (
              <>
                <span className="text-xs text-muted-foreground">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <Button size="sm" variant="outline" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowWalletModal(true)}>
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Character Grid */}
        <div className="mb-12">
          <h2 className="mb-2 text-3xl font-bold">Choose Your Team</h2>
          <p className="mb-8 text-muted-foreground">
            Select a warrior team to mint as your NFT. Each team costs {ethers.formatEther(MINT_PRICE)} ETH on Base
            mainnet.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {CHARACTERS.map((character) => (
              <Card
                key={character.id}
                className={`cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg ${
                  selectedCharacter === character.id ? "border-primary bg-primary/5 shadow-lg" : "border-border"
                }`}
                onClick={() => setSelectedCharacter(character.id)}
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-background to-muted">
                  <Image
                    src={character.image || "/placeholder.svg"}
                    alt={character.name}
                    fill
                    className="object-contain p-4"
                  />
                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        character.rarity === "Legendary"
                          ? "bg-amber-500 text-amber-950"
                          : character.rarity === "Epic"
                            ? "bg-purple-500 text-purple-950"
                            : "bg-blue-500 text-blue-950"
                      }`}
                    >
                      {character.rarity}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-bold">{character.name}</h3>
                    <span className="text-sm text-muted-foreground">{character.class}</span>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">{character.description}</p>

                  {/* Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ATK</span>
                      <span className="font-bold">{character.stats.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DEF</span>
                      <span className="font-bold">{character.stats.defense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SPD</span>
                      <span className="font-bold">{character.stats.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">HP</span>
                      <span className="font-bold">{character.stats.hp}</span>
                    </div>
                  </div>

                  <div className="text-lg font-bold text-primary">{character.price}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mint Section */}
        {selectedCharacter && (
          <Card className="sticky bottom-6 border-primary/50 bg-card/95 p-6 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold">Selected: {selected?.name}</h3>
                <p className="text-muted-foreground">
                  {selected?.class} • {selected?.rarity} • {selected?.price}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                {mintSuccess ? (
                  <Button size="lg" onClick={handleStartPlaying} className="min-w-40 gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Start Playing
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleMint} disabled={isMinting} className="min-w-40 gap-2">
                    {isMinting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Minting...
                      </>
                    ) : !walletConnected ? (
                      "Connect Wallet to Mint"
                    ) : (
                      "Mint NFT"
                    )}
                  </Button>
                )}
                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View on Basescan
                  </a>
                )}
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            </div>
          </Card>
        )}

        {!selectedCharacter && (
          <div className="pb-8 text-center text-muted-foreground">Select a team above to continue</div>
        )}
      </div>

      <Footer />
    </div>
  )
}
