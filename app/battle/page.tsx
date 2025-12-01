"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Sword, Shield, Zap, Heart, Trophy, RotateCcw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"

// Mock characters
const PLAYER_CHARACTER = {
  name: "Shadow Striker",
  class: "Assassin",
  maxHp: 450,
  hp: 450,
  attack: 95,
  defense: 60,
  speed: 98,
  color: "from-purple-500 to-pink-500",
}

const OPPONENT_CHARACTER = {
  name: "Iron Titan",
  class: "Tank",
  maxHp: 850,
  hp: 850,
  attack: 70,
  defense: 98,
  speed: 45,
  color: "from-gray-500 to-slate-700",
}

type Action = {
  attacker: string
  defender: string
  damage: number
  type: "normal" | "critical" | "blocked"
}

export default function BattlePage() {
  const [playerHp, setPlayerHp] = useState(PLAYER_CHARACTER.hp)
  const [opponentHp, setOpponentHp] = useState(OPPONENT_CHARACTER.hp)
  const [battleLog, setBattleLog] = useState<Action[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [battleState, setBattleState] = useState<"active" | "victory" | "defeat">("active")
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedMove, setSelectedMove] = useState<string | null>(null)

  const calculateDamage = (
    attacker: typeof PLAYER_CHARACTER,
    defender: typeof PLAYER_CHARACTER,
    moveType: "normal" | "heavy" | "special",
  ): { damage: number; type: Action["type"] } => {
    let baseDamage = attacker.attack
    let isCritical = false
    let isBlocked = false

    if (moveType === "heavy") {
      baseDamage *= 1.5
      // Lower accuracy
      if (Math.random() < 0.3) {
        return { damage: 0, type: "blocked" }
      }
    } else if (moveType === "special") {
      baseDamage *= 2
      isCritical = true
    }

    // Critical hit chance
    if (!isCritical && Math.random() < 0.15) {
      baseDamage *= 1.5
      isCritical = true
    }

    // Defense reduction
    const damageReduction = defender.defense / 200
    baseDamage *= 1 - damageReduction

    // Block chance
    if (Math.random() < 0.1) {
      baseDamage *= 0.3
      isBlocked = true
    }

    return {
      damage: Math.round(baseDamage),
      type: isCritical ? "critical" : isBlocked ? "blocked" : "normal",
    }
  }

  const executeAttack = (moveType: "normal" | "heavy" | "special") => {
    if (isAnimating || battleState !== "active") return

    setIsAnimating(true)
    setSelectedMove(moveType)

    setTimeout(() => {
      // Player attack
      const playerDamage = calculateDamage(PLAYER_CHARACTER, OPPONENT_CHARACTER, moveType)
      const newOpponentHp = Math.max(0, opponentHp - playerDamage.damage)
      setOpponentHp(newOpponentHp)

      const newLog: Action[] = [
        {
          attacker: PLAYER_CHARACTER.name,
          defender: OPPONENT_CHARACTER.name,
          damage: playerDamage.damage,
          type: playerDamage.type,
        },
      ]

      // Check if opponent is defeated
      if (newOpponentHp <= 0) {
        setBattleState("victory")
        setBattleLog([...battleLog, ...newLog])
        setIsAnimating(false)
        setSelectedMove(null)
        return
      }

      // Opponent counterattack
      setTimeout(() => {
        const opponentDamage = calculateDamage(OPPONENT_CHARACTER, PLAYER_CHARACTER, "normal")
        const newPlayerHp = Math.max(0, playerHp - opponentDamage.damage)
        setPlayerHp(newPlayerHp)

        newLog.push({
          attacker: OPPONENT_CHARACTER.name,
          defender: PLAYER_CHARACTER.name,
          damage: opponentDamage.damage,
          type: opponentDamage.type,
        })

        setBattleLog([...battleLog, ...newLog])

        // Check if player is defeated
        if (newPlayerHp <= 0) {
          setBattleState("defeat")
        }

        setIsAnimating(false)
        setSelectedMove(null)
      }, 800)
    }, 600)
  }

  const resetBattle = () => {
    setPlayerHp(PLAYER_CHARACTER.hp)
    setOpponentHp(OPPONENT_CHARACTER.hp)
    setBattleLog([])
    setBattleState("active")
    setIsAnimating(false)
    setSelectedMove(null)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <Link href="/play" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            Back to Selection
          </Link>
          <Image src="/images/logo.png" alt="Destiny War" width={150} height={45} className="h-10 w-auto" />
          <div className="w-32" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Battle Arena */}
        <div className="mb-8 grid gap-8 lg:grid-cols-3">
          {/* Player Character */}
          <Card className="border-primary/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{PLAYER_CHARACTER.name}</h3>
                <p className="text-sm text-muted-foreground">{PLAYER_CHARACTER.class}</p>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <Heart className="h-5 w-5" />
                <span className="text-lg font-bold">
                  {playerHp}/{PLAYER_CHARACTER.maxHp}
                </span>
              </div>
            </div>

            <Progress value={(playerHp / PLAYER_CHARACTER.maxHp) * 100} className="mb-4 h-3" />

            <div
              className={`mb-4 h-48 rounded-lg bg-gradient-to-br ${PLAYER_CHARACTER.color} flex items-center justify-center transition-transform ${
                selectedMove && isAnimating ? "scale-105" : ""
              }`}
            >
              <div className="text-7xl font-bold text-white/30">{PLAYER_CHARACTER.name.charAt(0)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ATK</span>
                <span className="font-bold">{PLAYER_CHARACTER.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DEF</span>
                <span className="font-bold">{PLAYER_CHARACTER.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SPD</span>
                <span className="font-bold">{PLAYER_CHARACTER.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HP</span>
                <span className="font-bold">{PLAYER_CHARACTER.maxHp}</span>
              </div>
            </div>
          </Card>

          {/* Battle Log */}
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 text-center text-xl font-bold">Battle Log</h3>
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {battleLog.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Choose your move to start the battle!</p>
              ) : (
                battleLog.map((action, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 text-sm ${
                      action.attacker === PLAYER_CHARACTER.name ? "bg-primary/10" : "bg-destructive/10"
                    }`}
                  >
                    <p className="font-bold">{action.attacker}</p>
                    <p className="text-muted-foreground">
                      {action.type === "critical" && "⚡ CRITICAL! "}
                      {action.type === "blocked" && "🛡️ BLOCKED! "}
                      Dealt {action.damage} damage to {action.defender}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Opponent Character */}
          <Card className="border-destructive/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{OPPONENT_CHARACTER.name}</h3>
                <p className="text-sm text-muted-foreground">{OPPONENT_CHARACTER.class}</p>
              </div>
              <div className="flex items-center gap-2 text-destructive">
                <Heart className="h-5 w-5" />
                <span className="text-lg font-bold">
                  {opponentHp}/{OPPONENT_CHARACTER.maxHp}
                </span>
              </div>
            </div>

            <Progress value={(opponentHp / OPPONENT_CHARACTER.maxHp) * 100} className="mb-4 h-3" />

            <div
              className={`mb-4 h-48 rounded-lg bg-gradient-to-br ${OPPONENT_CHARACTER.color} flex items-center justify-center transition-transform ${
                isAnimating && !selectedMove ? "scale-105" : ""
              }`}
            >
              <div className="text-7xl font-bold text-white/30">{OPPONENT_CHARACTER.name.charAt(0)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ATK</span>
                <span className="font-bold">{OPPONENT_CHARACTER.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DEF</span>
                <span className="font-bold">{OPPONENT_CHARACTER.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SPD</span>
                <span className="font-bold">{OPPONENT_CHARACTER.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HP</span>
                <span className="font-bold">{OPPONENT_CHARACTER.maxHp}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Battle Controls */}
        {battleState === "active" ? (
          <Card className="bg-card/95 p-6">
            <h3 className="mb-4 text-center text-xl font-bold">Choose Your Move</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                size="lg"
                onClick={() => executeAttack("normal")}
                disabled={isAnimating}
                className="h-auto flex-col gap-2 p-6"
              >
                <Sword className="h-8 w-8" />
                <div>
                  <div className="font-bold">Quick Attack</div>
                  <div className="text-xs text-muted">Fast, reliable damage</div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={() => executeAttack("heavy")}
                disabled={isAnimating}
                className="h-auto flex-col gap-2 p-6"
                variant="secondary"
              >
                <Shield className="h-8 w-8" />
                <div>
                  <div className="font-bold">Heavy Strike</div>
                  <div className="text-xs text-muted">1.5x damage, may miss</div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={() => executeAttack("special")}
                disabled={isAnimating}
                className="h-auto flex-col gap-2 p-6"
                variant="outline"
              >
                <Zap className="h-8 w-8" />
                <div>
                  <div className="font-bold">Special Move</div>
                  <div className="text-xs text-muted">2x critical damage</div>
                </div>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-card/95 p-12 text-center">
            {battleState === "victory" ? (
              <>
                <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h2 className="mb-4 text-4xl font-bold text-primary">Victory!</h2>
                <p className="mb-6 text-xl text-muted-foreground">You have defeated {OPPONENT_CHARACTER.name}</p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                  <RotateCcw className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="mb-4 text-4xl font-bold text-destructive">Defeat</h2>
                <p className="mb-6 text-xl text-muted-foreground">{OPPONENT_CHARACTER.name} has won the battle</p>
              </>
            )}

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={resetBattle} className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Battle Again
              </Button>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  )
}
