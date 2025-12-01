"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Play, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

// Mock user's minted NFTs
const OWNED_CHARACTERS = [
  {
    id: 1,
    tokenId: "#4521",
    name: "Shadow Striker",
    class: "Assassin",
    level: 12,
    wins: 45,
    losses: 18,
    stats: { attack: 95, defense: 60, speed: 98, hp: 450 },
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    tokenId: "#7893",
    name: "Plasma Mage",
    class: "Sorcerer",
    level: 8,
    wins: 23,
    losses: 12,
    stats: { attack: 92, defense: 55, speed: 75, hp: 500 },
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: 4,
    tokenId: "#2341",
    name: "Cyber Samurai",
    class: "Warrior",
    level: 15,
    wins: 67,
    losses: 21,
    stats: { attack: 88, defense: 72, speed: 80, hp: 650 },
    color: "from-red-500 to-orange-500",
  },
]

export default function PlayPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null)

  const selected = OWNED_CHARACTERS.find((c) => c.id === selectedCharacter)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <Image src="/images/logo.png" alt="Destiny War" width={150} height={45} className="h-10 w-auto" />
          <div className="w-24" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Character Collection */}
        <div className="mb-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Your Warriors</h2>
              <p className="text-muted-foreground">Choose a character to enter the battle arena</p>
            </div>
            <Link href="/mint">
              <Button variant="outline">Mint New Character</Button>
            </Link>
          </div>

          {OWNED_CHARACTERS.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="mb-4 text-2xl font-bold">No Characters Yet</h3>
              <p className="mb-6 text-muted-foreground">You need to mint a character NFT before you can play</p>
              <Link href="/mint">
                <Button size="lg">Mint Your First Character</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {OWNED_CHARACTERS.map((character) => {
                const winRate = Math.round((character.wins / (character.wins + character.losses)) * 100)

                return (
                  <Card
                    key={character.id}
                    className={`cursor-pointer border-2 transition-all hover:border-primary ${
                      selectedCharacter === character.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSelectedCharacter(character.id)}
                  >
                    {/* Character Image */}
                    <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${character.color}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-7xl font-bold text-white/20">{character.name.charAt(0)}</div>
                      </div>

                      {/* Token ID Badge */}
                      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                        {character.tokenId}
                      </div>

                      {/* Level Badge */}
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        <Star className="h-3 w-3 fill-current" />
                        LVL {character.level}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold">{character.name}</h3>
                        <span className="text-sm text-muted-foreground">{character.class}</span>
                      </div>

                      {/* Win/Loss Record */}
                      <div className="mb-4 flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-500">{character.wins}</div>
                          <div className="text-xs text-muted-foreground">Wins</div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-500">{character.losses}</div>
                          <div className="text-xs text-muted-foreground">Losses</div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{winRate}%</div>
                          <div className="text-xs text-muted-foreground">Win Rate</div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
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
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Action Bar */}
        {selectedCharacter && (
          <Card className="sticky bottom-6 border-primary/50 bg-card/95 p-6 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold">
                  {selected?.name} {selected?.tokenId}
                </h3>
                <p className="text-muted-foreground">
                  Level {selected?.level} {selected?.class} • {selected?.wins}W-
                  {selected?.losses}L
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedCharacter(null)}>
                  Cancel
                </Button>
                <Link href="/battle">
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Enter Battle
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
