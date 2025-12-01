"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Swords } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

const LEADERBOARD_DATA = [
  {
    rank: 1,
    address: "0x742d...4a19",
    character: "Void Reaper",
    wins: 234,
    losses: 45,
    streak: 12,
    points: 18920,
    class: "Berserker",
  },
  {
    rank: 2,
    address: "0x8f3c...2b71",
    character: "Shadow Striker",
    wins: 189,
    losses: 52,
    streak: 8,
    points: 16340,
    class: "Assassin",
  },
  {
    rank: 3,
    address: "0x45a1...9c84",
    character: "Plasma Mage",
    wins: 176,
    losses: 48,
    streak: 15,
    points: 15880,
    class: "Sorcerer",
  },
  {
    rank: 4,
    address: "0x9d2e...5f36",
    character: "Cyber Samurai",
    wins: 167,
    losses: 58,
    streak: 6,
    points: 14230,
    class: "Warrior",
  },
  {
    rank: 5,
    address: "0x1c8b...7a92",
    character: "Iron Titan",
    wins: 145,
    losses: 51,
    streak: 9,
    points: 13150,
    class: "Tank",
  },
  {
    rank: 6,
    address: "0x6e4f...3d28",
    character: "Nova Ranger",
    wins: 134,
    losses: 62,
    streak: 4,
    points: 11820,
    class: "Marksman",
  },
  {
    rank: 7,
    address: "0xa7b9...8e45",
    character: "Shadow Striker",
    wins: 128,
    losses: 59,
    streak: 7,
    points: 11340,
    class: "Assassin",
  },
  {
    rank: 8,
    address: "0x2f5d...6c17",
    character: "Plasma Mage",
    wins: 119,
    losses: 64,
    streak: 3,
    points: 10570,
    class: "Sorcerer",
  },
  {
    rank: 9,
    address: "0xb3c8...4a59",
    character: "Void Reaper",
    wins: 112,
    losses: 71,
    streak: 5,
    points: 9840,
    class: "Berserker",
  },
  {
    rank: 10,
    address: "0x5a1f...2e93",
    character: "Cyber Samurai",
    wins: 108,
    losses: 68,
    streak: 2,
    points: 9520,
    class: "Warrior",
  },
]

const GLOBAL_STATS = [
  { label: "Total Battles", value: "125,432", icon: Swords },
  { label: "Active Players", value: "12,453", icon: TrendingUp },
  { label: "NFTs Minted", value: "45,892", icon: Award },
  { label: "Prize Pool", value: "50 ETH", icon: Trophy },
]

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<"all" | "week" | "month">("all")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-amber-500" />
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return (
          <div className="flex h-6 w-6 items-center justify-center text-sm font-bold text-muted-foreground">{rank}</div>
        )
    }
  }

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
        {/* Global Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-4">
          {GLOBAL_STATS.map((stat) => (
            <Card key={stat.label} className="border-border bg-card p-6">
              <div className="mb-2 flex items-center justify-between">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Top Warriors</h2>
          <div className="flex gap-2">
            {(["all", "week", "month"] as const).map((tab) => (
              <Button
                key={tab}
                variant={filter === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(tab)}
              >
                {tab === "all" ? "All Time" : tab === "week" ? "This Week" : "This Month"}
              </Button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden border-border">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/50 p-4 text-sm font-bold">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2">Character</div>
            <div className="col-span-2">Record</div>
            <div className="col-span-2">Streak</div>
            <div className="col-span-2 text-right">Points</div>
          </div>

          {/* Table Body */}
          <div>
            {LEADERBOARD_DATA.map((player) => {
              const winRate = Math.round((player.wins / (player.wins + player.losses)) * 100)

              return (
                <div
                  key={player.rank}
                  className={`grid grid-cols-12 gap-4 border-b border-border p-4 transition-colors hover:bg-secondary/30 ${
                    player.rank <= 3 ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center">{getRankIcon(player.rank)}</div>

                  {/* Player Address */}
                  <div className="col-span-3 flex flex-col justify-center">
                    <div className="font-mono text-sm font-bold">{player.address}</div>
                  </div>

                  {/* Character */}
                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="font-bold">{player.character}</div>
                    <div className="text-xs text-muted-foreground">{player.class}</div>
                  </div>

                  {/* Record */}
                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="text-sm">
                      <span className="font-bold text-green-500">{player.wins}</span>-
                      <span className="font-bold text-red-500">{player.losses}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{winRate}% Win Rate</div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 flex items-center">
                    <div className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                      {player.streak} wins
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="text-xl font-bold text-primary">{player.points.toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="mx-auto max-w-2xl border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-8">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-3 text-2xl font-bold">Claim Your Spot</h3>
            <p className="mb-6 text-muted-foreground">Battle your way to the top and earn exclusive rewards</p>
            <Link href="/play">
              <Button size="lg" className="gap-2">
                <Swords className="h-5 w-5" />
                Start Fighting
              </Button>
            </Link>
          </Card>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  )
}
